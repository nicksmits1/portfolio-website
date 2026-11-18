import { el, reduce, theme, mountAll, gate, tween } from './dom';
import { N as EP, BASE, ADDED } from './scnet';

/* Thesis design policy: the environment holds the network; the agent embeds its nodes (two GATv2 rounds), flies each
   candidate arc's inputs [h_i ‖ h_j ‖ ρ_k ‖ e_ij] into the shared MLP g_ψ, grows that arc's Q bar, adds the best
   positive arc and repeats until every Q is at or below zero. Q-values are an example, on the episode's network. */
const SANS = 'Onest, system-ui, sans-serif', SERIF = '"STIX Two Math", "STIX Two Text", serif';
const N: Record<string, [number, number, string]> = Object.fromEntries(
  Object.entries(EP).map(([k, [x, y, kind]]) => [k, [46 + (x - 80) * 0.45, 17 + y * 0.93, kind]]),
);
const CAND = [...ADDED, ['W3', 'C3'], ['P2', 'W1'], ['W2', 'C4']];
const Q: (number | null)[][] = [[.31, .22, .18, -.04, .09], [null, .19, .05, -.07, .02], [null, null, -.02, -.09, -.05]];
const RAMP = ['#4B2CA8', '#7044E8', '#EE6B60', '#FFD6BF', '#9B7BFF', '#2A1670'];

mountAll('[data-fig="policy"]', root => {
  const svg = root.querySelector('svg')!, step = root.querySelector<HTMLElement>('[data-step]')!, t = theme(), wait = gate(root);
  svg.setAttribute('viewBox', '0 0 860 400');
  const txt = (p: Element, x: number, y: number, s: string, a: Record<string, string | number> = {}) => { const n = el('text', { x, y, fill: t.fg, 'font-family': SANS, ...a }, p); n.textContent = s; return n; };
  const mth = (p: Element, x: number, y: number, base: string, sub: string, a: Record<string, string | number> = {}) => {
    const n = el('text', { x, y, fill: t.fg, 'font-family': SERIF, 'font-style': 'italic', 'font-size': 15, ...a }, p);
    el('tspan', {}, n).textContent = base;
    if (sub) el('tspan', { 'font-size': '0.7em', dy: 4 }, n).textContent = sub;
    return n;
  };
  const region = 'rgba(243,237,255,.28)';

  /* environment and agent */
  const gR = el('g', {}, svg);
  el('rect', { x: 6, y: 18, width: 300, height: 372, rx: 12, fill: 'rgba(243,237,255,.02)', stroke: region, 'stroke-dasharray': '5 4' }, gR);
  el('rect', { x: 346, y: 18, width: 508, height: 372, rx: 12, fill: 'rgba(243,237,255,.02)', stroke: region, 'stroke-dasharray': '5 4' }, gR);
  txt(gR, 20, 38, 'ENVIRONMENT', { 'font-size': 10, 'font-weight': 600, fill: t.fg2, 'letter-spacing': '.14em' });
  mth(gR, 128, 39, 'G', 'k', { 'font-size': 13, fill: t.fg2 });
  txt(gR, 360, 38, 'AGENT', { 'font-size': 10, 'font-weight': 600, fill: t.fg2, 'letter-spacing': '.14em' });
  const sArr = el('path', { d: 'M306 64 H340', stroke: t.fg2, 'stroke-width': 1.4 }, gR); el('path', { d: 'M345 64 l-7 -4 v8 z', fill: t.fg2 }, gR);
  mth(gR, 316, 56, 's', 'k', { 'font-size': 13, fill: t.fg2 });
  const aArr = el('path', { d: 'M346 360 H312', stroke: t.fg2, 'stroke-width': 1.4 }, gR), aHead = el('path', { d: 'M307 360 l7 -4 v8 z', fill: t.fg2 }, gR);
  mth(gR, 316, 352, 'a', 'k', { 'font-size': 13, fill: t.fg2 });

  const gA = el('g', { fill: 'none', 'stroke-linecap': 'round' }, svg), gP = el('g', {}, svg), gN = el('g', {}, svg), gH = el('g', {}, svg), gM = el('g', {}, svg), gF = el('g', {}, svg);
  const seg = (a: string, b: string, r = 17) => { const [x1, y1] = N[a], [x2, y2] = N[b], d = Math.hypot(x2 - x1, y2 - y1); return [x1 + (x2 - x1) * r / d, y1 + (y2 - y1) * r / d, x2 - (x2 - x1) * (r + 2) / d, y2 - (y2 - y1) * (r + 2) / d]; };
  type Style = 'base' | 'cand' | 'hot' | 'added';
  const arc = (a: string, b: string, style: Style) => {
    const [x1, y1, x2, y2] = seg(a, b), g = el('g', {}, gA), ang = Math.atan2(y2 - y1, x2 - x1), h = 6;
    const line = el('line', { x1, y1, x2, y2 }, g);
    const head = el('path', { d: `M${x2 + 3 * Math.cos(ang)} ${y2 + 3 * Math.sin(ang)} L${x2 - h * Math.cos(ang - .45)} ${y2 - h * Math.sin(ang - .45)} L${x2 - h * Math.cos(ang + .45)} ${y2 - h * Math.sin(ang + .45)} Z`, stroke: 'none' }, g);
    const set = (s: Style) => {
      const col = s === 'cand' ? t.dim : s === 'hot' ? t.fg : s === 'added' ? t.coral : t.fg2;
      line.setAttribute('stroke', col); head.setAttribute('fill', col);
      line.setAttribute('stroke-dasharray', s === 'cand' || s === 'hot' ? '4 4' : 'none'); line.setAttribute('stroke-width', s === 'added' || s === 'hot' ? '2.2' : '1.4');
    };
    set(style);
    return { set, mid: [(x1 + x2) / 2, (y1 + y2) / 2] as [number, number] };
  };
  BASE.forEach(([a, b]) => arc(a, b, 'base'));
  const cand = CAND.map(([a, b]) => arc(a, b, 'cand'));

  /* plant, warehouse and customer icons */
  for (const k in N) {
    const [x, y, kind] = N[k], g = el('g', { fill: t.bg, stroke: t.fg, 'stroke-width': 1.5, 'stroke-linejoin': 'round' }, gN);
    if (kind === 'p') {
      el('path', { d: `M${x - 13} ${y + 11} V${y - 2} L${x - 7} ${y - 7} V${y - 2} L${x - 1} ${y - 7} V${y - 2} L${x + 5} ${y - 7} V${y - 13} H${x + 11} V${y + 11} Z` }, g);
      el('path', { d: `M${x - 8} ${y + 5} h4 M${x - 1} ${y + 5} h4`, 'stroke-linecap': 'round' }, g);
    } else if (kind === 'w') {
      el('path', { d: `M${x - 14} ${y + 11} V${y - 3} L${x} ${y - 12} L${x + 14} ${y - 3} V${y + 11} Z` }, g);
      el('path', { d: `M${x - 7} ${y + 11} V${y + 1} H${x + 7} V${y + 11} M${x - 7} ${y + 5} H${x + 7}`, fill: 'none' }, g);
    } else {
      el('circle', { cx: x, cy: y - 6, r: 5 }, g);
      el('path', { d: `M${x - 10} ${y + 11} C${x - 10} ${y + 3} ${x - 5} ${y} ${x} ${y} S${x + 10} ${y + 3} ${x + 10} ${y + 11} Z` }, g);
    }
    txt(gN, x, y + 26, k, { 'text-anchor': 'middle', 'font-size': 9.5, 'font-weight': 600, fill: t.fg2 });
  }
  /* one embedding strip per node */
  const strips: Record<string, { g: SVGGElement; x: number; y: number; cols: string[] }> = {};
  Object.entries(N).forEach(([k, [x, y]], i) => {
    const g = el('g', { opacity: 0 }, gH), cols = [0, 1, 2, 3].map(j => RAMP[(i * 3 + j * 2) % RAMP.length]);
    cols.forEach((c, j) => el('rect', { x: x + 15 + j * 5.5, y: y - 20, width: 5, height: 5, rx: 1, fill: c }, g));
    strips[k] = { g, x: x + 15, y: y - 20, cols };
  });
  const showStrips = (on: boolean) => Object.values(strips).forEach(s => s.g.setAttribute('opacity', on ? '1' : '0'));

  /* input slots */
  const SL = { hi: 120, hj: 154, rho: 188, e: 222 }, SX = 386, SW = 48;
  const lab: Record<keyof typeof SL, [string, string]> = { hi: ['h', 'i'], hj: ['h', 'j'], rho: ['ρ', 'k'], e: ['e', 'ij'] };
  const slots = (Object.keys(SL) as (keyof typeof SL)[]).map(k => {
    mth(gM, SX - 24, SL[k] + 17, ...lab[k], { 'font-size': 14, fill: t.fg2 });
    return el('rect', { x: SX, y: SL[k], width: SW, height: 24, rx: 5, fill: t.panel, stroke: t.dim, 'stroke-width': 1.1 }, gM);
  });
  const rhoT = txt(gM, SX + SW / 2, SL.rho + 16, '1.0', { 'text-anchor': 'middle', 'font-size': 11, 'font-weight': 600, fill: t.peach, opacity: 0 });
  /* the MLP g_psi */
  const LX = [480, 520, 560], LAY = [[136, 158, 180, 202, 224], [147, 169, 191, 213], [180]];
  el('rect', { x: 462, y: 118, width: 116, height: 128, rx: 12, fill: 'none', stroke: t.fg2, 'stroke-width': 1.3 }, gM);
  mth(gM, 520, 270, 'g', 'ψ', { 'font-size': 18, 'text-anchor': 'middle' });
  const wires: SVGLineElement[][] = [[], []];
  for (let l = 0; l < 2; l++) LAY[l].forEach(y1 => LAY[l + 1].forEach(y2 => wires[l].push(el('line', { x1: LX[l], y1, x2: LX[l + 1], y2, stroke: t.dim, 'stroke-width': .8, opacity: .55 }, gM))));
  const inWires = Object.values(SL).map(y => el('path', { d: `M${SX + SW} ${y + 12} C${SX + SW + 14} ${y + 12} ${LX[0] - 18} 180 ${LX[0] - 6} 180`, fill: 'none', stroke: t.dim, 'stroke-width': .9, opacity: .55 }, gM));
  const neurons = LAY.flatMap((ys, l) => ys.map(y => ({ l, c: el('circle', { cx: LX[l], cy: y, r: 4.2, fill: t.bg, stroke: t.fg2, 'stroke-width': 1.2 }, gM) })));
  /* Q column: the predicted gain in design value */
  const ZX = 730, SC = 280, RX = 604;
  const qh = mth(gM, RX, 64, 'Q', '', { 'font-size': 14 });
  el('tspan', { 'font-family': SANS, 'font-style': 'normal', 'font-size': 11, fill: t.fg2, dx: 6 }, qh).textContent = 'gain in design value';
  const rows = CAND.map(([a, b], i) => {
    const y = 104 + i * 46;
    return { y, lab: txt(gM, RX, y + 4, `${a} → ${b}`, { 'font-size': 12, 'font-weight': 600 }), bar: el('rect', { x: ZX, y: y - 7, width: 0, height: 14, rx: 2, fill: t.fg }, gM), val: txt(gM, ZX, y + 4, '', { 'font-size': 10.5, fill: t.fg2 }) };
  });
  el('line', { x1: ZX, y1: 82, x2: ZX, y2: 316, stroke: t.dim, 'stroke-width': 1 }, gM);
  txt(gM, ZX, 330, '0', { 'text-anchor': 'middle', 'font-size': 10, fill: t.dim });
  const stopR = el('rect', { x: ZX - 34, y: 344, width: 68, height: 26, rx: 13, fill: 'none', stroke: t.dim, 'stroke-width': 1.3 }, gM);
  const stopT = txt(gM, ZX, 361, 'stop', { 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 600, fill: t.dim });
  const flow = el('circle', { r: 4.5, fill: t.coral, opacity: 0 }, gF);

  type Row = (typeof rows)[number];
  const setBar = (r: Row, q: number | null, chosen = false) => {
    if (q === null) return;
    const w = Math.abs(q) * SC;
    r.bar.setAttribute('x', String(q >= 0 ? ZX : ZX - w)); r.bar.setAttribute('width', String(w));
    r.bar.setAttribute('fill', chosen ? t.coral : q >= 0 ? t.fg : t.dim);
    r.val.textContent = q.toFixed(2); r.val.setAttribute('x', String(q >= 0 ? ZX + w + 6 : ZX + 6));
  };
  const clearRow = (r: Row) => { r.bar.setAttribute('width', '0'); r.val.textContent = ''; };
  const markAdded = (r: Row, k: number) => { r.bar.setAttribute('width', '0'); r.val.textContent = `added, step ${k}`; r.val.setAttribute('x', String(ZX + 6)); r.val.setAttribute('fill', t.coral); r.lab.setAttribute('fill', t.coral); };
  const lit = (on: boolean) => { stopR.setAttribute('fill', on ? t.coral : 'none'); stopR.setAttribute('stroke', on ? t.coral : t.dim); stopT.setAttribute('fill', on ? t.bg : t.dim); };
  const say = (s: string) => { step.textContent = s; };
  const setRho = (v: number) => { rhoT.textContent = v.toFixed(1); };

  function finalState() {
    cand[0].set('added'); cand[1].set('added'); markAdded(rows[0], 1); markAdded(rows[1], 2);
    [2, 3, 4].forEach(i => setBar(rows[i], Q[2][i]));
    showStrips(true); setRho(.6); rhoT.setAttribute('opacity', '1'); lit(true); say('Stop');
  }
  if (reduce) { finalState(); return; }

  const flyer = (cols: string[], x: number, y: number) => { const g = el('g', {}, gF); cols.forEach((c, j) => el('rect', { x: x + j * 5.5, y, width: 5, height: 5, rx: 1, fill: c }, g)); return g; };
  const fly = (g: SVGGElement, dx: number, dy: number, ms: number) => tween(ms, e => g.setAttribute('transform', `translate(${dx * e} ${dy * e})`));
  async function rounds(edges: string[][], fast: boolean) {
    say('Node and arc embedding');
    for (let r = 0; r < 2; r++) {
      const dots = edges.flatMap(([a, b]) => [[a, b], [b, a]].map(([u, v]) => ({ u, v, c: el('circle', { r: 2.6, fill: t.peach }, gP) })));
      await tween(fast ? 700 : 1100, e => dots.forEach(({ u, v, c }) => { const [x1, y1] = N[u], [x2, y2] = N[v]; c.setAttribute('cx', String(x1 + (x2 - x1) * e)); c.setAttribute('cy', String(y1 + (y2 - y1) * e)); }));
      dots.forEach(d => d.c.remove());
      await wait(250);
    }
    showStrips(true); await wait(500);
    sArr.setAttribute('stroke', t.fg); await wait(500); sArr.setAttribute('stroke', t.fg2);
  }
  async function scoreOne(i: number, q: number) {
    const [a, b] = CAND[i], c = cand[i], tx = SX + (SW - 21.5) / 2, ty = (y: number) => y + 9.5;
    c.set('hot');
    const fi = flyer(strips[a].cols, strips[a].x, strips[a].y), fj = flyer(strips[b].cols, strips[b].x, strips[b].y);
    const ex = c.mid[0] - 11, ey = c.mid[1] - 2.5, fe = flyer([t.peach, '#9B7BFF', t.coral, t.peach], ex, ey);
    await Promise.all([fly(fi, tx - strips[a].x, ty(SL.hi) - strips[a].y, 900), fly(fj, tx - strips[b].x, ty(SL.hj) - strips[b].y, 900), fly(fe, tx - ex, ty(SL.e) - ey, 900)]);
    slots.forEach(s => s.setAttribute('stroke', t.fg)); rhoT.setAttribute('opacity', '1');
    await wait(300);
    const light = (l: number, col: string) => neurons.filter(n => n.l === l).forEach(n => n.c.setAttribute('fill', col));
    inWires.forEach(w => { w.setAttribute('stroke', t.fg); w.setAttribute('opacity', '1'); });
    light(0, t.fg2); await wait(260);
    wires[0].forEach(w => { w.setAttribute('stroke', t.fg2); w.setAttribute('opacity', '.9'); }); light(1, t.fg2); await wait(260);
    wires[1].forEach(w => { w.setAttribute('stroke', t.fg2); w.setAttribute('opacity', '.9'); }); light(2, t.coral); await wait(200);
    flow.setAttribute('opacity', '1');
    await tween(600, e => { flow.setAttribute('cx', String(566 + (RX - 8 - 566) * e)); flow.setAttribute('cy', String(180 + (rows[i].y - 180) * e)); });
    flow.setAttribute('opacity', '0');
    await tween(500, e => setBar(rows[i], q * e));
    [fi, fj, fe].forEach(f => f.remove()); c.set('cand');
    slots.forEach(s => s.setAttribute('stroke', t.dim));
    [...inWires, ...wires.flat()].forEach(w => { w.setAttribute('stroke', t.dim); w.setAttribute('opacity', '.55'); });
    neurons.forEach(n => n.c.setAttribute('fill', t.bg));
    await wait(350);
  }
  (async () => {
    await wait(0);
    for (;;) {
      cand.forEach(c => c.set('cand')); rows.forEach(r => { clearRow(r); r.lab.setAttribute('fill', t.fg); r.val.setAttribute('fill', t.fg2); });
      showStrips(false); lit(false); setRho(1); rhoT.setAttribute('opacity', '0');
      const added: number[] = [];
      for (let k = 0; k < 3; k++) {
        await rounds(BASE.concat(added.map(i => CAND[i])), k > 0);
        const open = [0, 1, 2, 3, 4].filter(i => !added.includes(i));
        open.forEach(i => clearRow(rows[i]));
        say('Candidate arc scoring');
        for (const i of open) await scoreOne(i, Q[k][i]!);
        const best = open.reduce((m, i) => (Q[k][i]! > Q[k][m]! ? i : m), open[0]);
        if (Q[k][best]! <= 0) { lit(true); say('Stop'); await wait(4200); break; }
        setBar(rows[best], Q[k][best], true); say(`Arc added, ${CAND[best][0]} → ${CAND[best][1]}`); await wait(900);
        aArr.setAttribute('stroke', t.coral); aHead.setAttribute('fill', t.coral); await wait(700);
        aArr.setAttribute('stroke', t.fg2); aHead.setAttribute('fill', t.fg2);
        cand[best].set('added'); added.push(best); markAdded(rows[best], added.length); setRho(1 - added.length * .2);
        await wait(1800);
      }
      await wait(800);
    }
  })();
});
