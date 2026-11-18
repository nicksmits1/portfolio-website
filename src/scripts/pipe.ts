import { el, reduce, theme, whileVisible, mountAll } from './dom';

/* FIFA pipeline, from content/diagrams/fifa.proschi: a record travels along the chosen path. */
const FN: Record<string, [number, number, string, string]> = {
  csv: [80, 55, 'Player tables', 'FIFA 15–22 CSVs'], loader: [255, 55, 'Spark loader', 'schema, season, gender'], pg: [430, 55, 'fifa.players', 'PostgreSQL'],
  feat: [430, 165, 'Feature pipeline', 'Spark ML stages'], mllib: [605, 120, 'Spark MLlib', 'RF, GBT, CV on RMSE'], shards: [605, 215, 'Training shards', 'MosaicML streaming'], torch: [255, 215, 'PyTorch MLPs', 'shallow and deep'],
  yt: [80, 335, 'YouTube API', 'video comments'], prod: [255, 335, 'Producer', 'polls comments'], topic: [430, 335, 'Comment topic', 'Kafka'], cons: [605, 335, 'Consumer', 'live mention leaderboard'],
};
const FE = [['csv', 'loader'], ['loader', 'pg'], ['pg', 'feat'], ['feat', 'mllib'], ['feat', 'shards'], ['shards', 'torch'], ['yt', 'prod'], ['prod', 'topic'], ['topic', 'cons']];
const FS = [
  { name: 'Load the tables', cap: 'Eight seasons of CSVs, tagged with season and gender, land in one Postgres table over JDBC.', hops: ['csv>loader', 'loader>pg'] },
  { name: 'Train the models', cap: 'Spark ML stages build the features; trees train in MLlib, and the MLPs stream the same features from shards.', hops: ['pg>feat', 'feat>mllib', 'feat>shards', 'shards>torch'] },
  { name: 'Count mentions', cap: 'Comments on FIFA videos pass through Kafka to a consumer that keeps a live leaderboard of player mentions.', hops: ['yt>prod', 'prod>topic', 'topic>cons'] },
];

mountAll('[data-fig="pipe"]', root => {
  const svg = root.querySelector('svg')!, tabs = root.querySelector('[data-tabs]')!, cap = root.querySelector('[data-cap]')!, t = theme();
  svg.setAttribute('viewBox', '0 0 690 380'); svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', 'FIFA pipeline: ingestion into Postgres, rating models, and the Kafka comment stream');
  const gE = el('g', { fill: 'none' }, svg), gN = el('g', {}, svg), gP = el('g', {}, svg), edges: Record<string, SVGPathElement> = {}, nodes: Record<string, SVGGElement> = {}, W = 136, H = 46;
  ([['INGESTION', 22], ['MODELS', 130], ['STREAMING', 300]] as const).forEach(([label, y]) => { el('text', { x: 12, y, 'font-size': 10, fill: t.fg2, 'letter-spacing': '.1em' }, svg).textContent = label; });
  FE.forEach(([a, b]) => { const [x1, y1] = FN[a], [x2, y2] = FN[b]; edges[a + '>' + b] = el('path', { d: `M${x1} ${y1} L${x2} ${y2}`, stroke: t.fg, 'stroke-width': 1.4 }, gE); });
  for (const k in FN) {
    const [x, y, t1, t2] = FN[k], g = el('g', {}, gN);
    el('rect', { x: x - W / 2, y: y - H / 2, width: W, height: H, rx: 23, fill: '#1E1244', stroke: t.fg, 'stroke-width': 1.5 }, g);
    el('text', { x, y: y - 3, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 650, fill: t.fg }, g).textContent = t1;
    el('text', { x, y: y + 13, 'text-anchor': 'middle', 'font-size': 10.5, fill: t.fg2 }, g).textContent = t2;
    nodes[k] = g;
  }
  const dot = el('circle', { r: 6.5, fill: t.coral, stroke: t.bg, 'stroke-width': 2 }, gP); dot.style.display = 'none';
  let raf = 0, tok = 0, current = 1, visible = false;
  function play(i: number) {
    current = i;
    const sc = FS[i], my = ++tok; cancelAnimationFrame(raf); cap.textContent = sc.cap;
    tabs.querySelectorAll('button').forEach((b, k) => b.setAttribute('aria-pressed', k === i ? 'true' : 'false'));
    const used = new Set(sc.hops), touched = new Set(sc.hops.flatMap(h => h.split('>')));
    Object.entries(edges).forEach(([k, e]) => { e.style.opacity = used.has(k) ? '1' : '.2'; e.setAttribute('stroke-width', used.has(k) ? '2.4' : '1.4'); });
    Object.entries(nodes).forEach(([k, g]) => (g.style.opacity = touched.has(k) ? '1' : '.3'));
    if (reduce || !visible) { dot.style.display = 'none'; return; }
    let h = 0, t0 = performance.now();
    const frame = (now: number) => {
      if (my !== tok) return;
      const k = Math.min(1, (now - t0) / 650), [a, b] = sc.hops[h].split('>'), [x1, y1] = FN[a], [x2, y2] = FN[b], q = 1 - Math.pow(1 - Math.max(0, k), 3);
      dot.style.display = ''; dot.setAttribute('cx', String(x1 + (x2 - x1) * q)); dot.setAttribute('cy', String(y1 + (y2 - y1) * q));
      if ((now - t0) / 650 > 1.15) { h++; t0 = now; if (h >= sc.hops.length) { h = 0; t0 = now + 800; } }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
  }
  tabs.innerHTML = FS.map(s => `<button type="button">${s.name}</button>`).join('');
  tabs.querySelectorAll('button').forEach((b, i) => b.addEventListener('click', () => play(i)));
  play(1);
  whileVisible(root, () => { visible = true; play(current); }, () => { visible = false; tok++; cancelAnimationFrame(raf); dot.style.display = 'none'; });
});
