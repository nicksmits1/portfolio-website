import { el, theme, mountAll } from './dom';

/* One value scale with a mark per model. Numbers: FIFA repo notebook (test RMSE); sepsis report, Table 1. */
type Mark = { v: number; label: string; hi?: boolean; dim?: boolean };
const DATA: Record<string, { unit: string; min: number; max: number; ticks: number; marks: Mark[] }> = {
  fifa: { unit: 'test RMSE, rating points', min: 1, max: 2.6, ticks: 8, marks: [
    { v: 1.292, label: 'Gradient-boosted trees', hi: true }, { v: 1.656, label: 'Random forest' },
    { v: 2.372, label: 'Deep MLP' }, { v: 2.487, label: 'Shallow MLP' }] },
  sepsis: { unit: 'final return', min: 0.77, max: 0.83, ticks: 6, marks: [
    { v: 0.8238, label: 'Dueling DQN', hi: true }, { v: 0.8135, label: 'Prioritized DQN' },
    { v: 0.8089, label: 'DQN' }, { v: 0.8056, label: 'Double DQN' }, { v: 0.8005, label: 'Noisy DQN' },
    { v: 0.7868, label: 'Multi-step DQN', dim: true }, { v: 0.7813, label: 'Distributional DQN', dim: true },
    { v: 0.7782, label: 'Rainbow DQN', dim: true }] },
};

mountAll('[data-fig="scale"]', root => {
  const d = DATA[root.dataset.d!], svg = root.querySelector('svg')!, t = theme(), ink = t.fg, dim = t.fg2, hi = t.coral;
  const W = 520, x0 = 14, x1 = W - 14, H = 58 + d.marks.length * 24;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', d.unit + ': ' + d.marks.map(m => m.label + ' ' + m.v).join(', '));
  const X = (v: number) => x0 + (v - d.min) / (d.max - d.min) * (x1 - x0), base = H - 30;
  el('line', { x1: x0, x2: x1, y1: base, y2: base, stroke: ink, 'stroke-width': 1.4 }, svg);
  const n = d.ticks * 5;
  for (let i = 0; i <= n; i++) {
    const v = d.min + (d.max - d.min) * i / n, major = i % 5 === 0;
    el('line', { x1: X(v), x2: X(v), y1: base, y2: base - (major ? 11 : 5), stroke: ink, 'stroke-width': major ? 1.2 : 0.7 }, svg);
    if (major) el('text', { x: X(v), y: base + 15, 'text-anchor': 'middle', 'font-size': 10.5, fill: dim }, svg).textContent = String(+v.toFixed(3));
  }
  el('text', { x: x1, y: H - 1, 'text-anchor': 'end', 'font-size': 10.5, fill: dim }, svg).textContent = d.unit;
  d.marks.slice().sort((a, b) => a.v - b.v).forEach((m, i) => {
    const x = X(m.v), y = 16 + i * 24, c = m.hi ? hi : m.dim ? dim : ink, right = x < W * 0.62;
    el('line', { x1: x, x2: x, y1: y + 4, y2: base, stroke: c, 'stroke-width': m.hi ? 2 : 1 }, svg);
    el('circle', { cx: x, cy: y, r: m.hi ? 5 : 3.5, fill: c }, svg);
    el('text', { x: x + (right ? 10 : -10), y: y + 4, 'text-anchor': right ? 'start' : 'end', 'font-size': 12.5, 'font-weight': m.hi ? 700 : 500, fill: c }, svg).textContent = `${m.label}  ${m.v}`;
  });
});
