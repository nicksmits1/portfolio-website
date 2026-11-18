import { el, reduce, theme, mountAll, gate, tween, rpath, trimEnd, markers, type P2 } from './dom';

/* Sepsis DQN loop: one transition travels environment → buffer → loss ← target, the gradient returns to the online
   network and its greedy action goes back to the patient. The six extensions are tags on the part they change; the
   extension names and formulas come from content/projects/sepsis.md (figure `loop`, field `ext`). */
const SANS = 'Onest, system-ui, sans-serif', SERIF = '"STIX Two Math", "STIX Two Text", serif';
type Part = 'env' | 'buf' | 'loss' | 'tgt' | 'onl';
const B: Record<Part, [number, number, string, string]> = {
  env: [110, 200, 'ICU-Sepsis', '716 states, 25 treatments'], buf: [360, 76, 'Replay buffer', 'transitions'],
  loss: [640, 76, 'Loss', 'squared TD error'], tgt: [640, 316, 'Target network', 'slow copy'], onl: [360, 316, 'Online network', '2 × 128 units'],
};
const E: Record<string, { p: P2[]; lab: string; at: P2; dash?: boolean }> = {
  e1: { p: [[110, 169], [110, 76], [272, 76]], lab: '(s, a, r, s′)', at: [110, 122] },
  e2: { p: [[448, 76], [552, 76]], lab: 'batch', at: [500, 76] },
  e3: { p: [[640, 285], [640, 107]], lab: 'r + γ max Q̄(s′)', at: [640, 196] },
  e4: { p: [[592, 107], [592, 196], [400, 196], [400, 285]], lab: '∇θ ℒ', at: [496, 196] },
  e5: { p: [[272, 316], [110, 316], [110, 231]], lab: 'a', at: [190, 316] },
  e6: { p: [[448, 316], [552, 316]], lab: 'copy θ', at: [500, 316], dash: true },
};
/* where each extension's tag sits, by id */
const TAG_AT: Record<string, P2> = { per: [312, 24], nstep: [420, 24], double: [640, 372], duel: [272, 372], dist: [364, 372], noisy: [462, 372] };
const STEPS: [string, string][] = [['e1', 'Store transition'], ['e2', 'Sample batch'], ['e3', 'Target value'], ['e4', 'Gradient step'], ['e5', 'Next treatment']];

mountAll('[data-fig="dqn"]', root => {
  const svg = root.querySelector('svg')!, step = root.querySelector<HTMLElement>('[data-step]')!, t = theme(), wait = gate(root);
  const buttons = [...root.querySelectorAll<HTMLButtonElement>('[data-ext]')], formulas = [...root.querySelectorAll<HTMLElement>('[data-f]')];
  svg.setAttribute('viewBox', '0 0 760 392'); markers(svg, 'dq', t.fg2, t.fg);
  const txt = (p: Element, x: number, y: number, s: string, a: Record<string, string | number> = {}) => { const n = el('text', { x, y, fill: t.fg, 'font-family': SANS, ...a }, p); n.textContent = s; return n; };
  const mth = (p: Element, x: number, y: number, base: string, sub = '') => {
    const n = el('text', { x, y, fill: t.peach, 'font-family': SERIF, 'font-style': 'italic', 'font-size': 14 }, p);
    el('tspan', {}, n).textContent = base; if (sub) el('tspan', { 'font-size': '0.7em', dy: 4 }, n).textContent = sub;
  };
  const W = 176, H = 62;
  const gE = el('g', {}, svg), gB = el('g', {}, svg), gL = el('g', {}, svg), gT = el('g', {}, svg);
  const edges: Record<string, { path: SVGPathElement; full: SVGPathElement }> = {};
  for (const k in E) {
    const e = E[k];
    const path = el('path', { d: rpath(trimEnd(e.p, 2)), fill: 'none', stroke: t.fg2, 'stroke-width': 1.4, 'marker-end': 'url(#dq-n)', 'stroke-dasharray': e.dash ? '5 4' : 'none' }, gE);
    const full = el('path', { d: rpath(e.p), fill: 'none', stroke: 'none' }, gE);
    const w = e.lab.length * 6.4 + 14;
    el('rect', { x: e.at[0] - w / 2, y: e.at[1] - 10, width: w, height: 20, rx: 10, fill: t.ink }, gL);
    txt(gL, e.at[0], e.at[1] + 4, e.lab, { 'font-size': 12, 'text-anchor': 'middle', fill: t.fg2, 'font-family': SERIF, 'font-style': 'italic' });
    edges[k] = { path, full };
  }
  const boxes = {} as Record<Part, { g: SVGGElement; r: SVGRectElement }>;
  (Object.keys(B) as Part[]).forEach(k => {
    const [x, y, t1, t2] = B[k], g = el('g', {}, gB);
    const r = el('rect', { x: x - W / 2, y: y - H / 2, width: W, height: H, rx: 12, fill: t.panel, stroke: t.fg, 'stroke-width': 1.5 }, g);
    txt(g, x, y - 3, t1, { 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 600 });
    txt(g, x, y + 15, t2, { 'text-anchor': 'middle', 'font-size': 10.5, fill: t.fg2 });
    boxes[k] = { g, r };
  });
  mth(gB, B.onl[0] + 60, B.onl[1] - 1, 'Q', 'θ'); mth(gB, B.tgt[0] + 60, B.tgt[1] - 1, 'Q̄');
  mth(gB, B.loss[0] + 50, B.loss[1] - 1, 'ℒ(θ)'); mth(gB, B.buf[0] + 66, B.buf[1] - 1, '𝒟');

  /* tags, one per extension listed in the project file */
  const tags = buttons.map(b => {
    const id = b.dataset.ext!, on = b.dataset.on as Part, name = b.textContent!.trim(), at = TAG_AT[id];
    const w = name.length * 6.4 + 18, g = el('g', { style: 'cursor:pointer' }, gT), by = B[on][1], top = at[1] < by;
    el('line', { x1: at[0], y1: at[1] + (top ? 10 : -10), x2: at[0], y2: by + (top ? -H / 2 : H / 2), stroke: t.dim, 'stroke-width': 1, 'stroke-dasharray': '2 3' }, g);
    const r = el('rect', { x: at[0] - w / 2, y: at[1] - 10, width: w, height: 20, rx: 10, fill: t.ink, stroke: t.coral, 'stroke-width': 1.2 }, g);
    const tx = txt(g, at[0], at[1] + 4, name, { 'text-anchor': 'middle', 'font-size': 10.5, 'font-weight': 500, fill: t.coral });
    return { id, on, g, r, tx };
  });
  let sel: string | null = null;
  function pick(id: string) {
    sel = sel === id ? null : id;
    const tag = tags.find(x => x.id === sel);
    (Object.keys(boxes) as Part[]).forEach(k => {
      const b = boxes[k], hit = tag?.on === k;
      b.r.setAttribute('stroke', hit ? t.coral : t.fg); b.r.setAttribute('stroke-width', hit ? '2.4' : '1.5'); b.g.style.opacity = !tag || hit ? '1' : '.45';
    });
    tags.forEach(x => { const on = x.id === sel; x.r.setAttribute('fill', on ? t.coral : t.ink); x.tx.setAttribute('fill', on ? t.bg : t.coral); });
    buttons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.ext === sel)));
    formulas.forEach(f => { f.hidden = f.dataset.f !== sel; });
  }
  buttons.forEach(b => b.addEventListener('click', () => pick(b.dataset.ext!)));
  const hover = matchMedia('(hover: hover)').matches;
  tags.forEach(x => { x.g.addEventListener('click', () => pick(x.id)); if (hover) x.g.addEventListener('mouseenter', () => { if (sel !== x.id) pick(x.id); }); });

  if (reduce) { step.textContent = ''; return; }
  const dot = el('circle', { r: 6, fill: t.coral, stroke: t.ink, 'stroke-width': 2, opacity: 0 }, svg);
  async function hop(k: string) {
    const { path, full } = edges[k], L = full.getTotalLength();
    path.setAttribute('stroke', t.fg); path.setAttribute('stroke-width', '2.2'); path.setAttribute('marker-end', 'url(#dq-a)');
    dot.setAttribute('opacity', '1');
    await tween(1500, e => { const p = full.getPointAtLength(L * e); dot.setAttribute('cx', String(p.x)); dot.setAttribute('cy', String(p.y)); });
    path.setAttribute('stroke', t.fg2); path.setAttribute('stroke-width', '1.4'); path.setAttribute('marker-end', 'url(#dq-n)');
  }
  (async () => {
    await wait(0);
    for (let loop = 0; ; loop++) {
      for (const [k, s] of STEPS) { step.textContent = s; await hop(k); await wait(700); }
      if (loop % 2 === 1) { step.textContent = 'Copy weights'; await hop('e6'); await wait(800); }
      dot.setAttribute('opacity', '0'); await wait(1000);
    }
  })();
});
