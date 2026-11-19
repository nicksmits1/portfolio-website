import { el, theme, mountAll, reduce, whileVisible } from './dom';

/* Electricity forecasting: energy per epoch against test RMSE as compound scaling shrinks the networks.
   Numbers: the team's report, Table 4 (CNN-LSTM) and Table 3 (LSTM); see content/projects/electricity.md. */
type Run = [beta: number, joules: number, rmse: number];
const SERIES: { id: string; name: string; hi: boolean; runs: Run[] }[] = [
  { id: 'cnn', name: 'CNN-LSTM', hi: true, runs: [[1, 329.16, 16.3], [1.1, 315.67, 17.11], [1.3, 323.92, 17.56], [1.5, 297.95, 18.02], [1.7, 294.51, 19.93], [1.9, 288.5, 22.4], [2.1, 284.76, 26.95]] },
  { id: 'lstm', name: 'LSTM', hi: false, runs: [[1, 504.33, 20.1], [1.1, 472.06, 37.48], [1.3, 435.56, 58.63], [1.5, 327.66, 70.75]] },
];
const BETAS = [1, 1.1, 1.3, 1.5, 1.7, 1.9, 2.1];

mountAll('[data-fig="trade"]', root => {
  const svg = root.querySelector('svg')!, cap = root.querySelector<HTMLElement>('[data-step]')!, read = root.querySelector<HTMLElement>('[data-read]')!;
  const dots = root.querySelector<HTMLElement>('[data-steps]')!, t = theme();
  const W = 640, H = 400, L = 58, R = W - 18, T = 18, B = H - 46;
  const ex = [270, 520], ry = [15, 75];
  const X = (j: number) => L + (j - ex[0]) / (ex[1] - ex[0]) * (R - L);
  const Y = (r: number) => B - Math.log(r / ry[0]) / Math.log(ry[1] / ry[0]) * (B - T);
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Energy per epoch against test RMSE as the scaling factor grows. ' + SERIES.map(s => s.name + ': ' + s.runs.map(r => `factor ${r[0]}, ${r[1]} J, RMSE ${r[2]}`).join('; ')).join('. '));

  /* axes: energy linear, RMSE on a log scale so both families fit */
  [300, 350, 400, 450, 500].forEach(j => {
    el('line', { x1: X(j), x2: X(j), y1: T, y2: B, stroke: 'rgba(243,237,255,.1)' }, svg);
    el('text', { x: X(j), y: B + 18, 'text-anchor': 'middle', 'font-size': 11, fill: t.fg2 }, svg).textContent = String(j);
  });
  [15, 20, 30, 50, 70].forEach(r => {
    el('line', { x1: L, x2: R, y1: Y(r), y2: Y(r), stroke: 'rgba(243,237,255,.1)' }, svg);
    el('text', { x: L - 8, y: Y(r) + 4, 'text-anchor': 'end', 'font-size': 11, fill: t.fg2 }, svg).textContent = String(r);
  });
  el('text', { x: R, y: H - 6, 'text-anchor': 'end', 'font-size': 11, fill: t.fg2 }, svg).textContent = 'energy per epoch, J';
  el('text', { x: 12, y: T - 4, 'font-size': 11, fill: t.fg2 }, svg).textContent = 'test RMSE, $/MWh';

  /* the 10% error budget above each baseline */
  SERIES.forEach(s => {
    const b = s.runs[0][2];
    el('rect', { x: L, width: R - L, y: Y(b * 1.1), height: Y(b) - Y(b * 1.1), fill: s.hi ? t.coral : t.fg, opacity: s.hi ? 0.16 : 0.08 }, svg);
  });

  const g = SERIES.map(s => {
    const c = s.hi ? t.coral : t.fg, grp = el('g', {}, svg);
    const line = el('polyline', { fill: 'none', stroke: c, 'stroke-width': s.hi ? 2 : 1.4, 'stroke-linejoin': 'round', opacity: 0.85 }, grp);
    const pts = s.runs.map(r => el('circle', { cx: X(r[1]), cy: Y(r[2]), r: s.hi ? 5 : 4, fill: c }, grp));
    const ring = el('circle', { r: 10, fill: 'none', stroke: c, 'stroke-width': 1.6 }, grp);
    const tag = el('text', { 'font-size': 12, 'font-weight': 600, fill: c }, grp);
    const name = el('text', { x: X(s.runs[0][1]) + (s.hi ? -12 : 12), y: Y(s.runs[0][2]) + (s.hi ? 22 : -14), 'text-anchor': s.hi ? 'end' : 'start', 'font-size': 12.5, 'font-weight': 700, fill: c }, grp);
    name.textContent = s.name;
    return { s, c, line, pts, ring, tag };
  });

  let k = 0;
  function show(i: number) {
    k = i; const beta = BETAS[i];
    g.forEach(({ s, line, pts, ring, tag }) => {
      const n = s.runs.filter(r => r[0] <= beta + 1e-9).length, cur = s.runs[n - 1];
      line.setAttribute('points', s.runs.slice(0, n).map(r => `${X(r[1]).toFixed(1)},${Y(r[2]).toFixed(1)}`).join(' '));
      pts.forEach((p, j) => p.setAttribute('opacity', j < n ? '1' : '0'));
      ring.setAttribute('cx', String(X(cur[1]))); ring.setAttribute('cy', String(Y(cur[2])));
      const right = X(cur[1]) < W * 0.7;
      tag.setAttribute('x', String(X(cur[1]) + (right ? 14 : -14))); tag.setAttribute('y', String(Y(cur[2]) + 4)); tag.setAttribute('text-anchor', right ? 'start' : 'end');
      tag.textContent = cur[0] === beta ? `${cur[1]} J` : '';
      ring.setAttribute('opacity', cur[0] === beta ? '1' : '0');
    });
    cap.textContent = beta === 1 ? 'Baseline networks' : `Width scaled ${beta}`;
    read.innerHTML = g.map(({ s }) => {
      const r = s.runs.find(q => q[0] === beta);
      return r ? `<span><b>${s.name}</b> ${r[1]} J, RMSE ${r[2]}${r[2] <= s.runs[0][2] * 1.1 ? ', within budget' : ''}</span>` : `<span><b>${s.name}</b> not scaled further</span>`;
    }).join('');
    dots.querySelectorAll('button').forEach((b, j) => b.setAttribute('aria-current', j === i ? 'step' : 'false'));
  }
  dots.innerHTML = BETAS.map(b => `<button type="button" aria-label="Scaling factor ${b}"></button>`).join('');
  dots.querySelectorAll('button').forEach((b, j) => b.addEventListener('click', () => { stop(); show(j); }));

  /* steps through the scaling factor while in view, pausing on the last; reduced motion shows every run */
  let timer = 0, manual = false;
  const last = BETAS.length - 1;
  const stop = () => { manual = true; clearTimeout(timer); timer = 0; };
  const tick = () => { timer = window.setTimeout(() => { show(k === last ? 0 : k + 1); tick(); }, k === last ? 2600 : 1500); };
  if (reduce) show(last);
  else {
    show(0);
    whileVisible(root, () => { if (!manual && !timer) tick(); }, () => { clearTimeout(timer); timer = 0; });
  }
});
