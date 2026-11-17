/* Shared data and drawing engine for the portfolio drafts.
   Every number here comes from the CV, the thesis poster, or a project README.
   The supply-chain episode is an illustration, not an exported trace. */
(function () {
  const NS = (window.NS = {});
  const SVGNS = 'http://www.w3.org/2000/svg';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  NS.reduce = reduce;

  function el(tag, attrs, parent) {
    const n = document.createElementNS(SVGNS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  NS.el = el;

  /* ---------- content ---------- */
  NS.person = {
    name: 'Nicolas Smits',
    line: 'Optimisation, machine learning and reinforcement learning for process systems.',
    email: 'nsmits@andrew.cmu.edu',
    github: 'https://github.com/nicksmits1',
    linkedin: 'https://linkedin.com/in/nicolas-smits',
  };

  NS.projects = [
    { id: 'thesis', name: 'Graph RL for resilient supply chains', short: 'Supply chain RL', where: 'Master’s thesis, CMU', from: 2026.0, to: 2026.95,
      line: 'A policy learns which transport arcs to add so demand still arrives when plants, warehouses or routes fail.',
      facts: [['21,000×', 'faster than greedy search'], ['19 → 70', 'nodes, trained to designed'], ['64–80%', 'of greedy search value'], ['28,481', 'parameters']],
      note: 'Preliminary results',
      methods: ['Reinforcement learning', 'Graph neural networks', 'Simulation'], tools: ['PyTorch', 'PyG', 'Gymnasium'] },
    { id: 'sindae', name: 'SiNDAE', short: 'SiNDAE', where: 'CAPD, CMU', from: 2026.42, to: 2026.66,
      line: 'Neural networks embedded in differential-algebraic process models and trained as one nonlinear program.',
      facts: [['index-2', 'DAEs supported'], ['2', 'training backends'], ['JOSS', 'paper pending']],
      link: ['arXiv 2504.04665', 'https://arxiv.org/abs/2504.04665'],
      methods: ['Nonlinear optimisation', 'Hybrid modelling'], tools: ['JAX', 'Pyomo'] },
    { id: 'recsys', name: 'Movie recommender with LLM cold start', short: 'Recommender', where: 'Team project, CMU', from: 2026.67, to: 2026.95,
      line: 'A live recommendation service. An LLM turns a new user’s free-text tastes into a profile before their first request.',
      facts: [['500k+', 'live requests served'], ['1.4 ms', 'cold-start ranker'], ['2.2×', 'NDCG@20 over SVD'], ['$1/day', 'LLM cost']],
      methods: ['Ranking & recommenders', 'LLM pipelines', 'MLOps'], tools: ['LightGBM', 'Kafka', 'Flask', 'Docker', 'PostgreSQL', 'AWS'] },
    { id: 'wayfinder', name: 'wayfinder-sidebar', short: 'wayfinder-sidebar', where: 'Open source', from: 2026.84, to: 2026.95,
      line: 'A Claude Code plugin. Your ticket map sits beside the chat, and one click starts a new agent session with a handoff.',
      facts: [['1 click', 'ticket to working session'], ['200k', 'token budget per session']],
      link: ['GitHub', 'https://github.com/nicksmits1/wayfinder-sidebar'],
      methods: ['Agent tooling'], tools: ['TypeScript'] },
    { id: 'fifa', name: 'FIFA player analytics pipeline', short: 'FIFA pipeline', where: 'CMU, with Amogh Balaji', from: 2025.67, to: 2025.95,
      line: 'Spark to Postgres ETL, a live Kafka comment stream, and rating models trained locally and on GCP.',
      facts: [['R² 0.964', 'gradient-boosted trees'], ['8', 'seasons, 2015–2022']],
      link: ['GitHub', 'https://github.com/nicksmits1/FIFA-player-analytics-ml-pipeline'],
      methods: ['Data engineering', 'Supervised learning'], tools: ['Spark', 'PostgreSQL', 'Kafka', 'PyTorch', 'GCP', 'Docker'] },
    { id: 'sepsis', name: 'DQN variants for ICU sepsis treatment', short: 'Sepsis DQN', where: 'McGill, with J. Randolph and A. Paraha', from: 2025.0, to: 2025.3,
      line: 'Which DQN extensions help on a clinical benchmark with 716 health states and 25 treatments?',
      facts: [['0.824', 'return, Dueling DQN'], ['716 × 25', 'states × actions']],
      link: ['GitHub', 'https://github.com/nicksmits1/COMP-579-Reinforcement-Learning'],
      methods: ['Reinforcement learning'], tools: ['PyTorch', 'Gymnasium'] },
  ];
  NS.byId = Object.fromEntries(NS.projects.map(p => [p.id, p]));

  NS.methods = ['Reinforcement learning', 'Graph neural networks', 'Simulation', 'Nonlinear optimisation', 'Hybrid modelling', 'Ranking & recommenders', 'LLM pipelines', 'MLOps', 'Data engineering', 'Supervised learning', 'Agent tooling'];
  NS.tools = ['PyTorch', 'PyG', 'Gymnasium', 'JAX', 'Pyomo', 'LightGBM', 'Kafka', 'Spark', 'PostgreSQL', 'Flask', 'Docker', 'AWS', 'GCP', 'TypeScript'];
  NS.count = name => NS.projects.filter(p => p.tools.includes(name) || p.methods.includes(name)).length;

  /* seconds, all measured: CV and thesis poster */
  NS.times = [
    { s: 0.0014, label: 'cold-start ranker', v: '1.4 ms', p: 'recsys' },
    { s: 0.139, label: 'recommender P95', v: '139 ms', p: 'recsys' },
    { s: 1, label: 'policy designs a 70-node network', v: '1 s', p: 'thesis' },
    { s: 21600, label: 'greedy search, same network', v: '6 h', p: 'thesis' },
  ];
  NS.fifa = { unit: 'test RMSE, rating points', min: 1, max: 2.6, marks: [
    { v: 1.292, label: 'Gradient-boosted trees', hi: true }, { v: 1.656, label: 'Random forest' },
    { v: 2.372, label: 'Deep MLP' }, { v: 2.487, label: 'Shallow MLP' } ] };
  NS.sepsis = { unit: 'final return', min: 0.8, max: 0.83, marks: [
    { v: 0.8238, label: 'Dueling DQN', hi: true }, { v: 0.8135, label: 'Prioritized DQN' },
    { v: 0.8089, label: 'DQN' }, { v: 0.8056, label: 'Double DQN' } ] };

  /* ---------- supply chain episode (illustrative) ---------- */
  const N = {
    P1: [80, 130, 'p'], P2: [80, 250, 'p'],
    W1: [320, 70, 'w'], W2: [320, 190, 'w'], W3: [320, 310, 'w'],
    C1: [560, 50, 'c'], C2: [560, 140, 'c'], C3: [560, 230, 'c'], C4: [560, 320, 'c'],
  };
  const BASE = [['P1', 'W1'], ['P1', 'W2'], ['P2', 'W2'], ['P2', 'W3'], ['W1', 'C1'], ['W1', 'C2'], ['W2', 'C2'], ['W2', 'C3'], ['W3', 'C4']];
  const ADDED = [['W1', 'C3'], ['P1', 'W3']];
  NS.netStates = [
    { cap: 'The network', added: 0, fail: false, backlog: 0.34 },
    { cap: 'Warehouse W2 fails. Customer C3 has no supply.', added: 0, fail: true, backlog: 1 },
    { cap: 'The policy adds W1 → C3', added: 1, fail: false, fresh: 0, backlog: 0.2 },
    { cap: 'then P1 → W3, and stops', added: 2, fail: false, fresh: 1, backlog: 0.14 },
    { cap: 'W2 fails again. Demand still arrives.', added: 2, fail: true, backlog: 0.31 },
  ];

  NS.net = function (svg, o) {
    o = Object.assign({ ink: '#111', fresh: '#c00', dim: '#999', fill: '#fff', bad: '#c00', sw: 1.6, font: 'inherit', interval: 2200 }, o);
    svg.setAttribute('viewBox', '0 0 640 370');
    svg.setAttribute('role', 'img');
    const gA = el('g', { fill: 'none', 'stroke-linecap': 'round' }, svg), gN = el('g', {}, svg);
    function seg(a, b) {
      const [x1, y1] = N[a], [x2, y2] = N[b], d = Math.hypot(x2 - x1, y2 - y1), r = 21;
      return [x1 + (x2 - x1) * r / d, y1 + (y2 - y1) * r / d, x2 - (x2 - x1) * (r + 5) / d, y2 - (y2 - y1) * (r + 5) / d];
    }
    function arc(a, b) {
      const [x1, y1, x2, y2] = seg(a, b), g = el('g', {}, gA);
      const ang = Math.atan2(y2 - y1, x2 - x1), h = 8;
      const line = el('line', { x1, y1, x2, y2, pathLength: 1 }, g);
      const head = el('path', { d: `M${x2 + 4 * Math.cos(ang)} ${y2 + 4 * Math.sin(ang)} L${x2 - h * Math.cos(ang - 0.42)} ${y2 - h * Math.sin(ang - 0.42)} L${x2 - h * Math.cos(ang + 0.42)} ${y2 - h * Math.sin(ang + 0.42)} Z`, stroke: 'none' }, g);
      return { g, line, head, a, b };
    }
    const base = BASE.map(([a, b]) => arc(a, b)), added = ADDED.map(([a, b]) => arc(a, b));
    const nodes = {};
    for (const k in N) {
      const [x, y, t] = N[k], g = el('g', {}, gN);
      let s;
      if (t === 'p') s = el('rect', { x: x - 16, y: y - 16, width: 32, height: 32 }, g);
      else if (t === 'w') s = el('path', { d: `M${x - 17} ${y + 15} V${y - 4} L${x} ${y - 18} L${x + 17} ${y - 4} V${y + 15} Z` }, g);
      else s = el('circle', { cx: x, cy: y, r: 16 }, g);
      s.setAttribute('stroke-width', o.sw * 1.25);
      const tx = el('text', { x, y: y + (t === 'w' ? 6 : 4), 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 600, 'font-family': o.font, stroke: 'none' }, g);
      tx.textContent = k;
      nodes[k] = { g, s, tx };
    }
    const cross = el('path', { d: `M${N.W2[0] - 24} ${N.W2[1] - 24} l48 48 m0 -48 l-48 48`, stroke: o.bad, 'stroke-width': 3.5, 'stroke-linecap': 'round', fill: 'none' }, svg);
    const tiers = el('g', { 'font-size': 10.5, 'font-family': o.font, fill: o.dim, 'text-anchor': 'middle', 'letter-spacing': '.08em' }, svg);
    [['PLANTS', 80], ['WAREHOUSES', 320], ['CUSTOMERS', 560]].forEach(([t, x]) => { el('text', { x, y: 366 }, tiers).textContent = t; });

    let cur = -1, timer = null;
    function paint(i, animate) {
      const st = NS.netStates[i], failed = st.fail;
      const live = new Set();
      const arcs = base.concat(added.slice(0, st.added));
      // which customers are supplied
      const ok = a => !(failed && (a.a === 'W2' || a.b === 'W2'));
      const served = new Set();
      const whOk = new Set();
      arcs.filter(ok).forEach(a => { if (N[a.a][2] === 'p') whOk.add(a.b); });
      arcs.filter(ok).forEach(a => { if (N[a.b][2] === 'c' && whOk.has(a.a)) served.add(a.b); });
      base.forEach(a => {
        const dead = !ok(a);
        a.g.style.display = '';
        a.line.setAttribute('stroke', dead ? o.dim : o.ink); a.head.setAttribute('fill', dead ? o.dim : o.ink);
        a.line.setAttribute('stroke-width', o.sw); a.line.setAttribute('stroke-dasharray', dead ? '0.03 0.035' : 'none');
        a.g.style.opacity = dead ? 0.55 : 1;
      });
      added.forEach((a, k) => {
        const on = k < st.added;
        a.g.style.display = on ? '' : 'none';
        if (!on) return;
        const c = o.freshOnly && st.fresh !== k ? o.ink : o.fresh;
        a.line.setAttribute('stroke', c); a.head.setAttribute('fill', c);
        a.line.setAttribute('stroke-width', c === o.fresh ? o.sw * 1.9 : o.sw);
        if (animate && st.fresh === k && !reduce) {
          a.line.style.transition = 'none'; a.line.setAttribute('stroke-dasharray', '1 1'); a.line.style.strokeDashoffset = 1; a.head.style.opacity = 0;
          a.line.getBoundingClientRect();
          a.line.style.transition = 'stroke-dashoffset .9s cubic-bezier(.2,.8,.2,1)'; a.line.style.strokeDashoffset = 0;
          a.head.style.transition = 'opacity .2s .75s'; a.head.style.opacity = 1;
        } else { a.line.setAttribute('stroke-dasharray', 'none'); a.line.style.strokeDashoffset = 0; a.head.style.opacity = 1; }
      });
      for (const k in nodes) {
        const n = nodes[k], t = N[k][2], dead = failed && k === 'W2', starved = t === 'c' && !served.has(k);
        n.s.setAttribute('fill', starved ? 'none' : (t === 'c' ? o.ink : o.fill));
        n.s.setAttribute('stroke', dead ? o.dim : starved ? o.bad : o.ink);
        n.s.setAttribute('stroke-dasharray', starved ? '4 3' : 'none');
        n.tx.setAttribute('fill', dead ? o.dim : starved ? o.bad : (t === 'c' ? o.fill : o.ink));
      }
      cross.style.display = failed ? '' : 'none';
      svg.setAttribute('aria-label', 'Supply chain network. ' + st.cap);
      cur = i;
      if (o.onState) o.onState(i, st);
    }
    const api = {
      go(i, animate) { paint((i + NS.netStates.length) % NS.netStates.length, animate !== false); },
      play() { if (reduce || timer) return; timer = setInterval(() => api.go(cur + 1), o.interval); },
      stop() { clearInterval(timer); timer = null; },
      get state() { return cur; },
    };
    api.go(o.start != null ? o.start : (reduce ? 3 : 0), false);
    return api;
  };

  /* ---------- recommender architecture ---------- */
  const R = {
    client: [70, 150, 'Viewer', 'request'], api: [225, 150, 'Router', 'Flask × 2'],
    model: [405, 60, 'Ranking model', 'LightGBM'], cold: [405, 240, 'Cold-start ranker', 'NumPy, 1.4 ms'],
    log: [610, 150, 'Inference log', 'PostgreSQL'], profiles: [610, 240, 'Taste profiles', 'SQLite'],
    stream: [225, 345, 'Event stream', 'Kafka'], worker: [405, 345, 'Profile worker', 'async'], llm: [610, 345, 'Jev', 'TypeSafe LLM'],
  };
  const RE = [['client', 'api'], ['api', 'model'], ['api', 'cold'], ['cold', 'profiles'], ['api', 'log'], ['stream', 'worker'], ['worker', 'llm'], ['worker', 'profiles']];
  NS.recScenarios = [
    { id: 'known', name: 'Known user', cap: 'The model answers with 20 films inside the latency budget.', hops: ['client>api', 'api>model', 'model>api', 'api>client', 'api>log'] },
    { id: 'new', name: 'New user', cap: 'No history, so the cold-start ranker reads the taste profile the LLM already wrote.', hops: ['client>api', 'api>model', 'model>api', 'api>cold', 'cold>profiles', 'profiles>cold', 'cold>api', 'api>client'] },
    { id: 'profile', name: 'Off the request path', cap: 'A sign-up event reaches the worker, the LLM extracts a taste profile, and it is stored before the first request.', hops: ['stream>worker', 'worker>llm', 'llm>worker', 'worker>profiles'] },
    { id: 'fail', name: 'Model fails', cap: 'The router answers anyway from a fallback list. Requests never wait on the LLM or the logger.', hops: ['client>api', 'api>model!', 'api>client'] },
  ];
  NS.rec = function (svg, o) {
    o = Object.assign({ ink: '#111', dim: '#888', fill: '#fff', pulse: '#c00', sw: 1.4, font: 'inherit', radius: 3, only: null, fresh: null }, o);
    svg.setAttribute('viewBox', '0 0 700 400'); svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Recommender architecture: router, ranking model, cold-start ranker, taste profiles, event stream, profile worker and LLM.');
    const gE = el('g', { fill: 'none' }, svg), gN = el('g', {}, svg), gP = el('g', {}, svg);
    const W = 132, H = 46, show = k => !o.only || o.only.includes(k), isNew = k => o.fresh && o.fresh.includes(k);
    const edges = {};
    RE.forEach(([a, b]) => {
      if (!show(a) || !show(b)) return;
      const [x1, y1] = R[a], [x2, y2] = R[b];
      const p = el('path', { d: `M${x1} ${y1} L${x2} ${y2}`, stroke: (isNew(a) || isNew(b)) ? o.pulse : o.ink, 'stroke-width': o.sw, 'stroke-dasharray': a === 'api' && b === 'log' ? '5 4' : 'none' }, gE);
      edges[a + '>' + b] = p;
    });
    const nodes = {};
    for (const k in R) {
      if (!show(k)) continue;
      const [x, y, t1, t2] = R[k], g = el('g', {}, gN), c = isNew(k) ? o.pulse : o.ink;
      const r = el('rect', { x: x - W / 2, y: y - H / 2, width: W, height: H, rx: o.radius, fill: o.fill, stroke: c, 'stroke-width': o.sw * 1.15 }, g);
      el('text', { x, y: y - 3, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 650, 'font-family': o.font, fill: c }, g).textContent = t1;
      el('text', { x, y: y + 13, 'text-anchor': 'middle', 'font-size': 10.5, 'font-family': o.font, fill: isNew(k) ? o.pulse : o.dim }, g).textContent = t2;
      nodes[k] = r;
    }
    const dot = el('circle', { r: 6.5, fill: o.pulse, stroke: o.fill, 'stroke-width': 2 }, gP); dot.style.display = 'none';
    const xmark = el('path', { d: 'M-7 -7 L7 7 M7 -7 L-7 7', stroke: o.pulse, 'stroke-width': 3.2, 'stroke-linecap': 'round', fill: 'none' }, gP); xmark.style.display = 'none';
    let raf = 0, token = 0;
    function reset() { Object.values(edges).forEach(p => { p.setAttribute('stroke-width', o.sw); p.style.opacity = 1; }); xmark.style.display = 'none'; }
    function play(id) {
      const sc = NS.recScenarios.find(s => s.id === id) || NS.recScenarios[0];
      const my = ++token; cancelAnimationFrame(raf); reset();
      const used = new Set(sc.hops.map(h => h.replace('!', '')).map(h => { const [a, b] = h.split('>'); return edges[h] ? h : b + '>' + a; }));
      Object.entries(edges).forEach(([k, p]) => { p.style.opacity = used.has(k) ? 1 : 0.22; if (used.has(k)) p.setAttribute('stroke-width', o.sw * 1.7); });
      Object.entries(nodes).forEach(([k, r]) => { r.parentNode.style.opacity = sc.hops.some(h => h.replace('!', '').split('>').includes(k)) ? 1 : 0.3; });
      if (reduce) { dot.style.display = 'none'; return sc; }
      let i = 0, t0 = performance.now();
      const dur = 620;
      function frame(now) {
        if (my !== token) return;
        let k = (now - t0) / dur;
        const hop = sc.hops[i], bad = hop.endsWith('!'), [a, b] = hop.replace('!', '').split('>');
        const [x1, y1] = R[a], [x2, y2] = R[b];
        const lim = bad ? 0.55 : 1, e = Math.min(k, 1), q = (1 - Math.pow(1 - e, 3)) * lim;
        dot.style.display = ''; dot.setAttribute('cx', x1 + (x2 - x1) * q); dot.setAttribute('cy', y1 + (y2 - y1) * q);
        if (bad && k >= 1) { xmark.style.display = ''; xmark.setAttribute('transform', `translate(${x1 + (x2 - x1) * 0.55} ${y1 + (y2 - y1) * 0.55})`); }
        if (k >= (bad ? 1.9 : 1.12)) { i++; t0 = now; if (i >= sc.hops.length) { i = 0; t0 = now + 900; xmark.style.display = 'none'; } }
        raf = requestAnimationFrame(frame);
      }
      raf = requestAnimationFrame(frame);
      return sc;
    }
    return { play, stop() { token++; cancelAnimationFrame(raf); dot.style.display = 'none'; } };
  };

  /* ---------- value scale (fifa, sepsis) ---------- */
  NS.scale = function (svg, d, o) {
    o = Object.assign({ ink: '#111', dim: '#777', hi: '#c00', font: 'inherit', ticks: 8 }, o);
    const W = 520, x0 = 14, x1 = W - 14, rows = d.marks.length, H = 58 + rows * 24;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', d.unit + ': ' + d.marks.map(m => m.label + ' ' + m.v).join(', '));
    const X = v => x0 + (v - d.min) / (d.max - d.min) * (x1 - x0), base = H - 30;
    el('line', { x1: x0, x2: x1, y1: base, y2: base, stroke: o.ink, 'stroke-width': 1.4 }, svg);
    const n = o.ticks * 5;
    for (let i = 0; i <= n; i++) {
      const v = d.min + (d.max - d.min) * i / n, major = i % 5 === 0;
      el('line', { x1: X(v), x2: X(v), y1: base, y2: base - (major ? 11 : 5), stroke: o.ink, 'stroke-width': major ? 1.2 : 0.7 }, svg);
      if (major) el('text', { x: X(v), y: base + 15, 'text-anchor': 'middle', 'font-size': 10.5, 'font-family': o.font, fill: o.dim }, svg).textContent = +v.toFixed(3);
    }
    el('text', { x: x1, y: H - 1, 'text-anchor': 'end', 'font-size': 10.5, 'font-family': o.font, fill: o.dim }, svg).textContent = d.unit;
    d.marks.slice().sort((a, b) => a.v - b.v).forEach((m, i) => {
      const x = X(m.v), y = 16 + i * 24, c = m.hi ? o.hi : o.ink, right = x < W * 0.62;
      el('line', { x1: x, x2: x, y1: y + 4, y2: base, stroke: c, 'stroke-width': m.hi ? 2 : 1 }, svg);
      el('circle', { cx: x, cy: y, r: m.hi ? 5 : 3.5, fill: c }, svg);
      const t = el('text', { x: x + (right ? 10 : -10), y: y + 4, 'text-anchor': right ? 'start' : 'end', 'font-size': 12.5, 'font-family': o.font, 'font-weight': m.hi ? 700 : 500, fill: c }, svg);
      t.textContent = m.label + '  ' + m.v;
    });
  };

  /* ---------- evenly spaced streamlines (after Jobard and Lefer, 1997) ---------- */
  NS.streamlines = function (o) {
    const { f, w, h } = o, dsep = o.dsep || 14, dtest = dsep * (o.test || 0.5), step = o.step || 2.5, maxPts = o.maxPts || 700, maxLines = o.maxLines || 900;
    const cs = dsep, cols = Math.ceil(w / cs) + 1, rows = Math.ceil(h / cs) + 1, grid = new Array(cols * rows);
    const lines = [], queue = (o.seeds || [[w / 2, h / 2]]).slice();
    const dir = (x, y) => { const v = f(x, y); const m = Math.hypot(v[0], v[1]); return m < 1e-9 ? null : [v[0] / m, v[1] / m]; };
    // a line ignores its own most recent points (from) and, when traced backwards, its own first points (head)
    function tooClose(x, y, d, line, from, head) {
      const cx = Math.floor(x / cs), cy = Math.floor(y / cs);
      for (let j = cy - 1; j <= cy + 1; j++) for (let i = cx - 1; i <= cx + 1; i++) {
        if (i < 0 || j < 0 || i >= cols || j >= rows) continue;
        const cell = grid[j * cols + i]; if (!cell) continue;
        for (const p of cell) { if (p[2] === line && (p[3] >= from || p[3] < head)) continue; if ((p[0] - x) ** 2 + (p[1] - y) ** 2 < d * d) return true; }
      }
      return false;
    }
    function put(x, y, line, idx) { const k = Math.floor(y / cs) * cols + Math.floor(x / cs); (grid[k] || (grid[k] = [])).push([x, y, line, idx]); }
    const K = Math.ceil(dsep * 1.6 / step);
    function trace(sx, sy, id) {
      let c = 0;
      const half = sign => {
        const pts = []; let x = sx, y = sy;
        for (let n = 0; n < maxPts; n++) {
          const d1 = dir(x, y); if (!d1) break;
          const mx = x + sign * d1[0] * step * 0.5, my = y + sign * d1[1] * step * 0.5, d2 = dir(mx, my); if (!d2) break;
          x += sign * d2[0] * step; y += sign * d2[1] * step;
          if (x < 0 || y < 0 || x >= w || y >= h) break;
          if (o.mask && o.mask(x, y)) break;
          if (tooClose(x, y, dtest, id, c - K, sign < 0 ? K : 0)) break;
          pts.push([x, y]); put(x, y, id, c++);
        }
        return pts;
      };
      put(sx, sy, id, c++);
      const fwd = half(1), back = half(-1);
      return back.reverse().concat([[sx, sy]], fwd);
    }
    while (queue.length && lines.length < maxLines) {
      const [sx, sy] = queue.shift();
      if (sx < 0 || sy < 0 || sx >= w || sy >= h || (o.mask && o.mask(sx, sy)) || tooClose(sx, sy, dsep * 0.92, -1, 0, 0)) continue;
      const id = lines.length, pts = trace(sx, sy, id);
      lines.push(pts);
      for (let i = 0; i < pts.length; i += 3) {
        const d = dir(pts[i][0], pts[i][1]); if (!d) continue;
        queue.push([pts[i][0] - d[1] * dsep, pts[i][1] + d[0] * dsep], [pts[i][0] + d[1] * dsep, pts[i][1] - d[0] * dsep]);
      }
    }
    return lines;
  };

  /* draws a streamline field into a canvas, pen-plotter style; redraws on resize */
  NS.flow = function (canvas, o) {
    o = Object.assign({ color: '#111', lw: 1, dsep: 13, draw: 2600, alpha: 1 }, o);
    const ctx = canvas.getContext('2d');
    let lines = [], W = 0, H = 0, raf = 0, t0 = 0, total = 0;
    function build() {
      const r = canvas.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
      canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const fld = o.field(W, H);
      lines = NS.streamlines(Object.assign({ w: W, h: H, dsep: o.dsep }, fld));
      total = lines.length; t0 = performance.now();
      cancelAnimationFrame(raf);
      if (reduce || o.draw === 0) paint(1); else raf = requestAnimationFrame(tick);
      if (o.onBuild) o.onBuild(W, H);
    }
    function paint(k) {
      ctx.clearRect(0, 0, W, H); ctx.lineWidth = o.lw; ctx.strokeStyle = o.color; ctx.globalAlpha = o.alpha; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      for (let i = 0; i < total; i++) {
        const start = (i / total) * 0.62, q = Math.max(0, Math.min(1, (k - start) / 0.38)); if (q <= 0) continue;
        const p = lines[i], n = Math.max(2, Math.floor(p.length * (1 - Math.pow(1 - q, 3))));
        ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]);
        for (let j = 1; j < n; j++) ctx.lineTo(p[j][0], p[j][1]);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      if (o.after) o.after(ctx, W, H, k);
    }
    function tick(now) { const k = Math.min(1, (now - t0) / o.draw); paint(k); if (k < 1) raf = requestAnimationFrame(tick); }
    let rt = 0, lastW = 0;
    new ResizeObserver(() => { const w = Math.round(canvas.getBoundingClientRect().width); if (w === lastW) return; lastW = w; clearTimeout(rt); rt = setTimeout(build, 120); }).observe(canvas);
    return { rebuild: build, repaint: () => paint(1) };
  };

  /* Leslie-Gower predator-prey system, SiNDAE's example problem and its default parameters.
     x0' = x0 (r1 - a1 x1 - b1 x0),  x1' = x1 (r2 - a2 x1 / x0). The second bracket is what the network learns. */
  NS.leslieGower = function (W, H, pad) {
    const a1 = 0.2, a2 = 0.01, r1 = 0.2, r2 = 0.2, b1 = 0.1, X0 = 0.004, X1 = 0.24, Y0 = 0, Y1 = 2.3; pad = pad || 0;
    const toX = px => X0 + (px - pad) / (W - 2 * pad) * (X1 - X0), toY = py => Y1 - (py - pad) / (H - 2 * pad) * (Y1 - Y0);
    const sx = (W - 2 * pad) / (X1 - X0), sy = (H - 2 * pad) / (Y1 - Y0);
    const eq = [(pad + (0.2 / 4.1 - X0) * sx), (pad + (Y1 - 20 * 0.2 / 4.1) * sy)];
    return {
      f(px, py) { const x = Math.max(toX(px), 1e-4), y = toY(py); return [x * (r1 - a1 * y - b1 * x) * sx, -(y * (r2 - a2 * y / x)) * sy]; },
      seeds: [[W * 0.7, H * 0.5], [W * 0.3, H * 0.3], [W * 0.5, H * 0.8], [W * 0.85, H * 0.2]],
      mask: (px, py) => Math.hypot(px - eq[0], py - eq[1]) < 7,
      eq,
    };
  };

  /* ---------- skills alignment chart ---------- */
  NS.alignment = function (svg, o) {
    o = Object.assign({ ink: '#111', dim: '#777', hi: '#c00', font: 'inherit', fill: '#fff' }, o);
    const W = 760, H = 500, xL = 215, xM = 380, xR = 545, top = 44, bot = H - 22;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('role', 'group'); svg.setAttribute('aria-label', 'Methods, projects and tools. Select any item to see what it connects to.');
    const yOf = (i, n) => top + (bot - top) * (i + 0.5) / n;
    const gL = el('g', { fill: 'none', 'stroke-linecap': 'round' }, svg), gS = el('g', {}, svg);
    [[xL, 'METHODS', 'end'], [xM, 'PROJECTS', 'middle'], [xR, 'TOOLS', 'start']].forEach(([x, t, a]) => {
      el('line', { x1: x, x2: x, y1: top - 6, y2: bot + 6, stroke: o.ink, 'stroke-width': 1.5 }, gS);
      el('text', { x: x + (a === 'end' ? -12 : a === 'start' ? 12 : 0), y: 20, 'text-anchor': a, 'font-size': 11, 'font-family': o.font, fill: o.dim, 'letter-spacing': '.1em' }, gS).textContent = t;
    });
    const pos = {}, items = [], links = [];
    function item(name, x, y, anchor, kind, label) {
      const g = el('g', { tabindex: 0, role: 'button', 'aria-label': label || name, style: 'cursor:pointer' }, gS);
      el('rect', { x: anchor === 'end' ? x - 205 : anchor === 'start' ? x : x - 70, y: y - 14, width: anchor === 'middle' ? 140 : 205, height: 28, fill: 'transparent' }, g);
      const tick = el('line', { x1: x - 7, x2: x + 7, y1: y, y2: y, stroke: o.ink, 'stroke-width': 1.5 }, g);
      let bg = null;
      if (anchor === 'middle') bg = el('rect', { x: x - 66, y: y - 13, width: 132, height: 26, rx: 2, fill: o.fill, stroke: o.ink, 'stroke-width': 1.3 }, g);
      const t = el('text', { x: x + (anchor === 'end' ? -14 : anchor === 'start' ? 14 : 0), y: y + 4.5, 'text-anchor': anchor, 'font-size': 13.5, 'font-family': o.font, fill: o.ink, 'font-weight': anchor === 'middle' ? 650 : 500 }, g);
      t.textContent = label || name;
      pos[kind + ':' + name] = [x, y];
      const it = { name, kind, g, t, tick, bg }; items.push(it); return it;
    }
    NS.methods.forEach((m, i) => item(m, xL, yOf(i, NS.methods.length), 'end', 'm'));
    NS.tools.forEach((m, i) => item(m, xR, yOf(i, NS.tools.length), 'start', 't'));
    NS.projects.forEach((p, i) => item(p.id, xM, yOf(i, NS.projects.length), 'middle', 'p', p.short));
    NS.projects.forEach(p => {
      const [px, py] = pos['p:' + p.id];
      p.methods.forEach(m => { const [x, y] = pos['m:' + m]; links.push({ p: p.id, k: 'm:' + m, n: el('line', { x1: px - 66, y1: py, x2: x + 7, y2: y, stroke: o.ink, 'stroke-width': 1 }, gL) }); });
      p.tools.forEach(m => { const [x, y] = pos['t:' + m]; links.push({ p: p.id, k: 't:' + m, n: el('line', { x1: px + 66, y1: py, x2: x - 7, y2: y, stroke: o.ink, 'stroke-width': 1 }, gL) }); });
    });
    function select(kind, name) {
      const key = kind + ':' + name, on = new Set([key]);
      links.forEach(l => { const hit = kind === 'p' ? l.p === name : l.k === key; if (hit) { on.add('p:' + l.p); if (kind === 'p') on.add(l.k); }
        l.n.setAttribute('stroke', hit ? o.hi : o.ink); l.n.setAttribute('stroke-width', hit ? 2.2 : 1); l.n.style.opacity = hit ? 1 : 0.13; });
      items.forEach(it => { const hit = on.has(it.kind + ':' + it.name), self = it.kind === kind && it.name === name;
        it.g.style.opacity = hit ? 1 : 0.38; it.t.setAttribute('fill', self ? (it.bg ? o.fill : o.hi) : o.ink); it.tick.setAttribute('stroke', hit ? o.hi : o.ink);
        if (it.bg) { it.bg.setAttribute('fill', self ? o.hi : o.fill); it.bg.setAttribute('stroke', hit ? o.hi : o.ink); }
        it.g.setAttribute('aria-pressed', self ? 'true' : 'false'); });
      if (o.onSelect) o.onSelect(kind, name, [...on]);
    }
    items.forEach(it => { const go = () => select(it.kind, it.name);
      it.g.addEventListener('pointerenter', go); it.g.addEventListener('focus', go); it.g.addEventListener('click', go);
      it.g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } }); });
    select('p', o.start || 'thesis');
    return { select };
  };

  /* fills every <div data-label="id"> with the project's label block, so copy lives in one place */
  NS.labels = function () {
    document.querySelectorAll('[data-label]').forEach(n => {
      const p = NS.byId[n.dataset.label]; if (!p) return;
      n.innerHTML = `<h2>${p.name}</h2><p class="where">${p.where}</p><p class="line">${p.line}</p>` +
        `<ul class="run">${p.facts.map(f => `<li><b>${f[0]}</b><span>${f[1]}</span></li>`).join('')}</ul>` +
        ((p.note || p.link) ? `<p class="meta">${p.note ? `<span class="note">${p.note}</span>` : ''}${p.link ? `<a href="${p.link[1]}" target="_blank" rel="noopener">${p.link[0]}</a>` : ''}</p>` : '');
    });
  };

  /* wires a network figure: <svg data-net>, caption [data-netcap], step buttons [data-netsteps] */
  NS.netFigure = function (root, theme) {
    const cap = root.querySelector('[data-netcap]'), steps = root.querySelector('[data-netsteps]');
    const btns = NS.netStates.map((s, i) => { const b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', `Step ${i + 1}: ${s.cap}`); steps.appendChild(b); return b; });
    const net = NS.net(root.querySelector('[data-net]'), Object.assign({}, theme, { onState(i, st) { if (cap) cap.textContent = st.cap; btns.forEach((b, k) => b.setAttribute('aria-current', k === i ? 'step' : 'false')); } }));
    btns.forEach((b, i) => b.addEventListener('click', () => { net.stop(); net.go(i); }));
    new IntersectionObserver(es => es.forEach(e => (e.isIntersecting ? net.play() : net.stop())), { threshold: 0.35 }).observe(root);
    return net;
  };

  /* wires a recommender figure: <svg data-rec>, tabs [data-rectabs], caption [data-reccap] */
  NS.recFigure = function (root, theme) {
    const tabs = root.querySelector('[data-rectabs]'), cap = root.querySelector('[data-reccap]');
    const rec = NS.rec(root.querySelector('[data-rec]'), theme);
    const btns = NS.recScenarios.map(s => { const b = document.createElement('button'); b.type = 'button'; b.textContent = s.name; tabs.appendChild(b); return b; });
    function pick(i) { const s = NS.recScenarios[i]; rec.play(s.id); cap.textContent = s.cap; btns.forEach((b, k) => b.setAttribute('aria-pressed', k === i ? 'true' : 'false')); }
    btns.forEach((b, i) => b.addEventListener('click', () => pick(i)));
    pick(1);
    return rec;
  };

  /* copy-to-clipboard button: <button data-copy="text"> */
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-copy]'); if (!b) return;
    const done = () => { const old = b.textContent; b.textContent = 'Copied'; setTimeout(() => (b.textContent = old), 1400); };
    try { navigator.clipboard.writeText(b.dataset.copy).then(done, () => {}); } catch (err) { /* selection fallback is the visible text */ }
  });
})();
