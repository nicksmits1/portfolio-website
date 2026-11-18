import { el, theme, mountAll } from './dom';

/* Multimodal RAG: the report's Table 1 as a ladder, mean and 95% interval per setup. */
const LR: [string, string, 'none' | 'ocr' | 'img', 0 | 1][] = [['A', 'No context', 'none', 0], ['D', 'RAG, OCR text', 'ocr', 0], ['B', 'Ideal page, OCR text', 'ocr', 0], ['E', 'RAG, page images', 'img', 0], ['G', 'RAG, images, fine-tuned', 'img', 0], ['C', 'Ideal page image', 'img', 0], ['F', 'Ideal image, fine-tuned', 'img', 0],
  ['J', 'RAG, images', 'img', 1], ['K', 'RAG, images, fine-tuned', 'img', 1], ['H', 'Ideal page image', 'img', 1], ['I', 'Ideal image, fine-tuned', 'img', 1]];
type M = { min: number; max: number; ticks: number[]; v: Record<string, [number, number, number]> };
const LM: Record<string, M> = {
  'ROUGE-L': { min: .35, max: .8, ticks: [.4, .5, .6, .7, .8], v: { A: [.4138, .3977, .4299], B: [.6021, .5844, .6198], C: [.7143, .6978, .7309], D: [.4718, .4534, .4902], E: [.6756, .6582, .6930], F: [.7407, .7243, .7572], G: [.7007, .6834, .7180], H: [.6183, .6047, .6319], I: [.6441, .6299, .6582], J: [.5848, .5705, .5991], K: [.6064, .5922, .6207] } },
  'LLM-judged accuracy': { min: 1, max: 5, ticks: [1, 2, 3, 4, 5], v: { A: [1.9658, 1.8689, 2.0627], B: [4.3211, 4.2196, 4.4227], C: [4.5994, 4.5212, 4.6777], D: [2.9575, 2.8166, 3.0983], E: [4.5324, 4.4486, 4.6126], F: [4.4978, 4.4170, 4.5786], G: [4.4323, 4.3460, 4.5186], H: [4.8107, 4.7632, 4.8582], I: [4.5537, 4.4908, 4.6166], J: [4.7406, 4.6899, 4.7913], K: [4.6359, 4.5835, 4.6882] } },
  'Groundedness': { min: 1, max: 5, ticks: [1, 2, 3, 4, 5], v: { A: [1.0228, 1.0005, 1.0452], B: [4.5902, 4.5089, 4.6714], C: [4.8399, 4.7882, 4.8917], D: [4.3871, 4.2863, 4.4879], E: [4.8239, 4.7640, 4.8839], F: [4.8100, 4.7513, 4.8686], G: [4.7941, 4.7328, 4.8554], H: [4.8503, 4.8020, 4.8986], I: [4.8515, 4.8035, 4.8994], J: [4.8343, 4.7849, 4.8837], K: [4.8044, 4.7491, 4.8598] } },
};

mountAll('[data-fig="ladder"]', root => {
  const svg = root.querySelector('svg')!, tabs = root.querySelector('[data-tabs]')!, t = theme(), Wd = 690, x0 = 210, x1 = 670, rowH = 26, top0 = 30, gap = 34;
  const Hh = top0 + LR.length * rowH + gap + 46; svg.setAttribute('viewBox', `0 0 ${Wd} ${Hh}`); svg.setAttribute('role', 'img');
  function draw(name: string) {
    const m = LM[name], X = (v: number) => x0 + (v - m.min) / (m.max - m.min) * (x1 - x0); svg.textContent = '';
    svg.setAttribute('aria-label', `${name} by setup: ` + LR.map(r => `${r[1]} ${m.v[r[0]][0]}`).join(', '));
    const yOf = (i: number) => top0 + i * rowH + (LR[i][3] ? gap : 0) + rowH / 2, base = Hh - 38;
    ([['REAL-MM-RAG: reports and slides', top0 - 12], ['Course slides (transfer)', top0 + 7 * rowH + gap - 12]] as const).forEach(([label, y]) => { el('text', { x: 12, y, 'font-size': 10.5, fill: t.fg2, 'letter-spacing': '.06em' }, svg).textContent = label.toUpperCase(); });
    m.ticks.forEach(v => { el('line', { x1: X(v), x2: X(v), y1: top0 - 4, y2: base, stroke: 'rgba(243,237,255,.12)' }, svg); el('text', { x: X(v), y: base + 16, 'text-anchor': 'middle', 'font-size': 11, fill: t.fg2 }, svg).textContent = String(v); });
    el('text', { x: x1, y: Hh - 2, 'text-anchor': 'end', 'font-size': 11, fill: t.fg2 }, svg).textContent = name + (m.max === 5 ? ', 1 to 5' : '');
    LR.forEach((r, i) => {
      const y = yOf(i), [v, lo, hi] = m.v[r[0]], c = r[2] === 'img' ? t.coral : r[2] === 'ocr' ? t.fg : t.dim;
      el('text', { x: x0 - 14, y: y + 4, 'text-anchor': 'end', 'font-size': 12.5, fill: t.fg }, svg).textContent = r[1];
      el('line', { x1: X(lo), x2: X(hi), y1: y, y2: y, stroke: c, 'stroke-width': 2 }, svg);
      el('circle', { cx: X(v), cy: y, r: 5, fill: r[2] === 'ocr' ? t.bg : c, stroke: c, 'stroke-width': 1.8 }, svg);
    });
    tabs.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b.textContent === name ? 'true' : 'false'));
  }
  tabs.innerHTML = Object.keys(LM).map(k => `<button type="button">${k}</button>`).join('');
  tabs.querySelectorAll('button').forEach(b => b.addEventListener('click', () => draw(b.textContent!)));
  draw('ROUGE-L');
});
