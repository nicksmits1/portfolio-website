import { el, reduce, theme, whileVisible, mountAll } from './dom';

/* Recommender architecture with a request travelling through it. Model: content/diagrams/recommender.proschi.
   Only the team's own components appear; nothing the course hosts. */
const R: Record<string, [number, number, string, string]> = {
  client: [70, 150, 'Viewer', 'request'], api: [225, 150, 'Router', 'Flask × 2'],
  model: [405, 60, 'Ranking model', 'LightGBM'], cold: [405, 240, 'Cold-start ranker', 'NumPy, 1.4 ms'],
  log: [610, 150, 'Inference log', 'PostgreSQL'], profiles: [610, 240, 'Taste profiles', 'SQLite'],
  stream: [225, 345, 'Event stream', 'Kafka'], worker: [405, 345, 'Profile worker', 'async'], llm: [610, 345, 'Jev', 'TypeSafe'],
};
const RE = [['client', 'api'], ['api', 'model'], ['api', 'cold'], ['cold', 'profiles'], ['api', 'log'], ['stream', 'worker'], ['worker', 'llm'], ['worker', 'profiles']];
const SCENARIOS = [
  { name: 'Known user', cap: 'The model answers with 20 films inside the latency budget.', hops: ['client>api', 'api>model', 'model>api', 'api>client', 'api>log'] },
  { name: 'New user', cap: 'No history, so the cold-start ranker reads the taste profile Jev already wrote.', hops: ['client>api', 'api>model', 'model>api', 'api>cold', 'cold>profiles', 'profiles>cold', 'cold>api', 'api>client'] },
  { name: 'Off the request path', cap: 'A sign-up event reaches the worker, Jev turns the description into a taste profile, and it is stored before the first request.', hops: ['stream>worker', 'worker>llm', 'llm>worker', 'worker>profiles'] },
  { name: 'Model fails', cap: 'The router answers anyway from a fallback list. Requests never wait on Jev or the logger.', hops: ['client>api', 'api>model!', 'api>client'] },
];

function rec(svg: SVGSVGElement) {
  const t = theme(), ink = t.fg, dim = t.fg2, fill = '#1E1244', pulse = t.coral, sw = 1.4, W = 132, H = 46;
  svg.setAttribute('viewBox', '0 0 700 400'); svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Recommender architecture: router, ranking model, cold-start ranker, taste profiles, event stream, profile worker and Jev.');
  const gE = el('g', { fill: 'none' }, svg), gN = el('g', {}, svg), gP = el('g', {}, svg);
  const edges: Record<string, SVGPathElement> = {};
  RE.forEach(([a, b]) => {
    const [x1, y1] = R[a], [x2, y2] = R[b];
    edges[a + '>' + b] = el('path', { d: `M${x1} ${y1} L${x2} ${y2}`, stroke: ink, 'stroke-width': sw, 'stroke-dasharray': a === 'api' && b === 'log' ? '5 4' : 'none' }, gE);
  });
  const nodes: Record<string, SVGGElement> = {};
  for (const k in R) {
    const [x, y, t1, t2] = R[k], g = el('g', {}, gN);
    el('rect', { x: x - W / 2, y: y - H / 2, width: W, height: H, rx: 23, fill, stroke: ink, 'stroke-width': sw * 1.15 }, g);
    el('text', { x, y: y - 3, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 650, fill: ink }, g).textContent = t1;
    el('text', { x, y: y + 13, 'text-anchor': 'middle', 'font-size': 10.5, fill: dim }, g).textContent = t2;
    nodes[k] = g;
  }
  const dot = el('circle', { r: 6.5, fill: pulse, stroke: t.bg, 'stroke-width': 2 }, gP); dot.style.display = 'none';
  const xmark = el('path', { d: 'M-7 -7 L7 7 M7 -7 L-7 7', stroke: pulse, 'stroke-width': 3.2, 'stroke-linecap': 'round', fill: 'none' }, gP); xmark.style.display = 'none';
  let raf = 0, token = 0, current = 1;
  function play(i: number) {
    current = i;
    const sc = SCENARIOS[i], my = ++token; cancelAnimationFrame(raf);
    Object.values(edges).forEach(p => { p.setAttribute('stroke-width', String(sw)); p.style.opacity = '1'; }); xmark.style.display = 'none';
    const used = new Set(sc.hops.map(h => h.replace('!', '')).map(h => { const [a, b] = h.split('>'); return edges[h] ? h : b + '>' + a; }));
    Object.entries(edges).forEach(([k, p]) => { p.style.opacity = used.has(k) ? '1' : '0.22'; if (used.has(k)) p.setAttribute('stroke-width', String(sw * 1.7)); });
    Object.entries(nodes).forEach(([k, g]) => { g.style.opacity = sc.hops.some(h => h.replace('!', '').split('>').includes(k)) ? '1' : '0.3'; });
    if (reduce) { dot.style.display = 'none'; return; }
    let h = 0, t0 = performance.now();
    const dur = 620;
    const frame = (now: number) => {
      if (my !== token) return;
      const k = (now - t0) / dur, hop = sc.hops[h], bad = hop.endsWith('!'), [a, b] = hop.replace('!', '').split('>');
      const [x1, y1] = R[a], [x2, y2] = R[b], lim = bad ? 0.55 : 1, e = Math.max(0, Math.min(k, 1)), q = (1 - Math.pow(1 - e, 3)) * lim;
      dot.style.display = ''; dot.setAttribute('cx', String(x1 + (x2 - x1) * q)); dot.setAttribute('cy', String(y1 + (y2 - y1) * q));
      if (bad && k >= 1) { xmark.style.display = ''; xmark.setAttribute('transform', `translate(${x1 + (x2 - x1) * 0.55} ${y1 + (y2 - y1) * 0.55})`); }
      if (k >= (bad ? 1.9 : 1.12)) { h++; t0 = now; if (h >= sc.hops.length) { h = 0; t0 = now + 900; xmark.style.display = 'none'; } }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
  }
  return { play, resume: () => play(current), stop() { token++; cancelAnimationFrame(raf); dot.style.display = 'none'; } };
}

mountAll('[data-fig="rec"]', root => {
  const tabs = root.querySelector('[data-tabs]')!, cap = root.querySelector('[data-cap]')!;
  const r = rec(root.querySelector('svg')!);
  const btns = SCENARIOS.map(s => { const b = document.createElement('button'); b.type = 'button'; b.textContent = s.name; tabs.appendChild(b); return b; });
  const pick = (i: number) => { r.play(i); cap.textContent = SCENARIOS[i].cap; btns.forEach((b, k) => b.setAttribute('aria-pressed', k === i ? 'true' : 'false')); };
  btns.forEach((b, i) => b.addEventListener('click', () => pick(i)));
  pick(1); r.stop();
  whileVisible(root, () => r.resume(), () => r.stop());
});
