import { el, reduce, theme } from './dom';

/* The objective function behind every landscape on the site: a gently rolling surface with one Gaussian basin per
   project. The same function runs in the fragment shader (rendering) and here (the solver and the hover needle). */

export type Pt = {
  id: string; label?: string; href?: string; tag?: string;
  x: number; y: number; // x in units of height, y in 0..1
  d: number; s: number; c: number; t?: number; hidden?: boolean; current?: boolean; el?: HTMLElement;
};
type Opts = {
  points: (W: number, H: number) => Omit<Pt, 'c'>[];
  offset?: number; drift?: boolean; cue?: boolean;
  read?: HTMLElement | null;
  start?: (W: number, H: number) => [number, number][]; // opening descent starts, as fractions of W and H
  done?: (hit: Pt | null, iterations: number) => string; // readout after a descent
};

const MAXN = 12;
const FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes; uniform float uT; uniform float uOff; uniform vec4 uW[${MAXN}]; uniform int uN; out vec4 o;
float F(vec2 p){ float f=uOff+0.12*sin(2.1*p.x+0.6+uT)*cos(1.7*p.y-0.4)+0.08*sin(3.3*p.y+1.2*p.x+1.0-uT*0.7);
  for(int i=0;i<${MAXN};i++){ if(i>=uN) break; vec2 d=p-uW[i].xy; f-=uW[i].z*exp(-dot(d,d)/(2.0*uW[i].w*uW[i].w)); } return f; }
vec3 ramp(float v){ vec3 a=vec3(13.,7.,34.)/255., b=vec3(42.,22.,112.)/255., c=vec3(112.,68.,232.)/255., d=vec3(238.,107.,96.)/255., e=vec3(255.,214.,191.)/255.;
  if(v<0.3) return mix(a,b,v/0.3); if(v<0.56) return mix(b,c,(v-0.3)/0.26); if(v<0.8) return mix(c,d,(v-0.56)/0.24); return mix(d,e,(v-0.8)/0.2); }
float hash(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }
void main(){ vec2 p=vec2(gl_FragCoord.x,uRes.y-gl_FragCoord.y)/uRes.y; float n=13.; float s=clamp((F(p)+0.95)/1.2,0.,1.)*n;
  vec3 c=ramp(clamp(floor(s)/(n-1.),0.,1.)); float e=fract(s), fw=fwidth(s); float line=1.-smoothstep(0.,fw*1.4,min(e,1.-e));
  c=mix(c,c*0.7,line*0.85); c+=(hash(gl_FragCoord.xy)-0.5)*0.035; o=vec4(c,1.); }`;
const VERT = `#version 300 es
in vec2 a; void main(){ gl_Position=vec4(a,0.,1.); }`;
const STOPS: [number, number[]][] = [[0, [13, 7, 34]], [0.3, [42, 22, 112]], [0.56, [112, 68, 232]], [0.8, [238, 107, 96]], [1, [255, 214, 191]]];
function ramp(v: number) {
  for (let i = 1; i < STOPS.length; i++) if (v <= STOPS[i][0]) { const [a, A] = STOPS[i - 1], [b, B] = STOPS[i], k = (v - a) / (b - a); return A.map((q, j) => q + (B[j] - q) * k); }
  return STOPS[4][1];
}

export function landscape(root: HTMLElement, o: Opts) {
  const cv = root.querySelector('canvas')!, svg = root.querySelector('svg')!, labs = root.querySelector<HTMLElement>('.labs')!;
  const t = theme(), off = o.offset ?? 0;
  let W = 1, H = 1, pts: Pt[] = [], T = 0, vis = false, raf = 0, tok = 0, dirty = true, clicked = false;
  let gl: WebGL2RenderingContext | null = null; const loc: Record<string, WebGLUniformLocation | null> = {};
  try { gl = cv.getContext('webgl2', { antialias: false }); } catch { gl = null; }
  if (gl) {
    const sh = (type: number, src: string) => { const x = gl!.createShader(type)!; gl!.shaderSource(x, src); gl!.compileShader(x); return x; };
    const pr = gl.createProgram()!; gl.attachShader(pr, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) gl = null;
    else {
      gl.useProgram(pr); const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const a = gl.getAttribLocation(pr, 'a'); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
      ['uRes', 'uT', 'uOff', 'uW', 'uN'].forEach(n => (loc[n] = gl!.getUniformLocation(pr, n)));
    }
  }
  const ctx2 = gl ? null : cv.getContext('2d');

  const F = (x: number, y: number) => {
    let f = off + 0.12 * Math.sin(2.1 * x + 0.6 + T) * Math.cos(1.7 * y - 0.4) + 0.08 * Math.sin(3.3 * y + 1.2 * x + 1.0 - T * 0.7);
    for (const p of pts) { const dx = x - p.x, dy = y - p.y; f -= p.c * Math.exp(-(dx * dx + dy * dy) / (2 * p.s * p.s)); }
    return f;
  };
  const grad = (x: number, y: number): [number, number] => { const h = 1e-3; return [(F(x + h, y) - F(x - h, y)) / (2 * h), (F(x, y + h) - F(x, y - h)) / (2 * h)]; };

  function size() {
    const r = cv.getBoundingClientRect(); W = Math.max(1, r.width); H = Math.max(1, r.height);
    const d = gl ? Math.min(devicePixelRatio || 1, 1.5) : 0.5; cv.width = Math.round(W * d); cv.height = Math.round(H * d);
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const old = Object.fromEntries(pts.map(p => [p.id, p.c]));
    pts = o.points(W, H).map(p => ({ ...p, c: old[p.id] ?? p.d * (p.t ?? 1) }));
    labs.textContent = '';
    pts.forEach(p => {
      if (p.hidden || !p.label) return;
      const a = document.createElement(p.href ? 'a' : 'span');
      a.className = 'lab' + (p.current ? ' hit' : '');
      if (p.href) (a as HTMLAnchorElement).href = p.href;
      a.innerHTML = `<i>x*</i>${p.label}${p.tag ? `<small>${p.tag}</small>` : ''}`;
      a.style.left = p.x * H + 'px'; a.style.top = p.y * H + 'px';
      labs.appendChild(a); p.el = a;
    });
    /* keep every label inside the landscape; the minimum itself may sit nearer the edge than half a label */
    requestAnimationFrame(() => pts.forEach(p => {
      if (!p.el) return;
      const w = p.el.offsetWidth, x = Math.max(w / 2 + 6, Math.min(W - w / 2 - 6, p.x * H));
      p.el.style.left = x + 'px';
    }));
    svg.textContent = ''; dirty = true; draw();
  }
  function draw() {
    if (gl) {
      gl.viewport(0, 0, cv.width, cv.height); gl.uniform2f(loc.uRes, cv.width, cv.height); gl.uniform1f(loc.uT, T); gl.uniform1f(loc.uOff, off);
      const arr = new Float32Array(MAXN * 4); pts.slice(0, MAXN).forEach((p, i) => arr.set([p.x, p.y, p.c, p.s], i * 4));
      gl.uniform4fv(loc.uW, arr); gl.uniform1i(loc.uN, Math.min(pts.length, MAXN)); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    } else if (dirty && ctx2) {
      const w = cv.width, h = cv.height, im = ctx2.createImageData(w, h), band = new Int8Array(w * h);
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) band[j * w + i] = Math.min(12, Math.floor(Math.max(0, Math.min(1, (F((i + 0.5) / h, (j + 0.5) / h) + 0.95) / 1.2)) * 13));
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
    if (o.drift && !reduce && gl) T += 0.0016;
    if (gl || dirty) draw();
    raf = requestAnimationFrame(loop);
  }

  /* ---- the solver: heavy-ball gradient descent, two iterations drawn per frame ---- */
  function solve(x: number, y: number) {
    const path: [number, number][] = [[x, y]]; let vx = 0, vy = 0;
    for (let k = 0; k < 260; k++) {
      const [gx, gy] = grad(x, y); vx = 0.8 * vx - 0.011 * gx; vy = 0.8 * vy - 0.011 * gy; x += vx; y += vy; path.push([x, y]);
      if (Math.hypot(gx, gy) < 0.02 && Math.hypot(vx, vy) < 4e-4) break;
    }
    return path;
  }
  const nearest = ([x, y]: [number, number]) => { let best: Pt | null = null, bd = 1e9; for (const p of pts) { const d = Math.hypot(p.x - x, p.y - y); if (d < bd) { bd = d; best = p; } } return best && bd < 0.16 ? best : null; };
  const trail = el('g', {}, svg);
  function run(ux: number, uy: number, instant: boolean) {
    const my = ++tok, path = solve(ux, uy), lw = W < 600 ? 1.4 : 1.8;
    trail.textContent = '';
    const line = el('polyline', { fill: 'none', stroke: t.fg, 'stroke-width': lw, 'stroke-linejoin': 'round' }, trail), dots = el('g', { fill: t.fg }, trail);
    el('circle', { cx: ux * H, cy: uy * H, r: 5, fill: 'none', stroke: t.fg, 'stroke-width': lw }, trail);
    pts.forEach(p => p.el?.classList.toggle('hit', !!p.current));
    let i = 0;
    const finish = () => {
      const end = path[path.length - 1], hit = nearest(end);
      el('circle', { cx: end[0] * H, cy: end[1] * H, r: 9, fill: 'none', stroke: t.coral, 'stroke-width': 2.4 }, trail);
      if (hit?.el) hit.el.classList.add('hit');
      if (o.read) o.read.innerHTML = o.done ? o.done(hit, path.length - 1) : '';
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
      const starts = o.start(W, H), cur = pts.find(p => p.current);
      /* take the first start whose descent ends on the current minimum, if one is marked */
      const pick = starts.find(([a, b]) => !cur || nearest(solve(a * W / H, b).slice(-1)[0]) === cur) ?? starts[0];
      setTimeout(() => run(pick[0] * W / H, pick[1], reduce), reduce ? 0 : 500);
      if (!fine) pulse(pick[0] * W, pick[1] * H);
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
      trail.textContent = '';
      if (!raf && vis) raf = requestAnimationFrame(loop);
    },
    get touch() { return !fine; },
  };
}
