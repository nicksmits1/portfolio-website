import { el, reduce, theme } from './dom';

/* The objective functions behind every landscape on the site. The default surface is a gently rolling one with a
   Gaussian bowl per minimum; the home hero can also draw three standard test functions (Himmelblau, Rosenbrock's
   valley, a Rastrigin ripple field) and blend from one to the next. Each function runs twice: in the fragment shader
   (rendering) and here (the solver and the hover needle). Heights are normalised to 0..1, ink to peach. */

export type Pt = {
  id: string; label?: string; href?: string; tag?: string;
  x: number; y: number; // x in units of height, y in 0..1
  d: number; s: number; c: number; t?: number; hidden?: boolean; current?: boolean; el?: HTMLElement;
};
export type Kind = 'bowls' | 'himmelblau' | 'rosenbrock' | 'ripple';
/** A surface: its function, the function's parameters (in units of height) and its minima. */
export type Surface = { kind: Kind; p?: number[]; points: Omit<Pt, 'c'>[] };
type Box = { l: number; t: number; r: number; b: number }; // px, relative to the landscape
type Opts = {
  points: (W: number, H: number) => Omit<Pt, 'c'>[] | Surface;
  offset?: number; drift?: boolean; cue?: boolean;
  read?: HTMLElement | null;
  /** a block of text on the map: the surface gets a flat ink floor under it, and descents that end there hit 'contact' */
  floor?: () => Box | null;
  start?: (W: number, H: number) => [number, number][]; // opening descent starts, as fractions of W and H
  done?: (hit: Pt | null, iterations: number, auto: boolean) => string; // readout after a descent; auto for an opening one
};

const MAXN = 12, KIND: Record<Kind, number> = { bowls: 0, himmelblau: 1, rosenbrock: 2, ripple: 3 };
const LH = Math.log1p(2e4), LR = Math.log1p(1e5), FLOOR = 0.015, EDGE: [number, number] = [0.9, 1.4];
const FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes; uniform float uT, uOff, uMix, uA; uniform int uKa, uKb, uNa, uNb;
uniform vec4 uPa, uPb, uFl; uniform vec2 uFe; uniform vec4 uWa[${MAXN}], uWb[${MAXN}]; out vec4 o;
float g2(vec2 d, float s){ return exp(-dot(d,d)/(2.0*s*s)); }
float S(int k, vec4 P, vec4 W[${MAXN}], int n, vec2 p){
  if(k==1){ float u=(P.x-p.x)/P.z, w=(P.y-p.y)/P.z, a=u*u+w-11., b=u+w*w-7.; return min(1., log(1.+a*a+b*b)/${LH.toFixed(6)}); }
  if(k==2){ float u=(p.x-P.x)/P.z, w=(P.y-p.y)/P.w, a=1.-u, b=w-u*u; float v=log(1.+a*a+100.*b*b)/${LR.toFixed(6)};
    for(int i=0;i<${MAXN};i++){ if(i>=n) break; v-=W[i].z*g2(p-W[i].xy,W[i].w); } return clamp(v+.04,0.,1.); }
  if(k==3){ float bs=0.; for(int i=0;i<${MAXN};i++){ if(i>=n) break; bs=max(bs,g2(p-W[i].xy,W[i].w)); }
    float q=6.2831853/P.x, r=.075*(2.-cos(q*p.x)-cos(q*p.y))*(1.-bs); return clamp(.3+.24*p.x/uA+.12*(1.-p.y)+r-.42*bs,0.,1.); }
  float f=uOff+0.12*sin(2.1*p.x+0.6+uT)*cos(1.7*p.y-0.4)+0.08*sin(3.3*p.y+1.2*p.x+1.0-uT*0.7);
  for(int i=0;i<${MAXN};i++){ if(i>=n) break; f-=W[i].z*g2(p-W[i].xy,W[i].w); } return (f+0.95)/1.2; }
vec3 ramp(float v){ vec3 a=vec3(13.,7.,34.)/255., b=vec3(42.,22.,112.)/255., c=vec3(112.,68.,232.)/255., d=vec3(238.,107.,96.)/255., e=vec3(255.,214.,191.)/255.;
  if(v<0.3) return mix(a,b,v/0.3); if(v<0.56) return mix(b,c,(v-0.3)/0.26); if(v<0.8) return mix(c,d,(v-0.56)/0.24); return mix(d,e,(v-0.8)/0.2); }
float hash(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }
void main(){ vec2 p=vec2(gl_FragCoord.x,uRes.y-gl_FragCoord.y)/uRes.y; float n=13.;
  float v=S(uKa,uPa,uWa,uNa,p); if(uMix>0.) v=mix(v,S(uKb,uPb,uWb,uNb,p),uMix);
  if(uFe.y>0.){ float d=pow(pow(abs((p.x-uFl.x)/uFl.z),4.)+pow(abs((p.y-uFl.y)/uFl.w),4.),.25), m=1.-smoothstep(uFe.x,uFe.y,d); v=v*(1.-m)+${FLOOR}*m; }
  float s=clamp(v,0.,1.)*n; vec3 c=ramp(clamp(floor(s)/(n-1.),0.,1.)); float e=fract(s), fw=fwidth(s); float line=1.-smoothstep(0.,fw*1.4,min(e,1.-e));
  c=mix(c,c*0.7,line*0.85); c+=(hash(gl_FragCoord.xy)-0.5)*0.035; o=vec4(c,1.); }`;
const VERT = `#version 300 es
in vec2 a; void main(){ gl_Position=vec4(a,0.,1.); }`;
const STOPS: [number, number[]][] = [[0, [13, 7, 34]], [0.3, [42, 22, 112]], [0.56, [112, 68, 232]], [0.8, [238, 107, 96]], [1, [255, 214, 191]]];
function ramp(v: number) {
  for (let i = 1; i < STOPS.length; i++) if (v <= STOPS[i][0]) { const [a, A] = STOPS[i - 1], [b, B] = STOPS[i], k = (v - a) / (b - a); return A.map((q, j) => q + (B[j] - q) * k); }
  return STOPS[4][1];
}
const g2 = (dx: number, dy: number, s: number) => Math.exp(-(dx * dx + dy * dy) / (2 * s * s));
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const smooth = (a: number, b: number, x: number) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };

export function landscape(root: HTMLElement, o: Opts) {
  const cv = root.querySelector('canvas')!, svg = root.querySelector('svg')!, labs = root.querySelector<HTMLElement>('.labs')!;
  const t = theme(), off = o.offset ?? 0;
  let W = 1, H = 1, pts: Pt[] = [], T = 0, vis = false, raf = 0, tok = 0, dirty = true, clicked = false;
  let kind: Kind = 'bowls', par: number[] = [0, 0, 1, 1];
  /* the surface being blended away from during a switch, and how far the blend has gone */
  let from: { kind: Kind; par: number[]; pts: Pt[] } | null = null, mixT = 1;
  let fl: { cx: number; cy: number; rx: number; ry: number } | null = null, flBox: Box | null = null;
  let last: [number, number] | null = null; // the latest descent's start, redrawn after a resize
  let gl: WebGL2RenderingContext | null = null; const loc: Record<string, WebGLUniformLocation | null> = {};
  try { gl = cv.getContext('webgl2', { antialias: false }); } catch { gl = null; }
  if (gl) {
    const sh = (type: number, src: string) => { const x = gl!.createShader(type)!; gl!.shaderSource(x, src); gl!.compileShader(x); return x; };
    const pr = gl.createProgram()!; gl.attachShader(pr, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) gl = null;
    else {
      gl.useProgram(pr); const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const a = gl.getAttribLocation(pr, 'a'); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
      ['uRes', 'uT', 'uOff', 'uMix', 'uA', 'uKa', 'uKb', 'uNa', 'uNb', 'uPa', 'uPb', 'uFl', 'uFe', 'uWa', 'uWb'].forEach(n => (loc[n] = gl!.getUniformLocation(pr, n)));
    }
  }
  const ctx2 = gl ? null : cv.getContext('2d');
  /* the descent trail and the hover cue live in their own groups; resizing clears the trail, never the svg */
  const trail = el('g', {}, svg);

  /* one surface's height at (x, y); the same functions as the shader */
  const S = (k: Kind, p: number[], ps: Pt[], x: number, y: number) => {
    if (k === 'himmelblau') { const u = (p[0] - x) / p[2], w = (p[1] - y) / p[2], a = u * u + w - 11, b = u + w * w - 7; return Math.min(1, Math.log1p(a * a + b * b) / LH); }
    if (k === 'rosenbrock') { const u = (x - p[0]) / p[2], w = (p[1] - y) / p[3], a = 1 - u, b = w - u * u; let v = Math.log1p(a * a + 100 * b * b) / LR; for (const q of ps) v -= q.c * g2(x - q.x, y - q.y, q.s); return clamp01(v + 0.04); }
    if (k === 'ripple') { let bs = 0; for (const q of ps) bs = Math.max(bs, g2(x - q.x, y - q.y, q.s)); const qq = 2 * Math.PI / p[0], r = 0.075 * (2 - Math.cos(qq * x) - Math.cos(qq * y)) * (1 - bs); return clamp01(0.3 + 0.24 * x * H / W + 0.12 * (1 - y) + r - 0.42 * bs); }
    let f = off + 0.12 * Math.sin(2.1 * x + 0.6 + T) * Math.cos(1.7 * y - 0.4) + 0.08 * Math.sin(3.3 * y + 1.2 * x + 1.0 - T * 0.7);
    for (const q of ps) f -= q.c * g2(x - q.x, y - q.y, q.s);
    return (f + 0.95) / 1.2;
  };
  const mask = (x: number, y: number) => {
    if (!fl) return 0;
    const d = Math.pow(Math.abs((x - fl.cx) / fl.rx) ** 4 + Math.abs((y - fl.cy) / fl.ry) ** 4, 0.25);
    return 1 - smooth(EDGE[0], EDGE[1], d);
  };
  const F = (x: number, y: number) => {
    let v = S(kind, par, pts, x, y);
    if (from && mixT < 1) v = S(from.kind, from.par, from.pts, x, y) * (1 - mixT) + v * mixT;
    const m = mask(x, y);
    return m ? v * (1 - m) + FLOOR * m : v;
  };
  const grad = (x: number, y: number): [number, number] => { const h = 1e-3; return [(F(x + h, y) - F(x - h, y)) / (2 * h), (F(x, y + h) - F(x, y - h)) / (2 * h)]; };

  /* read the surface from the page; label elements are kept by id so a switch can move them */
  function read() {
    const r = o.points(W, H), s: Surface = Array.isArray(r) ? { kind: 'bowls', points: r } : r;
    const old = Object.fromEntries(pts.map(p => [p.id, p]));
    kind = s.kind; par = s.p ?? [0, 0, 1, 1];
    /* a resize keeps each minimum's current depth and its skill weight; the readout reflowing must not reset a pick */
    pts = s.points.map(p => { const q = old[p.id], t = q?.t ?? p.t; return { ...p, t, el: q?.el, c: q && q.d === p.d ? q.c : p.d * (t ?? 1) }; });
  }
  function measureFloor() {
    const b = o.floor?.() ?? null, pad = W < 700 ? 0.02 : 0.035;
    flBox = b; fl = b ? { cx: (b.l + b.r) / 2 / H, cy: (b.t + b.b) / 2 / H, rx: (b.r - b.l) / 2 / H + pad, ry: (b.b - b.t) / 2 / H + pad } : null;
  }
  function place() {
    const keep = new Set<HTMLElement>();
    pts.forEach(p => {
      if (p.hidden || !p.label) return;
      let a = p.el;
      if (!a) {
        a = document.createElement(p.href ? 'a' : 'span');
        if (p.href) (a as HTMLAnchorElement).href = p.href;
        a.innerHTML = `<i>x*</i>${p.label}${p.tag ? `<small>${p.tag}</small>` : ''}`;
        labs.appendChild(a); p.el = a;
      }
      a.className = 'lab' + (p.current ? ' hit' : '') + ((p.t ?? 1) < 0.5 ? ' off' : '');
      a.style.left = p.x * H + 'px'; a.style.top = p.y * H + 'px';
      keep.add(a);
    });
    [...labs.children].forEach(c => { if (!keep.has(c as HTMLElement)) c.remove(); });
    /* keep every label inside the landscape; the minimum itself may sit nearer the edge than half a label */
    requestAnimationFrame(() => pts.forEach(p => {
      if (!p.el) return;
      const w = p.el.offsetWidth, x = Math.max(w / 2 + 6, Math.min(W - w / 2 - 6, p.x * H));
      p.el.style.left = x + 'px';
    }));
  }
  function size() {
    const r = cv.getBoundingClientRect(); W = Math.max(1, r.width); H = Math.max(1, r.height);
    const d = gl ? Math.min(devicePixelRatio || 1, 1.5) : 0.5; cv.width = Math.round(W * d); cv.height = Math.round(H * d);
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    from = null; mixT = 1;
    read(); measureFloor(); place();
    trail.textContent = ''; dirty = true; draw();
    if (last) run(last[0], last[1], true);
  }
  const pack = (ps: Pt[]) => { const arr = new Float32Array(MAXN * 4); ps.slice(0, MAXN).forEach((p, i) => arr.set([p.x, p.y, p.c, p.s], i * 4)); return arr; };
  function draw() {
    if (gl) {
      gl.viewport(0, 0, cv.width, cv.height); gl.uniform2f(loc.uRes, cv.width, cv.height); gl.uniform1f(loc.uT, T); gl.uniform1f(loc.uOff, off); gl.uniform1f(loc.uA, W / H);
      /* the shader blends from surface b (the old one) into a (the current one) as uMix falls to 0 */
      gl.uniform1i(loc.uKa, KIND[kind]); gl.uniform4fv(loc.uPa, new Float32Array([...par, 0, 0, 0, 0].slice(0, 4))); gl.uniform4fv(loc.uWa, pack(pts)); gl.uniform1i(loc.uNa, Math.min(pts.length, MAXN));
      const b = from && mixT < 1 ? from : null;
      gl.uniform1f(loc.uMix, b ? 1 - mixT : 0);
      if (b) { gl.uniform1i(loc.uKb, KIND[b.kind]); gl.uniform4fv(loc.uPb, new Float32Array([...b.par, 0, 0, 0, 0].slice(0, 4))); gl.uniform4fv(loc.uWb, pack(b.pts)); gl.uniform1i(loc.uNb, Math.min(b.pts.length, MAXN)); }
      gl.uniform4f(loc.uFl, fl?.cx ?? 0, fl?.cy ?? 0, fl?.rx ?? 1, fl?.ry ?? 1); gl.uniform2f(loc.uFe, EDGE[0], fl ? EDGE[1] : 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    } else if (dirty && ctx2) {
      const w = cv.width, h = cv.height, im = ctx2.createImageData(w, h), band = new Int8Array(w * h);
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) band[j * w + i] = Math.min(12, Math.floor(clamp01(F((i + 0.5) / h, (j + 0.5) / h)) * 13));
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
        const k = j * w + i, b = band[k], c = ramp(b / 12), e = (i < w - 1 && band[k + 1] !== b) || (j < h - 1 && band[k + w] !== b) ? 0.75 : 1;
        im.data[k * 4] = c[0] * e; im.data[k * 4 + 1] = c[1] * e; im.data[k * 4 + 2] = c[2] * e; im.data[k * 4 + 3] = 255;
      }
      ctx2.putImageData(im, 0, 0); dirty = false;
    }
  }
  function loop() {
    if (!vis) { raf = 0; return; }
    let moving = false;
    pts.forEach(p => { const target = p.d * (p.t ?? 1); if (Math.abs(target - p.c) > 0.002) { p.c += (target - p.c) * (reduce ? 1 : 0.35); moving = true; } });
    if (moving) dirty = true;
    if (o.drift && !reduce && gl && kind === 'bowls') T += 0.0016;
    if (gl || dirty) draw();
    raf = requestAnimationFrame(loop);
  }

  /* ---- the solver: heavy-ball gradient descent, two iterations drawn per frame. The step is 0.011, capped by the
     surface's stiffest curvature and by a top speed, so the steep test functions stay stable. ---- */
  function solve(x: number, y: number) {
    const path: [number, number][] = [[x, y]], cap = W < 700 ? 0.018 : 0.025, R = W / H; let vx = 0, vy = 0;
    const curv = (x: number, y: number, dx: number, dy: number) => { const h = 2e-3, [ax, ay] = grad(x + dx * h, y + dy * h), [bx, by] = grad(x - dx * h, y - dy * h); return Math.abs(((ax - bx) * dx + (ay - by) * dy) / (2 * h)); };
    for (let k = 0; k < 600; k++) {
      const [gx, gy] = grad(x, y), g = Math.hypot(gx, gy); let lr = 0.011;
      if (g > 1e-9) { const ux = gx / g, uy = gy / g, kap = Math.max(curv(x, y, ux, uy), curv(x, y, -uy, ux)); if (kap > 0) lr = Math.min(lr, 0.45 / kap); }
      vx = 0.8 * vx - lr * gx; vy = 0.8 * vy - lr * gy;
      const sp = Math.hypot(vx, vy); if (sp > cap) { vx *= cap / sp; vy *= cap / sp; }
      x = Math.max(0, Math.min(R, x + vx)); y = Math.max(0, Math.min(1, y + vy)); path.push([x, y]);
      if (g < 0.02 && Math.hypot(vx, vy) < 4e-4) break;
      if (k > 40 && g < 0.1) { const q = path[path.length - 12]; if (Math.hypot(x - q[0], y - q[1]) < 0.0015) break; } // settled in a minimum, jitter aside
    }
    return path;
  }
  const contact: Pt = { id: 'contact', hidden: true, x: 0, y: 0, d: 0, s: 1, c: 0 };
  const nearest = ([x, y]: [number, number]) => {
    let best: Pt | null = null, bd = 1e9; for (const p of pts) { const d = Math.hypot(p.x - x, p.y - y); if (d < bd) { bd = d; best = p; } }
    if (best && bd < (kind === 'bowls' ? 0.16 : 0.1)) return best;
    return fl && mask(x, y) > 0.4 ? contact : null;
  };
  const crosses = (path: [number, number][]) => !!flBox && path.some(([x, y]) => x * H > flBox!.l - 12 && x * H < flBox!.r + 12 && y * H > flBox!.t - 12 && y * H < flBox!.b + 12);
  function run(ux: number, uy: number, instant: boolean, auto = false) {
    const my = ++tok, path = solve(ux, uy), lw = W < 600 ? 1.4 : 1.8;
    last = [ux, uy];
    trail.textContent = '';
    const line = el('polyline', { fill: 'none', stroke: t.fg, 'stroke-width': lw, 'stroke-linejoin': 'round' }, trail), dots = el('g', { fill: t.fg }, trail);
    el('circle', { cx: ux * H, cy: uy * H, r: 5, fill: 'none', stroke: t.fg, 'stroke-width': lw }, trail);
    pts.forEach(p => p.el?.classList.toggle('hit', !!p.current));
    let i = 0;
    const finish = () => {
      const end = path[path.length - 1], hit = nearest(end);
      el('circle', { cx: end[0] * H, cy: end[1] * H, r: 9, fill: 'none', stroke: t.coral, 'stroke-width': 2.4 }, trail);
      if (hit?.el) hit.el.classList.add('hit');
      if (o.read) o.read.innerHTML = o.done ? o.done(hit, path.length - 1, auto) : '';
    };
    const step = () => {
      if (my !== tok) return;
      const n = instant ? path.length : Math.min(path.length, i + 2);
      for (; i < n; i++) el('circle', { cx: path[i][0] * H, cy: path[i][1] * H, r: W < 600 ? 1.7 : 2.1 }, dots);
      line.setAttribute('points', path.slice(0, i).map(p => (p[0] * H).toFixed(1) + ',' + (p[1] * H).toFixed(1)).join(' '));
      if (i < path.length) { if (o.read) o.read.innerHTML = `Iteration <b>${i}</b>, <i class="m">f</i> = <b>${F(path[i - 1][0], path[i - 1][1]).toFixed(3)}</b>`; requestAnimationFrame(step); }
      else finish();
    };
    step();
  }
  /* the opening descent: the first start that ends on the current minimum, if one is marked; otherwise the first that
     ends on a labelled minimum without running through the text block; otherwise the first start */
  function opening(instant: boolean) {
    if (!o.start) return;
    const starts = o.start(W, H), cur = pts.find(p => p.current), R = W / H;
    const ok = ([a, b]: [number, number]) => {
      const path = solve(a * R, b), hit = nearest(path[path.length - 1]);
      return cur ? hit === cur : !!hit && !hit.hidden && !crosses(path);
    };
    const pick = starts.find(ok) ?? starts[0];
    run(pick[0] * R, pick[1], instant, true);
    return pick;
  }

  /* ---- hover cue (A + C): the pointer becomes the start ring x0, with the downhill needle -grad f ---- */
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  let cueG: SVGGElement | null = null, hint: HTMLElement | null = null;
  if (o.cue && fine) {
    root.classList.add('cue');
    cueG = el('g', { 'pointer-events': 'none' }, svg); cueG.style.display = 'none';
    hint = document.createElement('span'); hint.className = 'cue-hint'; hint.setAttribute('aria-hidden', 'true'); root.appendChild(hint);
  }
  function cue(px: number, py: number) {
    if (!cueG || !hint) return;
    cueG.textContent = ''; cueG.style.display = '';
    const [gx, gy] = grad(px / H, py / H), g = Math.hypot(gx, gy), L = Math.min(48, g * 55);
    el('circle', { cx: px, cy: py, r: 6.5, fill: 'none', stroke: t.coral, 'stroke-width': 1.8 }, cueG);
    if (L > 6) {
      const ux = -gx / g, uy = -gy / g, x0 = px + ux * 8, y0 = py + uy * 8, tx = px + ux * (L + 8), ty = py + uy * (L + 8);
      el('line', { x1: x0, y1: y0, x2: tx, y2: ty, stroke: t.fg, 'stroke-width': 1.8, 'stroke-linecap': 'round' }, cueG);
      el('path', { d: `M${tx + ux * 3} ${ty + uy * 3} L${tx - ux * 7 - uy * 4.5} ${ty - uy * 7 + ux * 4.5} L${tx - ux * 7 + uy * 4.5} ${ty - uy * 7 - ux * 4.5} Z`, fill: t.fg }, cueG);
    } else el('circle', { cx: px, cy: py, r: 1.8, fill: t.coral }, cueG);
    hint.innerHTML = clicked ? '<i>x</i>₀' : '<i>x</i>₀ click to descend';
    const w = hint.offsetWidth, left = px + 16 + w > W ? px - 16 - w : px + 16;
    hint.style.transform = `translate(${left}px,${py + 12}px)`; hint.style.opacity = '1';
  }
  const local = (e: PointerEvent | MouseEvent) => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  root.addEventListener('pointermove', e => {
    if (!cueG || e.pointerType !== 'mouse') return;
    if ((e.target as Element).closest('a,button')) { cueG.style.display = 'none'; if (hint) hint.style.opacity = '0'; return; }
    const [x, y] = local(e); cue(x, y);
  });
  root.addEventListener('pointerleave', () => { if (cueG) cueG.style.display = 'none'; if (hint) hint.style.opacity = '0'; });
  root.addEventListener('click', e => {
    if ((e.target as Element).closest('a,button')) return;
    const [x, y] = local(e); clicked = true; run(x / H, y / H, reduce);
    if (cueG) cue(x, y);
  });

  let lw = 0, lh = 0, started = false;
  new ResizeObserver(() => {
    const r = cv.getBoundingClientRect(); if (Math.round(r.width) === lw && Math.round(r.height) === lh) return;
    lw = Math.round(r.width); lh = Math.round(r.height); size();
    if (!started && o.start) {
      started = true;
      setTimeout(() => { const pick = opening(reduce); if (pick && !fine) pulse(pick[0] * W, pick[1] * H); }, reduce ? 0 : 500);
    }
  }).observe(cv);
  new IntersectionObserver(es => es.forEach(e => { vis = e.isIntersecting; if (vis && !raf) raf = requestAnimationFrame(loop); })).observe(root);

  /* touch: one pulse where the opening descent starts */
  function pulse(x: number, y: number) {
    if (reduce) return;
    const c = el('circle', { cx: x, cy: y, r: 6, fill: 'none', stroke: t.fg, 'stroke-width': 1.6, class: 'pulse' }, svg);
    setTimeout(() => c.remove(), 2600);
  }

  return {
    run,
    setWeights(w: Record<string, number> | null) {
      pts.forEach(p => { p.t = !w || p.hidden ? 1 : (w[p.id] ?? 1); p.el?.classList.toggle('off', (p.t ?? 1) < 0.5); });
      trail.textContent = ''; last = null;
      if (!raf && vis) raf = requestAnimationFrame(loop);
    },
    /** Re-reads the surface from points() and blends into it over about 0.7 s (at once under reduced motion or
        without WebGL), the labels gliding to their new minima; then a fresh opening descent runs. */
    morph() {
      tok++; trail.textContent = ''; last = null;
      from = { kind, par, pts: pts.map(p => ({ ...p })) };
      read();
      const glide = !reduce && !!gl;
      labs.classList.toggle('glide', glide); place();
      const done = () => { from = null; mixT = 1; dirty = true; draw(); labs.classList.remove('glide'); setTimeout(() => opening(reduce), glide ? 150 : 0); };
      if (!glide) return done();
      const t0 = performance.now();
      const f = (now: number) => { const k = Math.min(1, (now - t0) / 700); mixT = 1 - Math.pow(1 - k, 3); dirty = true; if (k < 1) requestAnimationFrame(f); else done(); };
      mixT = 0; requestAnimationFrame(f);
    },
    get touch() { return !fine; },
  };
}
