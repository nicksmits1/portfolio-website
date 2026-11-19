import { el, theme, mountAll, reduce, whileVisible, tween } from './dom';

/* Lhoist: ILLUSTRATIVE. The shape of the second-order sorbent model, not its numbers: acid gas conversion rises along a
   logistic curve with the stoichiometric ratio, and as the temperature rises the curves swap, from HCl converting more
   to SO₂ converting more. Midpoints and slopes below are made up to show that shape; the pilot data is Lhoist's. */
const GAS = [
  { id: 'hcl', name: 'HCl', k: 3.6, m: (tau: number) => 0.7 + 1.1 * tau },
  { id: 'so2', name: 'SO₂', k: 2.7, m: (tau: number) => 1.85 - 1.1 * tau },
];
const STEPS: [number, string][] = [[0, 'Low temperature'], [0.5, 'Crossover'], [1, 'High temperature']];
const conv = (sr: number, k: number, m: number) => { const s = (u: number) => 1 / (1 + Math.exp(-k * (u - m))); return (s(sr) - s(0)) / (1 - s(0)); };

mountAll('[data-fig="kinetics"]', root => {
  const svg = root.querySelector('svg')!, cap = root.querySelector<HTMLElement>('[data-step]')!, dots = root.querySelector<HTMLElement>('[data-steps]')!, t = theme();
  const W = 640, H = 386, L = 56, R = W - 18, T = 26, B = H - 46, smax = 3;
  const X = (sr: number) => L + sr / smax * (R - L), Y = (v: number) => B - v * (B - T);
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Illustrative curves of acid gas conversion against stoichiometric ratio, logistic in shape. At low temperature HCl converts more than SO₂; as the temperature rises the curves cross and SO₂ converts more.');
  [0, 0.25, 0.5, 0.75, 1].forEach(v => {
    el('line', { x1: L, x2: R, y1: Y(v), y2: Y(v), stroke: 'rgba(243,237,255,.1)' }, svg);
    el('text', { x: L - 8, y: Y(v) + 4, 'text-anchor': 'end', 'font-size': 11, fill: t.fg2 }, svg).textContent = `${v * 100}%`;
  });
  [0, 1, 2, 3].forEach(v => { el('text', { x: X(v), y: B + 18, 'text-anchor': 'middle', 'font-size': 11, fill: t.fg2 }, svg).textContent = String(v); });
  el('text', { x: R, y: H - 6, 'text-anchor': 'end', 'font-size': 11, fill: t.fg2 }, svg).textContent = 'stoichiometric ratio, sorbent to acid gas';
  el('text', { x: 12, y: T - 6, 'font-size': 11, fill: t.fg2 }, svg).textContent = 'conversion';

  const gapA = el('path', { fill: t.coral, opacity: 0.14 }, svg), gapB = el('path', { fill: t.fg, opacity: 0.1 }, svg);
  const ghosts = reduce ? GAS.map(g => el('polyline', { fill: 'none', stroke: g.id === 'hcl' ? t.coral : t.fg, 'stroke-width': 1.3, 'stroke-dasharray': '4 5', opacity: 0.7 }, svg)) : [];
  const lines = GAS.map(g => el('polyline', { fill: 'none', stroke: g.id === 'hcl' ? t.coral : t.fg, 'stroke-width': g.id === 'hcl' ? 2.6 : 2, 'stroke-linejoin': 'round' }, svg));
  const tags = GAS.map(g => { const e = el('text', { 'font-size': 13, 'font-weight': 700, fill: g.id === 'hcl' ? t.coral : t.fg }, svg); e.textContent = g.name; return e; });

  const N = 90, xs = Array.from({ length: N + 1 }, (_, i) => i / N * smax);
  const curve = (g: typeof GAS[number], tau: number) => xs.map(sr => conv(sr, g.k, g.m(tau)));
  const pts = (v: number[]) => v.map((y, i) => `${X(xs[i]).toFixed(1)},${Y(y).toFixed(1)}`).join(' ');
  if (reduce) ghosts.forEach((p, i) => p.setAttribute('points', pts(curve(GAS[i], 0))));

  let tau = 0;
  function draw(tv: number) {
    tau = tv;
    const [h, s] = GAS.map(g => curve(g, tv));
    lines[0].setAttribute('points', pts(h)); lines[1].setAttribute('points', pts(s));
    /* the gap between the curves, coral where HCl leads, pale where SO₂ does */
    let da = '', db = '';
    for (let i = 0; i < N; i++) {
      const q = `M${X(xs[i])},${Y(h[i])}L${X(xs[i + 1])},${Y(h[i + 1])}L${X(xs[i + 1])},${Y(s[i + 1])}L${X(xs[i])},${Y(s[i])}Z`;
      if (h[i] + h[i + 1] >= s[i] + s[i + 1]) da += q; else db += q;
    }
    gapA.setAttribute('d', da); gapB.setAttribute('d', db);
    /* each name sits at its curve's half-conversion point, outside the pair: the leader's on its left, the other's on its right */
    const mids = GAS.map(g => g.m(tv)), lead = mids[0] <= mids[1] ? 0 : 1;
    GAS.forEach((g, i) => {
      const sr = Math.min(smax - 0.2, Math.max(0.15, xs.find(x => conv(x, g.k, mids[i]) >= 0.5) ?? mids[i]));
      const left = i === lead;
      tags[i].setAttribute('x', String(X(sr) + (left ? -10 : 10))); tags[i].setAttribute('y', String(Y(0.5) + (left ? -8 : 18)));
      tags[i].setAttribute('text-anchor', left ? 'end' : 'start');
    });
  }

  let k = 0, timer = 0, manual = false, busy = false;
  const order = [0, 1, 2, 1];
  let at = 0;
  function show(i: number, animate: boolean) {
    k = i; cap.textContent = reduce && i === 2 ? 'Low dashed, high solid' : STEPS[i][1];
    dots.querySelectorAll('button').forEach((b, j) => b.setAttribute('aria-current', j === i ? 'step' : 'false'));
    const from = tau, to = STEPS[i][0];
    if (!animate) { draw(to); return; }
    busy = true; tween(1100, e => draw(from + (to - from) * e)).then(() => { busy = false; });
  }
  dots.innerHTML = STEPS.map(s => `<button type="button" aria-label="${s[1]}"></button>`).join('');
  dots.querySelectorAll('button').forEach((b, j) => b.addEventListener('click', () => { manual = true; clearTimeout(timer); timer = 0; if (!busy) show(j, !reduce); }));

  /* steps low, crossover, high and back while in view; reduced motion shows the high-temperature curves over dashed low ones */
  const tick = () => { timer = window.setTimeout(() => { at = (at + 1) % order.length; show(order[at], true); tick(); }, k === 1 ? 1800 : 2600); };
  if (reduce) show(2, false);
  else {
    show(0, false);
    whileVisible(root, () => { if (!manual && !timer) tick(); }, () => { clearTimeout(timer); timer = 0; });
  }
});
