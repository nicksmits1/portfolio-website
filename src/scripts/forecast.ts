import { el, theme, mountAll, reduce, whileVisible } from './dom';

/* Electricity forecasting: the team's saved 24-hour forecasts for the last test day, 2024-12-31, against the actual
   ERCOT Houston day-ahead price. Arrays from the project's .npy files; prices from its ERCOT data. */
const ACTUAL = [16.17, 19.46, 14.93, 12.22, 11.74, 14.87, 19.09, 25.93, 26.23, 16.98, 7.38, 6.19, 10.78, 17.06, 17.98, 16.14, 17.77, 20.5, 44.27, 35.29, 32.31, 30.28, 24.78, 20.68];
const MODELS: { id: string; name: string; rmse: number; v: number[] }[] = [
  { id: 'cnn', name: 'CNN-LSTM', rmse: 6.96, v: [9.7, 7.88, 7.53, 7.17, 7.34, 8.4, 12.44, 19.87, 21.63, 17.15, 17, 19.02, 21.39, 22.92, 23.32, 22.5, 23.54, 33.83, 44.02, 30.87, 27.59, 26.07, 25.22, 21.26] },
  { id: 'lstm', name: 'LSTM', rmse: 5.66, v: [10.52, 9.35, 8.45, 9.81, 10.69, 11.96, 14.22, 20.61, 25.11, 19.18, 16.77, 16.6, 16.95, 17.42, 17.57, 17.58, 18.07, 22.44, 38.32, 33.68, 24.96, 19.9, 17.4, 15.86] },
  { id: 'rnn', name: 'RNN', rmse: 12.77, v: [24.13, 20.77, 20.94, 21.81, 22.76, 23.95, 26.06, 29.57, 27.67, 24.14, 24.65, 24.66, 26.07, 27.93, 30.47, 35.58, 43.6, 50.54, 53.23, 49.6, 33.74, 27.36, 25.08, 24.12] },
  { id: 'tx', name: 'Transformer', rmse: 15.65, v: [35.79, 33.13, 32.78, 32.72, 32.72, 32.71, 32.71, 32.71, 32.71, 32.71, 32.71, 32.71, 32.71, 32.71, 32.71, 32.71, 32.71, 32.71, 32.71, 32.71, 32.71, 32.71, 32.71, 32.71] },
];

mountAll('[data-fig="forecast"]', root => {
  const svg = root.querySelector('svg')!, tabs = root.querySelector<HTMLElement>('[data-tabs]')!, t = theme();
  const W = 640, H = 340, L = 44, R = W - 16, T = 16, B = H - 40, ymax = 55;
  const X = (h: number) => L + h / 23 * (R - L), Y = (v: number) => B - v / ymax * (B - T);
  const pts = (v: number[]) => v.map((p, h) => `${X(h).toFixed(1)},${Y(p).toFixed(1)}`).join(' ');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Day-ahead price forecasts for 31 December 2024 against the actual price. ' + MODELS.map(m => `${m.name}, RMSE ${m.rmse}`).join('; '));
  [0, 10, 20, 30, 40, 50].forEach(v => {
    el('line', { x1: L, x2: R, y1: Y(v), y2: Y(v), stroke: 'rgba(243,237,255,.1)' }, svg);
    el('text', { x: L - 8, y: Y(v) + 4, 'text-anchor': 'end', 'font-size': 11, fill: t.fg2 }, svg).textContent = String(v);
  });
  [0, 6, 12, 18, 23].forEach(h => { el('text', { x: X(h), y: B + 18, 'text-anchor': 'middle', 'font-size': 11, fill: t.fg2 }, svg).textContent = `${String(h).padStart(2, '0')}:00`; });
  el('text', { x: R, y: H - 4, 'text-anchor': 'end', 'font-size': 11, fill: t.fg2 }, svg).textContent = 'hour, 31 December 2024';
  el('text', { x: 10, y: T - 4, 'font-size': 11, fill: t.fg2 }, svg).textContent = '$/MWh';

  const lines = MODELS.map(m => ({ m, p: el('polyline', { points: pts(m.v), fill: 'none', 'stroke-linejoin': 'round', 'stroke-linecap': 'round', pathLength: 1 }, svg) }));
  const actual = el('polyline', { points: pts(ACTUAL), fill: 'none', stroke: t.fg, 'stroke-width': 2.4, 'stroke-dasharray': '6 5', 'stroke-linejoin': 'round' }, svg);
  const tag = el('text', { 'font-size': 12, 'font-weight': 700, fill: t.coral }, svg);
  el('text', { x: X(8), y: Y(26.23) - 12, 'text-anchor': 'middle', 'font-size': 12, fill: t.fg }, svg).textContent = 'actual';

  let cur = 'cnn';
  function pick(id: string) {
    cur = id;
    lines.forEach(({ m, p }) => {
      const on = m.id === id;
      p.setAttribute('stroke', on ? t.coral : t.fg2); p.setAttribute('stroke-width', on ? '2.6' : '1.2'); p.setAttribute('opacity', on ? '1' : '0.45');
      if (on) { svg.appendChild(p); svg.appendChild(actual); svg.appendChild(tag); }
    });
    /* the picked model's name sits top left, clear of the evening peak */
    const m = MODELS.find(q => q.id === id)!;
    tag.setAttribute('x', String(L + 10)); tag.setAttribute('y', String(T + 14));
    tag.textContent = `${m.name}, RMSE ${m.rmse}`;
    tabs.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.id === id)));
  }
  tabs.innerHTML = MODELS.map(m => `<button type="button" data-id="${m.id}">${m.name}</button>`).join('');
  tabs.querySelectorAll<HTMLButtonElement>('button').forEach(b => b.addEventListener('click', () => pick(b.dataset.id!)));
  pick(cur);

  /* the forecasts draw in once, from midnight, when the figure comes into view; reduced motion shows them drawn */
  if (!reduce) {
    lines.forEach(({ p }) => { p.style.strokeDasharray = '1 1'; p.style.strokeDashoffset = '1'; });
    let done = false;
    whileVisible(root, () => {
      if (done) return; done = true;
      lines.forEach(({ p }, i) => { p.style.transition = `stroke-dashoffset 1.6s cubic-bezier(.2,.8,.2,1) ${i * 0.15}s`; p.style.strokeDashoffset = '0'; });
    }, () => {});
  }
});
