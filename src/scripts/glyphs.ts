import { mountAll, reduce, whileVisible } from './dom';

/* Character-grid headers for the list pages (Publications, Experience): a canvas of monospace cells coloured from the
   13-band contour ramp, after ascii-magic's character renderings. The title, the name tab and the nav stay HTML; the
   grid keeps a calm patch under each of them (The Calm Basin Rule). Every generator draws a still for reduced motion.
   Host: <div data-glyphs="strata" data-layers='[...]'> holding a <canvas>, inside the header. */

const STOPS = ['#0D0722', '#2A1670', '#7044E8', '#EE6B60', '#FFD6BF'];
const hex = (h: string) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
export const BANDS = Array.from({ length: 13 }, (_, k) => {
  const u = (k / 12) * 4, i = Math.min(3, Math.floor(u)), a = hex(STOPS[i]), b = hex(STOPS[i + 1]), w = u - i;
  return `rgb(${a.map((v, j) => Math.round(v + (b[j] - v) * w)).join(',')})`;
});
const BG = '#120A2A', FG = '#F3EDFF', FG2 = '#B9AAE8', DIM = '#7C6BB8', CORAL = '#FF7C6B', PEACH = '#FFD9C2';

type Weight = boolean | 'math';
type Box = { c0: number; c1: number; r0: number; r1: number };
export type Grid = {
  cols: number; rows: number; cw: number; ch: number; W: number; H: number; phone: boolean;
  /** 0 under the title, tabs and nav, rising to 1 a few cells away. */
  calm(c: number, r: number): number;
  /** w: true for bold, 'math' for STIX Two italic (variables in annotations). */
  put(c: number, r: number, ch: string, color: string, w?: Weight): void;
  text(c: number, r: number, s: string, color: string, w?: Weight): void;
  /** Right edge and top of the title block, in cells. */
  titleRight: number; titleTop: number;
};
type Draw = (t: number, still: boolean) => void;
type Gen = (g: Grid, host: HTMLElement) => Draw;

function grid(host: HTMLElement, cv: HTMLCanvasElement) {
  const ctx = cv.getContext('2d')!;
  const header = host.closest('header') ?? host;
  let chr: string[] = [], col: (string | null)[] = [], bold: Uint8Array = new Uint8Array(0), boxes: Box[] = [];
  const g = { cols: 0, rows: 0, cw: 0, ch: 0, W: 0, H: 0, phone: false, titleRight: 0, titleTop: 0, fs: 12 } as Grid & { fs: number };
  const resize = () => {
    const r = host.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
    g.W = r.width; g.H = r.height; g.phone = r.width < 600; g.fs = g.phone ? 10 : 12;
    cv.width = Math.round(g.W * dpr); cv.height = Math.round(g.H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.cw = g.fs * 0.6; g.ch = g.fs * 1.18; g.cols = Math.ceil(g.W / g.cw); g.rows = Math.ceil(g.H / g.ch);
    chr = new Array(g.cols * g.rows).fill(' '); col = new Array(g.cols * g.rows).fill(null); bold = new Uint8Array(g.cols * g.rows);
    const cell = (b: DOMRect, p: number): Box => ({ c0: (b.left - r.left) / g.cw - p, c1: (b.right - r.left) / g.cw + p, r0: (b.top - r.top) / g.ch - p * 0.55, r1: (b.bottom - r.top) / g.ch + p * 0.55 });
    const title = header.querySelector<HTMLElement>('.title');
    boxes = [];
    if (title) {
      // the text itself, not the block's full width
      const kids = [...title.children].map(k => { const rg = document.createRange(); rg.selectNodeContents(k); return rg.getBoundingClientRect(); }).filter(b => b.width);
      const tb = kids.reduce((a, b) => new DOMRect(Math.min(a.left, b.left), Math.min(a.top, b.top), Math.max(a.right, b.right) - Math.min(a.left, b.left), Math.max(a.bottom, b.bottom) - Math.min(a.top, b.top)));
      boxes.push(cell(tb, 3)); g.titleRight = (tb.right - r.left) / g.cw; g.titleTop = (tb.top - r.top) / g.ch;
    }
    for (const s of ['.tab-name', '.nav']) { const e = header.querySelector(s); if (e) boxes.push(cell(e.getBoundingClientRect(), 1)); }
  };
  g.calm = (c, r) => { let m = 1; for (const b of boxes) { const dx = Math.max(b.c0 - c, 0, c - b.c1), dy = Math.max(b.r0 - r, 0, r - b.r1) * 1.8; m = Math.min(m, Math.min(1, Math.hypot(dx, dy) / 5)); } return m; };
  g.put = (c, r, s, color, w = false) => { c = Math.round(c); r = Math.round(r); if (c < 0 || r < 0 || c >= g.cols || r >= g.rows) return; const i = r * g.cols + c; chr[i] = s; col[i] = color; bold[i] = w === 'math' ? 2 : w ? 1 : 0; };
  g.text = (c, r, s, color, w = false) => { for (let k = 0; k < s.length; k++) g.put(c + k, r, s[k], color, w); };
  const clear = () => { chr.fill(' '); col.fill(null); bold.fill(0); };
  const render = () => {
    ctx.fillStyle = BG; ctx.fillRect(0, 0, g.W, g.H); ctx.textBaseline = 'top';
    const fonts = [`400 ${g.fs}px "JetBrains Mono", ui-monospace, Menlo, monospace`, `600 ${g.fs}px "JetBrains Mono", ui-monospace, Menlo, monospace`, `italic ${g.fs * 1.2}px "STIX Two Text", "Times New Roman", serif`];
    let cur = -1;
    for (let r = 0; r < g.rows; r++) for (let c = 0; c < g.cols; c++) {
      const i = r * g.cols + c; if (chr[i] === ' ' || !col[i]) continue;
      if (bold[i] !== cur) { cur = bold[i]; ctx.font = fonts[cur]; }
      ctx.fillStyle = col[i]!; ctx.fillText(chr[i], c * g.cw, r * g.ch + (cur === 2 ? -1 : 1));
    }
  };
  return { g, resize, clear, render };
}

/* Experience: each Experience and Education entry a sediment layer, oldest at the bottom, in its own shade character
   and band colour, labelled at the right edge. The newest layer is still being laid: characters fall and settle on it. */
type Layer = { short: string; years: string };
const strata: Gen = (g, host) => {
  const layers: Layer[] = JSON.parse(host.dataset.layers || '[]');
  const TEX = ['░', '▒', '▓'];
  const band = (k: number) => Math.round(3 + (k / Math.max(1, layers.length - 1)) * 8);
  const noise = (c: number, k: number) => Math.sin(c * 0.07 + k * 1.7) * 1.2 + Math.sin(c * 0.19 + k * 0.6) * 0.6;
  let grains: { c: number; r: number; v: number }[] = [];
  return (t, still) => {
    const n = layers.length, top = 4, bot = g.phone ? Math.min(g.rows - 2, g.titleTop - 2.5) : g.rows - 2, H = (bot - top) / n;
    const lw = g.phone ? 8 : 16, lc = g.cols - lw;
    const laid = still ? 0.55 : 0.25 + 0.7 * ((t * 0.00002) % 1);
    const surf = (c: number) => bot - (n - 1) * H - H * laid + noise(c, 9) * 0.3;
    for (let c = 0; c < lc - 4; c++) for (let k = 0; k < n; k++) {
      const y1 = bot - k * H + noise(c, k) * 0.6, y0 = k === n - 1 ? surf(c) : bot - (k + 1) * H + noise(c, k + 1) * 0.6;
      for (let r = Math.ceil(y0); r <= Math.floor(y1); r++) {
        if (g.calm(c, r) < 0.5) continue;
        g.put(c, r, r === Math.ceil(y0) && (c + k) % 3 === 0 ? '▁' : TEX[k % 3], BANDS[k === n - 1 ? 11 : band(k)]);
      }
    }
    layers.forEach((L, k) => {
      const r = Math.round(bot - (k + 0.5) * H), last = k === n - 1;
      if (g.phone) { if (k !== 0 && !last) return; const s = L.years.replace(/^20/, '’'); if (g.calm(g.cols - s.length - 1, r) >= 1) g.text(g.cols - s.length - 1, r, s, last ? CORAL : FG2); return; }
      for (let c = lc - 3; c <= lc; c++) g.put(c, r, '─', FG2);
      g.text(lc + 2, r, L.short.slice(0, lw - 3), last ? PEACH : FG);
      g.text(lc + 2, r + 1, L.years, last ? CORAL : DIM);
    });
    if (!still) {
      if (Math.random() < 0.5) grains.push({ c: Math.random() * (lc - 5), r: top - 3, v: 0.12 + Math.random() * 0.2 });
      grains = grains.filter(p => { p.r += p.v; if (p.r >= surf(p.c) - 0.5) return false; if (g.calm(p.c, p.r) > 0.6) g.put(p.c, p.r, p.v > 0.25 ? '▪' : '.', CORAL); return true; });
    }
  };
};


/* Publications: a scenario tree from stochastic programming. A first-stage decision x branches on uncertainty into
   recourse stages; each leaf is a scenario ξ with probability p(ξ), the product of its branch probabilities. Sampled
   scenarios run root to leaf with a coral tail, edges glow where many have just passed, and each arrival adds to its
   leaf's bar at the right edge, on the leaf's own row, so the bars converge to p(ξ). */
type Node = { x: number; y: number; p: number; kids: Node[]; parent?: Node; b: number };
const ease = (u: number) => (u < 0.5 ? 2 * u * u : 1 - 2 * (1 - u) * (1 - u));
const edgePt = (a: Node, b: Node, u: number): [number, number] => [a.x + (b.x - a.x) * u, a.y + (b.y - a.y) * ease(u)];
const slopeCh = (dx: number, dy: number) => { const v = (dy * 1.97) / (Math.abs(dx) + 1e-6), a = Math.abs(v); return a < 0.35 ? '─' : a > 2.6 ? '│' : v > 0 ? '╲' : '╱'; };
/** Walks an eased edge between u0 and u1 and hands each visited cell its slope character. */
function walk(g: Grid, a: Node, b: Node, u0: number, u1: number, put: (c: number, r: number, ch: string, u: number) => void) {
  const n = Math.max(8, Math.ceil((Math.abs(b.x - a.x) * 3 + Math.abs(b.y - a.y) * 4) * (u1 - u0)));
  let last = -1;
  for (let k = 0; k <= n; k++) {
    const u = u0 + ((u1 - u0) * k) / n, p = edgePt(a, b, u), q = edgePt(a, b, Math.min(1, u + 0.01)), o = edgePt(a, b, Math.max(0, u - 0.01));
    const c = Math.round(p[0]), r = Math.round(p[1]), id = r * 99999 + c;
    if (id === last) continue; last = id;
    if (g.calm(c, r) > 0.55) put(c, r, slopeCh(q[0] - o[0], q[1] - o[1]), u);
  }
}
const pathOf = (leaf: Node) => { const ns: Node[] = []; for (let n: Node | undefined = leaf; n; n = n.parent) ns.unshift(n); return ns; };
/** Draws the stretch of a root-to-leaf path between path fractions w0 and w1. */
function walkPath(g: Grid, ns: Node[], w0: number, w1: number, put: (c: number, r: number, ch: string, w: number) => void) {
  const S = ns.length - 1;
  for (let s = 0; s < S; s++) {
    const a = s / S, b = (s + 1) / S, lo = Math.max(w0, a), hi = Math.min(w1, b);
    if (hi > lo) walk(g, ns[s], ns[s + 1], (lo - a) * S, (hi - a) * S, (c, r, ch, u) => put(c, r, ch, a + u / S));
  }
}
const PROBS: Record<number, number[]> = { 2: [0.6, 0.4], 3: [0.3, 0.5, 0.2] };

const scenario: Gen = g => {
  let key = '', root: Node, stages: Node[][], leaves: Node[], hx = 0, hw = 0, labelRow = 0;
  let parts: { ns: Node[]; leaf: number; t0: number; dur: number }[] = [], hits: number[] = [], heat = new Map<Node, number>(), last = 0;
  const layout = () => {
    const branch = g.phone ? [3, 2] : [3, 2, 2];
    hw = g.phone ? 10 : 18; hx = g.cols - hw - 1;
    const x0 = g.phone ? 2 : Math.round(g.titleRight) + 6, xl = hx - 4, S = branch.length;
    const top = 4.6, bot = g.phone ? g.titleTop - 3.6 : g.rows - 3.4;
    labelRow = bot + 1.8;
    root = { x: x0, y: 0, p: 1, kids: [], b: 0 }; stages = [[root]];
    for (let s = 0; s < S; s++) {
      const next: Node[] = [];
      for (const n of stages[s]) for (let b = 0; b < branch[s]; b++) { const k: Node = { x: Math.round(x0 + ((xl - x0) * (s + 1)) / S), y: 0, p: n.p * PROBS[branch[s]][b], kids: [], parent: n, b }; n.kids.push(k); next.push(k); }
      stages.push(next);
    }
    leaves = stages[S];
    // leaves on whole rows, so each sits level with its bar
    leaves.forEach((n, i) => (n.y = Math.round(top + ((bot - top) * (i + 0.5)) / leaves.length)));
    for (let s = S - 1; s >= 0; s--) for (const n of stages[s]) n.y = n.kids.reduce((a, k) => a + k.y, 0) / n.kids.length;
    hits = leaves.map(() => 0); heat = new Map(); parts = [];
  };
  const pick = () => { let n = root; while (n.kids.length) { let u = Math.random(), i = 0; const ps = PROBS[n.kids.length]; while (i < ps.length - 1 && (u -= ps[i]) > 0) i++; n = n.kids[i]; } return n; };
  const faint = BANDS[4], ann = DIM;
  return (t, still) => {
    if (key !== `${g.cols}x${g.rows}x${Math.round(g.titleRight)}x${Math.round(g.titleTop)}`) { key = `${g.cols}x${g.rows}x${Math.round(g.titleRight)}x${Math.round(g.titleTop)}`; layout(); }
    // a faint drifting field of density characters over the open ground
    const F = ' .:-=+', tt = still ? 0 : t;
    for (let r = 0; r < g.rows; r++) for (let c = 0; c < hx; c++) {
      if (g.calm(c, r) < 1) continue;
      const v = (Math.sin(c * 0.09 + tt * 0.00008) + Math.sin(r * 0.45 - c * 0.031 + tt * 0.00006) + Math.sin((c + r * 2.2) * 0.05 - tt * 0.00005) + 3) / 6;
      const d = Math.floor(Math.pow(v, 2.2) * 6); if (d > 0) g.put(c, r, F[d], BANDS[d > 3 ? 3 : 2]);
    }
    // edges, brighter where scenarios have recently passed
    const glow = (h: number) => Math.min(1, h / 5);
    stages.forEach((st, s) => { if (s === stages.length - 1) return; for (const a of st) for (const b of a.kids) {
      const h = still ? b.p * 8 : heat.get(b) ?? 0, band = Math.round(6 + glow(h) * 4);
      walk(g, a, b, 0, 1, (c, r, ch) => g.put(c, r, ch, BANDS[band]));
    } });
    g.put(root.x, root.y, '■', FG, true);
    for (const n of stages[1]) g.put(n.x, n.y, '□', FG2, true);
    if (!g.phone) for (const n of stages[2] ?? []) if (n.kids.length) g.put(n.x, n.y, '□', FG2);
    leaves.forEach(n => g.put(n.x + 1, n.y, '○', FG2));
    // annotations: branch probabilities on the first stage, stage names along the bottom
    root.kids.forEach(k => { const m = edgePt(root, k, 0.62); g.text(m[0] - 1, m[1] - (k.b === 0 ? 1 : k.b === 2 ? -1 : 1), PROBS[root.kids.length][k.b].toFixed(1).slice(1), ann); });
    const label = (c: number, sym: string, word: string) => { g.text(c, labelRow, sym, ann, 'math'); g.text(c + sym.length + 1, labelRow, word, faint); };
    if (g.phone) { label(root.x - 1, 'x', ''); label(leaves[0].x + 1, 'ξ', ''); label(hx + 1, 'p(ξ)', ''); }
    else {
      label(root.x - 1, 'x', 'first stage');
      stages.slice(1, -1).forEach((st, i) => label(st[0].x - 1, `y${'₁₂₃'[i]}`, 'recourse'));
      g.text(leaves[0].x - 10, labelRow, 'scenarios', faint); g.text(leaves[0].x + 1, labelRow, 'ξ', ann, 'math');
      label(hx + 1, 'p(ξ)', 'sampled');
    }
    // traces
    if (still) {
      [1, 4, 9, 13].filter(i => i < leaves.length).forEach((i, j) => walkPath(g, pathOf(leaves[i]), 0, 1, (c, r, ch) => g.put(c, r, ch, j === 1 ? PEACH : CORAL, true)));
    } else {
      if (t - last > 520) { last = t; const leaf = pick(); parts.push({ ns: pathOf(leaf), leaf: leaves.indexOf(leaf), t0: t, dur: 3000 + Math.random() * 1200 }); }
      for (const [k, v] of heat) heat.set(k, v * 0.994);
      parts = parts.filter(p => {
        const u = (t - p.t0) / p.dur;
        if (u >= 1) { hits[p.leaf]++; for (const n of p.ns) heat.set(n, (heat.get(n) ?? 0) + 1); return false; }
        const tail = 0.28;
        walkPath(g, p.ns, Math.max(0, u - tail), u, (c, r, ch, w) => { const f = (w - (u - tail)) / tail; g.put(c, r, ch, f > 0.7 ? PEACH : f > 0.35 ? CORAL : BANDS[10], f > 0.35); });
        const h = walkHead(p.ns, u); if (g.calm(h[0], h[1]) > 0.55) g.put(h[0], h[1], '●', PEACH, true);
        return true;
      });
      if (Math.max(...hits) > 80) hits = hits.map(v => v / 2);
    }
    // bars, one per leaf on the leaf's row
    const vals = still ? leaves.map(n => n.p) : hits, max = Math.max(1e-9, ...vals);
    leaves.forEach((n, i) => {
      const w = (vals[i] / max) * (hw - 2), full = Math.floor(w), frac = w - full, colr = BANDS[Math.min(12, 6 + Math.round((i / leaves.length) * 6))];
      for (let j = 0; j < full; j++) g.put(hx + 1 + j, n.y, '█', colr);
      if (frac > 0.15) g.put(hx + 1 + full, n.y, frac > 0.66 ? '▓' : frac > 0.33 ? '▒' : '░', colr);
    });
  };
  function walkHead(ns: Node[], u: number): [number, number] { const S = ns.length - 1, s = Math.min(S - 1, Math.floor(u * S)); return edgePt(ns[s], ns[s + 1], u * S - s); }
};

/* Research: the home landscape's topic minima, one basin per topic across the open ground right of the title (above
   it on phones), shaded in the ten-step character ramp. A descent starts on a basin's rim every six and a half seconds,
   taking each topic in turn; where it converges the topic turns coral and the readout names it, as on home. */
type Topic = { name: string; short: string; n: number };
const DENS = ' .:-=+*#%@';
const landscape: Gen = (g, host) => {
  const topics: Topic[] = JSON.parse(host.dataset.topics || '[]');
  let key = '', B: { c: number; r: number }[] = [], sx = 1, sy = 1, run: { pts: [number, number][]; k: number; t0: number } | null = null, target = 0;
  const f = (c: number, r: number) => { let v = 1; for (const b of B) { const dx = (c - b.c) / sx, dy = (r - b.r) / sy; v -= 0.92 * Math.exp(-(dx * dx + dy * dy)); } return v + 0.02 * Math.sin(c * 0.08) * Math.cos(r * 0.3); };
  const grad = (c: number, r: number): [number, number] => { const h = 0.25; return [(f(c + h, r) - f(c - h, r)) / (2 * h), (f(c, r + h) - f(c, r - h)) / (2 * h)]; };
  const layout = () => {
    const n = topics.length, x0 = g.phone ? 3 : g.titleRight + 7, x1 = g.cols - 4, y0 = 4.5, y1 = g.phone ? g.titleTop - 1.5 : g.rows - 2;
    const ys = [0.34, 0.7, 0.36, 0.66];
    B = topics.map((_, k) => ({ c: x0 + ((x1 - x0) * (k + 0.5)) / n, r: y0 + (y1 - y0) * ys[k % 4] }));
    sx = n > 1 ? (B[1].c - B[0].c) * 0.42 : 10; sy = Math.max(2.2, g.rows * 0.17); run = null;
  };
  const descend = (k: number, seed?: number) => {
    const b = B[k], a = seed ?? Math.random() * 6.283;
    let p: [number, number] = [b.c + Math.cos(a) * sx * 1.6, b.r + Math.sin(a) * sy * 1.7];
    const pts: [number, number][] = [p];
    for (let i = 0; i < 200; i++) {
      const d = grad(p[0], p[1]); let vx = d[0] * sx * sx * 0.18, vy = d[1] * sy * sy * 0.18;
      const m = Math.hypot(vx, vy * 2); if (m > 1.4) { vx *= 1.4 / m; vy *= 1.4 / m; }
      p = [p[0] - vx, p[1] - vy]; pts.push(p); if (m < 0.02) break;
    }
    return { pts, k, t0: performance.now() };
  };
  return (t, still) => {
    const k0 = `${g.cols}x${g.rows}x${Math.round(g.titleRight)}x${Math.round(g.titleTop)}`;
    if (key !== k0) { key = k0; layout(); }
    if (!topics.length) return;
    if (!run || (!still && t - run.t0 > 6500)) { run = descend(still ? Math.min(2, topics.length - 1) : target, still ? 0.8 : undefined); target = (target + 1) % topics.length; }
    for (let r = 0; r < g.rows; r++) for (let c = 0; c < g.cols; c++) {
      const m = g.calm(c, r); if (m < 0.3) continue;
      const v = Math.pow(Math.min(1, Math.max(0, f(c, r))), 1.6) * 0.78 * m, d = Math.min(9, Math.floor(v * 10));
      if (d) g.put(c, r, DENS[d], BANDS[Math.min(12, 1 + Math.floor(v * 12.5))]);
    }
    const n = still ? run.pts.length : Math.min(run.pts.length, Math.floor((t - run.t0) / 60) + 1), done = n === run.pts.length;
    for (let k = 1; k < n; k++) { const [a, b] = [run.pts[k - 1], run.pts[k]], s = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]))); for (let j = 0; j <= s; j++) g.put(a[0] + ((b[0] - a[0]) * j) / s, a[1] + ((b[1] - a[1]) * j) / s, '.', CORAL); }
    for (let k = 0; k < n; k += 3) g.put(run.pts[k][0], run.pts[k][1], 'o', CORAL, true);
    g.put(run.pts[0][0], run.pts[0][1], 'x', CORAL, true);
    if (done) { const e = run.pts[n - 1]; g.put(e[0], e[1], '*', PEACH, true); }
    topics.forEach((tp, k) => {
      const s = g.phone ? tp.short : tp.name, hit = done && run!.k === k, lc = Math.round(B[k].c - s.length / 2), lr = Math.round(B[k].r) - 2;
      for (let i = -1; i <= s.length + 3; i++) g.put(lc + i, lr, ' ', BG);
      g.text(lc, lr, s, hit ? CORAL : FG, true);
      if (!g.phone) g.text(lc + s.length + 1, lr, String(tp.n), hit ? CORAL : FG2);
    });
    const hitName = g.phone ? topics[run.k].short : topics[run.k].name;
    const label = done ? `converged in ${n - 1} iterations on ${hitName}` : `k=${n - 1}`, lr = g.phone ? 4 : g.rows - 2;
    for (let c = g.cols - label.length - 5; c < g.cols; c++) g.put(c, lr, ' ', BG);
    g.text(g.cols - label.length - 2, lr, label, done ? CORAL : FG2);
  };
};

const GENS: Record<string, Gen> = { strata, scenario, landscape };

mountAll('[data-glyphs]', host => {
  const cv = host.querySelector('canvas')!;
  const gen = GENS[host.dataset.glyphs!];
  if (!gen) return;
  const { g, resize, clear, render } = grid(host, cv);
  const draw = gen(g, host);
  const frame = (t: number, still: boolean) => { clear(); draw(t, still); render(); };
  let raf = 0, last = 0;
  const loop = (t: number) => { raf = requestAnimationFrame(loop); if (t - last < 45) return; last = t; frame(t, false); };
  const start = () => { if (!reduce && !raf) raf = requestAnimationFrame(loop); };
  const stop = () => { cancelAnimationFrame(raf); raf = 0; };
  const redraw = () => { resize(); frame(performance.now(), true); };
  redraw();
  new ResizeObserver(redraw).observe(host);
  document.fonts?.ready.then(redraw);
  whileVisible(host, start, stop, 0.05);
});
