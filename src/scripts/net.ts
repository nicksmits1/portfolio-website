import { el, reduce, theme, whileVisible, mountAll } from './dom';
import { N, BASE, ADDED } from './scnet';

/* Supply chain episode. Illustrative until a trace exported from the trained policy replaces it. */
const STATES = [
  { cap: 'The network', added: 0, fail: false },
  { cap: 'Warehouse W2 fails. Customer C3 has no supply.', added: 0, fail: true },
  { cap: 'The policy adds W1 → C3', added: 1, fail: false, fresh: 0 },
  { cap: 'then P1 → W3, and stops', added: 2, fail: false, fresh: 1 },
  { cap: 'W2 fails again. Demand still arrives.', added: 2, fail: true },
];

function net(svg: SVGSVGElement, onState: (i: number, cap: string) => void) {
  const t = theme(), ink = t.fg, fresh = t.coral, dim = t.dim, fill = t.bg, bad = t.coral, sw = 1.6, interval = 2200;
  svg.setAttribute('viewBox', '0 0 640 370');
  svg.setAttribute('role', 'img');
  const gA = el('g', { fill: 'none', 'stroke-linecap': 'round' }, svg), gN = el('g', {}, svg);
  const seg = (a: string, b: string) => {
    const [x1, y1] = N[a], [x2, y2] = N[b], d = Math.hypot(x2 - x1, y2 - y1), r = 21;
    return [x1 + (x2 - x1) * r / d, y1 + (y2 - y1) * r / d, x2 - (x2 - x1) * (r + 5) / d, y2 - (y2 - y1) * (r + 5) / d];
  };
  const arc = (a: string, b: string) => {
    const [x1, y1, x2, y2] = seg(a, b), g = el('g', {}, gA), ang = Math.atan2(y2 - y1, x2 - x1), h = 8;
    const line = el('line', { x1, y1, x2, y2, pathLength: 1 }, g);
    const head = el('path', { d: `M${x2 + 4 * Math.cos(ang)} ${y2 + 4 * Math.sin(ang)} L${x2 - h * Math.cos(ang - 0.42)} ${y2 - h * Math.sin(ang - 0.42)} L${x2 - h * Math.cos(ang + 0.42)} ${y2 - h * Math.sin(ang + 0.42)} Z`, stroke: 'none' }, g);
    return { g, line, head, a, b };
  };
  const base = BASE.map(([a, b]) => arc(a, b)), added = ADDED.map(([a, b]) => arc(a, b));
  const nodes: Record<string, { s: SVGElement; tx: SVGTextElement }> = {};
  for (const k in N) {
    const [x, y, kind] = N[k], g = el('g', {}, gN);
    const s = kind === 'p' ? el('rect', { x: x - 16, y: y - 16, width: 32, height: 32 }, g)
      : kind === 'w' ? el('path', { d: `M${x - 17} ${y + 15} V${y - 4} L${x} ${y - 18} L${x + 17} ${y - 4} V${y + 15} Z` }, g)
      : el('circle', { cx: x, cy: y, r: 16 }, g);
    s.setAttribute('stroke-width', String(sw * 1.25));
    const tx = el('text', { x, y: y + (kind === 'w' ? 6 : 4), 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 600, stroke: 'none' }, g);
    tx.textContent = k;
    nodes[k] = { s, tx };
  }
  const cross = el('path', { d: `M${N.W2[0] - 24} ${N.W2[1] - 24} l48 48 m0 -48 l-48 48`, stroke: bad, 'stroke-width': 3.5, 'stroke-linecap': 'round', fill: 'none' }, svg);
  const tiers = el('g', { 'font-size': 10.5, fill: dim, 'text-anchor': 'middle', 'letter-spacing': '.08em' }, svg);
  ([['PLANTS', 80], ['WAREHOUSES', 320], ['CUSTOMERS', 560]] as const).forEach(([label, x]) => { el('text', { x, y: 366 }, tiers).textContent = label; });

  let cur = -1, timer = 0;
  function paint(i: number, animate: boolean) {
    const st = STATES[i], failed = st.fail, arcs = base.concat(added.slice(0, st.added));
    const ok = (a: { a: string; b: string }) => !(failed && (a.a === 'W2' || a.b === 'W2'));
    const whOk = new Set<string>(), served = new Set<string>();
    arcs.filter(ok).forEach(a => { if (N[a.a][2] === 'p') whOk.add(a.b); });
    arcs.filter(ok).forEach(a => { if (N[a.b][2] === 'c' && whOk.has(a.a)) served.add(a.b); });
    base.forEach(a => {
      const dead = !ok(a);
      a.line.setAttribute('stroke', dead ? dim : ink); a.head.setAttribute('fill', dead ? dim : ink);
      a.line.setAttribute('stroke-width', String(sw)); a.line.setAttribute('stroke-dasharray', dead ? '0.03 0.035' : 'none');
      a.g.style.opacity = dead ? '0.55' : '1';
    });
    added.forEach((a, k) => {
      const on = k < st.added;
      a.g.style.display = on ? '' : 'none';
      if (!on) return;
      a.line.setAttribute('stroke', fresh); a.head.setAttribute('fill', fresh); a.line.setAttribute('stroke-width', String(sw * 1.9));
      if (animate && st.fresh === k && !reduce) {
        a.line.style.transition = 'none'; a.line.setAttribute('stroke-dasharray', '1 1'); a.line.style.strokeDashoffset = '1'; a.head.style.opacity = '0';
        a.line.getBoundingClientRect();
        a.line.style.transition = 'stroke-dashoffset .9s cubic-bezier(.2,.8,.2,1)'; a.line.style.strokeDashoffset = '0';
        a.head.style.transition = 'opacity .2s .75s'; a.head.style.opacity = '1';
      } else { a.line.setAttribute('stroke-dasharray', 'none'); a.line.style.strokeDashoffset = '0'; a.head.style.opacity = '1'; }
    });
    for (const k in nodes) {
      const n = nodes[k], kind = N[k][2], dead = failed && k === 'W2', starved = kind === 'c' && !served.has(k);
      n.s.setAttribute('fill', starved ? 'none' : kind === 'c' ? ink : fill);
      n.s.setAttribute('stroke', dead ? dim : starved ? bad : ink);
      n.s.setAttribute('stroke-dasharray', starved ? '4 3' : 'none');
      n.tx.setAttribute('fill', dead ? dim : starved ? bad : kind === 'c' ? fill : ink);
    }
    cross.style.display = failed ? '' : 'none';
    svg.setAttribute('aria-label', 'Supply chain network. ' + st.cap);
    cur = i;
    onState(i, st.cap);
  }
  const api = {
    go(i: number, animate = true) { paint((i + STATES.length) % STATES.length, animate); },
    play() { if (reduce || timer) return; timer = window.setInterval(() => api.go(cur + 1), interval); },
    stop() { clearInterval(timer); timer = 0; },
  };
  api.go(reduce ? 3 : 0, false);
  return api;
}

mountAll('[data-fig="net"]', root => {
  const cap = root.querySelector('[data-netcap]')!, steps = root.querySelector('[data-netsteps]')!;
  const btns = STATES.map((s, i) => { const b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', `Step ${i + 1}: ${s.cap}`); steps.appendChild(b); return b; });
  const n = net(root.querySelector('svg')!, (i, c) => { cap.textContent = c; btns.forEach((b, k) => b.setAttribute('aria-current', k === i ? 'step' : 'false')); });
  btns.forEach((b, i) => b.addEventListener('click', () => { n.stop(); n.go(i); }));
  whileVisible(root, () => n.play(), () => n.stop());
});
