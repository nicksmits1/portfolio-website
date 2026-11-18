import { el, reduce, theme, mountAll, gate, tween, rpath, trimEnd, markers, type P2 } from './dom';

/* System diagrams in Proschi's visual grammar, recoloured to the site: cards outlined by kind with a hard offset
   shadow, an icon tile, square ports, orthogonal edges with labels in pills, dashed groups. A request travels the
   chosen scenario. Models: content/diagrams/recommender.proschi and fifa.proschi. The recommender shows only the
   team's own components, nothing the course hosts. */
type Kind = 'service' | 'store' | 'stream' | 'third' | 'actor';
type Icon = 'actor' | 'service' | 'db' | 'stream' | 'ext' | 'files';
type Spec = {
  vb: string; label: string; start?: number;
  groups: { x: number; y: number; w: number; h: number; label: string; lx?: number }[];
  nodes: Record<string, { x: number; y: number; name: string; type: string; kind: Kind; icon: Icon }>;
  edges: { a: string; b: string; p: P2[]; lab?: string; at?: P2; dash?: boolean }[];
  scenarios: { name: string; cap: string; hops: string[] }[];
};
const KIND: Record<Kind, string> = { service: '#9A8CFF', store: '#C590FF', stream: '#FF7C6B', third: '#FFD9C2', actor: '#B9AAE8' };
const ICON: Record<Icon, string> = {
  actor: 'M8 7.2a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2zM2.6 14.5c.7-3 2.8-4.8 5.4-4.8s4.7 1.8 5.4 4.8',
  service: 'M2.5 2.5h11v4.5h-11zM2.5 9h11v4.5h-11zM5 4.75h.01M5 11.25h.01',
  db: 'M2.5 3.8c0 1 2.5 1.8 5.5 1.8s5.5-.8 5.5-1.8S11 2 8 2 2.5 2.8 2.5 3.8v8.4c0 1 2.5 1.8 5.5 1.8s5.5-.8 5.5-1.8V3.8M2.5 8c0 1 2.5 1.8 5.5 1.8s5.5-.8 5.5-1.8',
  stream: 'M4 3.5a1.5 1.5 0 1 0 0 .01M4 12.5a1.5 1.5 0 1 0 0 .01M12 8a1.5 1.5 0 1 0 0 .01M5.4 4.3l5.2 3M5.4 11.7l5.2-3',
  ext: 'M9.5 2.5h4v4M13.5 2.5 7.5 8.5M12 9.5v4H2.5V4h4',
  files: 'M2.5 4.5h11v8.5h-11zM2.5 8.5h11M5.5 2.5h5',
};

const SPECS: Record<string, Spec> = {
  recsys: {
    vb: '0 0 890 460', start: 1,
    label: 'Recommender architecture: viewer, router, ranking model, cold-start ranker, inference log, taste profiles, event stream, profile worker and Jev.',
    groups: [{ x: 232, y: 46, w: 446, h: 278, label: 'RECOMMENDATION SERVICE' }, { x: 232, y: 342, w: 446, h: 108, label: 'COLD-START PROFILING' }],
    nodes: {
      client: { x: 20, y: 160, name: 'Viewer', type: 'Actor', kind: 'actor', icon: 'actor' },
      api: { x: 250, y: 160, name: 'Router', type: 'Flask × 2', kind: 'service', icon: 'service' },
      model: { x: 490, y: 70, name: 'Ranking model', type: 'LightGBM', kind: 'service', icon: 'service' },
      cold: { x: 490, y: 250, name: 'Cold-start ranker', type: 'NumPy, 1.4 ms', kind: 'service', icon: 'service' },
      log: { x: 710, y: 70, name: 'Inference log', type: 'PostgreSQL', kind: 'store', icon: 'db' },
      profiles: { x: 710, y: 250, name: 'Taste profiles', type: 'SQLite', kind: 'store', icon: 'db' },
      stream: { x: 250, y: 380, name: 'Event stream', type: 'Kafka', kind: 'stream', icon: 'stream' },
      worker: { x: 490, y: 380, name: 'Profile worker', type: 'Python, async', kind: 'service', icon: 'service' },
      llm: { x: 710, y: 380, name: 'Jev', type: 'TypeSafe', kind: 'third', icon: 'ext' },
    },
    edges: [
      { a: 'client', b: 'api', p: [[188, 186], [250, 186]], lab: 'HTTP', at: [219, 186] },
      { a: 'api', b: 'model', p: [[418, 176], [454, 176], [454, 96], [490, 96]], lab: 'in-process', at: [454, 136] },
      { a: 'api', b: 'cold', p: [[418, 196], [454, 196], [454, 276], [490, 276]], lab: 'in-process', at: [454, 236] },
      { a: 'cold', b: 'profiles', p: [[658, 276], [710, 276]], lab: 'SQL', at: [684, 276] },
      { a: 'api', b: 'log', p: [[334, 160], [334, 24], [794, 24], [794, 70]], lab: 'background thread', at: [560, 24], dash: true },
      { a: 'stream', b: 'worker', p: [[418, 406], [490, 406]], lab: 'consume', at: [454, 406] },
      { a: 'worker', b: 'llm', p: [[658, 406], [710, 406]], lab: 'ask', at: [684, 406] },
      { a: 'worker', b: 'profiles', p: [[600, 380], [600, 333], [794, 333], [794, 302]], lab: 'SQL write', at: [700, 333] },
    ],
    scenarios: [
      { name: 'Known user', cap: 'Model ranking', hops: ['client>api', 'api>model', 'model>api', 'api>client', 'api>log'] },
      { name: 'New user', cap: 'Profile ranking', hops: ['client>api', 'api>model', 'model>api', 'api>cold', 'cold>profiles', 'profiles>cold', 'cold>api', 'api>client'] },
      { name: 'Off the request path', cap: 'Profile written by Jev', hops: ['stream>worker', 'worker>llm', 'llm>worker', 'worker>profiles'] },
      { name: 'Model fails', cap: 'Fallback list', hops: ['client>api', 'api>model!', 'api>client'] },
    ],
  },
  fifa: {
    vb: '0 0 880 540',
    label: 'FIFA pipeline: player CSVs to the Spark loader and Postgres, YouTube comments through Kafka to a leaderboard, and Postgres to the feature pipeline, MLlib and PyTorch.',
    groups: [{ x: 232, y: 106, w: 206, h: 102, label: 'INGESTION', lx: 342 }, { x: 12, y: 340, w: 636, h: 188, label: 'RATING MODELS', lx: 100 }, { x: 674, y: 12, w: 198, h: 374, label: 'COMMENT STREAMING' }],
    nodes: {
      analyst: { x: 30, y: 30, name: 'Analyst', type: 'Actor', kind: 'actor', icon: 'actor' },
      csvs: { x: 250, y: 30, name: 'Player tables', type: 'CSV, 8 seasons', kind: 'store', icon: 'files' },
      loader: { x: 250, y: 140, name: 'Spark loader', type: 'PySpark', kind: 'service', icon: 'service' },
      players: { x: 250, y: 250, name: 'fifa.players', type: 'PostgreSQL', kind: 'store', icon: 'db' },
      features: { x: 250, y: 370, name: 'Feature pipeline', type: 'Spark ML', kind: 'service', icon: 'service' },
      mllib: { x: 30, y: 460, name: 'Spark MLlib', type: 'RF and GBT', kind: 'service', icon: 'service' },
      shards: { x: 470, y: 460, name: 'Training shards', type: 'MosaicML', kind: 'store', icon: 'files' },
      torch: { x: 470, y: 370, name: 'PyTorch MLPs', type: 'Python', kind: 'service', icon: 'service' },
      youtube: { x: 690, y: 48, name: 'YouTube Data API', type: 'Third party', kind: 'third', icon: 'ext' },
      producer: { x: 690, y: 138, name: 'Producer', type: 'Python', kind: 'service', icon: 'service' },
      topic: { x: 690, y: 228, name: 'Comment topic', type: 'Kafka', kind: 'stream', icon: 'stream' },
      consumer: { x: 690, y: 318, name: 'Consumer', type: 'Leaderboard', kind: 'service', icon: 'service' },
    },
    edges: [
      { a: 'analyst', b: 'loader', p: [[140, 82], [140, 166], [250, 166]], lab: 'run ingestion', at: [195, 166] },
      { a: 'csvs', b: 'loader', p: [[334, 82], [334, 140]], lab: 'read CSV', at: [334, 94] },
      { a: 'loader', b: 'players', p: [[334, 192], [334, 250]], lab: 'JDBC write', at: [334, 229] },
      { a: 'analyst', b: 'features', p: [[80, 82], [80, 396], [250, 396]], lab: 'run modelling', at: [80, 250] },
      { a: 'features', b: 'players', p: [[334, 370], [334, 302]], lab: 'JDBC read', at: [334, 330] },
      { a: 'features', b: 'mllib', p: [[300, 422], [300, 486], [198, 486]], lab: 'in-process', at: [249, 486] },
      { a: 'features', b: 'shards', p: [[418, 406], [444, 406], [444, 486], [470, 486]], lab: 'write shards', at: [444, 446] },
      { a: 'torch', b: 'shards', p: [[554, 422], [554, 460]], lab: 'stream batches', at: [554, 441] },
      { a: 'producer', b: 'youtube', p: [[774, 138], [774, 100]], lab: 'HTTPS', at: [774, 119] },
      { a: 'producer', b: 'topic', p: [[774, 190], [774, 228]], lab: 'publish', at: [774, 209] },
      { a: 'topic', b: 'consumer', p: [[774, 280], [774, 318]], lab: 'consume', at: [774, 299] },
    ],
    scenarios: [
      { name: 'Load the player tables', cap: 'Eight seasons, one table', hops: ['analyst>loader', 'loader>csvs', 'csvs>loader', 'loader>players', 'players>loader', 'loader>analyst'] },
      { name: 'Count player mentions', cap: 'Live mention leaderboard', hops: ['producer>youtube', 'youtube>producer', 'producer>topic', 'topic>consumer'] },
      { name: 'Train the rating models', cap: 'Trees in process, MLPs from shards', hops: ['analyst>features', 'features>players', 'players>features', 'features>mllib', 'mllib>features', 'features>shards', 'torch>shards', 'shards>torch', 'features>analyst'] },
    ],
  },
};

mountAll('[data-fig="system"]', root => {
  const spec = SPECS[root.dataset.d!];
  if (!spec) throw new Error(`system figure: no spec "${root.dataset.d}"`);
  const svg = root.querySelector('svg')!, tabs = root.querySelector<HTMLElement>('[data-tabs]')!, cap = root.querySelector<HTMLElement>('[data-step]')!;
  const t = theme(), wait = gate(root), id = `sys-${root.dataset.d}`, CW = 168, CH = 52, SHADOW = '#07031A';
  const SANS = 'Onest, system-ui, sans-serif', MONO = '"JetBrains Mono", ui-monospace, Menlo, monospace';
  svg.setAttribute('viewBox', spec.vb); svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', spec.label);
  markers(svg, id, t.fg2, t.fg);
  const txt = (p: Element, x: number, y: number, s: string, a: Record<string, string | number> = {}) => { const n = el('text', { x, y, fill: t.fg, 'font-family': SANS, ...a }, p); n.textContent = s; return n; };
  const gG = el('g', {}, svg), gE = el('g', {}, svg), gN = el('g', {}, svg), gPo = el('g', {}, svg), gL = el('g', {}, svg), gT = el('g', {}, svg);
  spec.groups.forEach(g => {
    el('rect', { x: g.x, y: g.y, width: g.w, height: g.h, rx: 10, fill: 'rgba(243,237,255,.03)', stroke: 'rgba(243,237,255,.32)', 'stroke-width': 1.2, 'stroke-dasharray': '5 4' }, gG);
    const lx = g.lx ?? g.x + 14, ly = g.y + 18;
    el('path', { d: `M${lx} ${ly - 7} h4 l1.5 1.5 h5.5 v6.5 h-11 z`, fill: 'none', stroke: t.fg2, 'stroke-width': 1.1 }, gG);
    txt(gG, lx + 16, ly, g.label, { 'font-size': 10, 'font-weight': 600, fill: t.fg2, 'letter-spacing': '.12em' });
  });
  const nodes: Record<string, SVGGElement> = {};
  for (const k in spec.nodes) {
    const n = spec.nodes[k], col = KIND[n.kind], g = el('g', {}, gN);
    el('rect', { x: n.x + 3, y: n.y + 3, width: CW, height: CH, rx: 4, fill: SHADOW }, g);
    el('rect', { x: n.x, y: n.y, width: CW, height: CH, rx: 4, fill: t.panel, stroke: col, 'stroke-width': 2 }, g);
    el('rect', { x: n.x + 1, y: n.y + 1, width: CW - 2, height: CH - 2, rx: 3, fill: col, opacity: .07 }, g);
    el('rect', { x: n.x + 12, y: n.y + 12, width: 28, height: 28, rx: 4, fill: t.ink, stroke: col, 'stroke-width': 1.3 }, g);
    el('path', { d: ICON[n.icon], transform: `translate(${n.x + 18} ${n.y + 18})`, fill: 'none', stroke: col, 'stroke-width': 1.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
    txt(g, n.x + 50, n.y + 23, n.name, { 'font-size': 13, 'font-weight': 600 });
    txt(g, n.x + 50, n.y + 39, n.type, { 'font-size': 10, fill: t.fg2, 'font-family': MONO });
    nodes[k] = g;
  }
  const edges: Record<string, { path: SVGPathElement; fwd: SVGPathElement; rev: SVGPathElement }> = {};
  spec.edges.forEach(e => {
    const path = el('path', { d: rpath(trimEnd(e.p, 6)), fill: 'none', stroke: t.fg2, 'stroke-width': 1.3, 'marker-end': `url(#${id}-n)`, 'stroke-dasharray': e.dash ? '5 4' : 'none' }, gE);
    const fwd = el('path', { d: rpath(e.p), fill: 'none', stroke: 'none' }, gE), rev = el('path', { d: rpath([...e.p].reverse()), fill: 'none', stroke: 'none' }, gE);
    [e.p[0], e.p[e.p.length - 1]].forEach(([x, y]) => el('rect', { x: x - 3.5, y: y - 3.5, width: 7, height: 7, fill: t.ink, stroke: t.fg2, 'stroke-width': 1.2 }, gPo));
    if (e.lab && e.at) {
      const w = e.lab.length * 6.1 + 12;
      el('rect', { x: e.at[0] - w / 2, y: e.at[1] - 8.5, width: w, height: 17, rx: 8.5, fill: t.bg }, gL);
      txt(gL, e.at[0], e.at[1] + 3.5, e.lab, { 'font-size': 10, 'text-anchor': 'middle', fill: t.fg2, 'font-family': MONO });
    }
    edges[`${e.a}>${e.b}`] = { path, fwd, rev };
  });
  const dot = el('circle', { r: 6.5, fill: t.coral, stroke: t.ink, 'stroke-width': 2, opacity: 0 }, gT);
  const xm = el('path', { d: 'M-7 -7 L7 7 M7 -7 L-7 7', stroke: t.coral, 'stroke-width': 3.2, 'stroke-linecap': 'round', fill: 'none', opacity: 0 }, gT);
  const resolve = (h: string) => {
    const [a, b] = h.replace('!', '').split('>');
    return edges[`${a}>${b}`] ? { e: edges[`${a}>${b}`], dir: 'fwd' as const, k: `${a}>${b}` } : { e: edges[`${b}>${a}`], dir: 'rev' as const, k: `${b}>${a}` };
  };
  let token = 0;
  function show(i: number) {
    const sc = spec.scenarios[i], my = ++token;
    [...tabs.children].forEach((b, j) => b.setAttribute('aria-pressed', String(j === i)));
    cap.textContent = sc.cap; xm.setAttribute('opacity', '0'); dot.setAttribute('opacity', '0');
    const used = new Set(sc.hops.map(h => resolve(h).k)), touched = new Set(sc.hops.flatMap(h => h.replace('!', '').split('>')));
    Object.entries(edges).forEach(([k, e]) => {
      const on = used.has(k);
      e.path.style.opacity = on ? '1' : '.22'; e.path.setAttribute('stroke', on ? t.fg : t.fg2); e.path.setAttribute('stroke-width', on ? '2' : '1.3'); e.path.setAttribute('marker-end', `url(#${id}-${on ? 'a' : 'n'})`);
    });
    Object.entries(nodes).forEach(([k, g]) => { g.style.opacity = touched.has(k) ? '1' : '.35'; });
    if (reduce) return;
    (async () => {
      await wait(0);
      for (;;) {
        for (const h of sc.hops) {
          if (my !== token) return;
          const r = resolve(h), path = r.e[r.dir], L = path.getTotalLength(), bad = h.endsWith('!');
          dot.setAttribute('opacity', '1');
          await tween(1100, e => { const p = path.getPointAtLength(L * e * (bad ? .5 : 1)); dot.setAttribute('cx', String(p.x)); dot.setAttribute('cy', String(p.y)); });
          if (my !== token) return;
          if (bad) { const p = path.getPointAtLength(L * .5); xm.setAttribute('transform', `translate(${p.x} ${p.y})`); xm.setAttribute('opacity', '1'); dot.setAttribute('opacity', '0'); await wait(1300); }
          await wait(300);
        }
        if (my !== token) return;
        dot.setAttribute('opacity', '0'); await wait(1600); xm.setAttribute('opacity', '0');
      }
    })();
  }
  spec.scenarios.forEach((s, i) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = s.name; b.addEventListener('click', () => show(i)); tabs.appendChild(b); });
  show(spec.start ?? 0);
});
