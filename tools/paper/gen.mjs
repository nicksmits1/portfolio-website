// Generates the static generative assets the Paper mockups place as images.
import fs from 'node:fs'; import vm from 'node:vm';
const OUT = '/Users/nicksmits/code/portfolio-website/drafts/paper-assets/';
const win = { matchMedia: () => ({ matches: true }) }; const doc = { addEventListener() {}, createElementNS() { return {}; }, querySelectorAll() { return []; } };
const ctx = vm.createContext({ window: win, document: doc, performance: { now: () => 0 }, console }); win.window = win;
vm.runInContext(fs.readFileSync('/Users/nicksmits/code/portfolio-website/drafts/shared/core.js', 'utf8'), ctx);
const NS = win.NS;
const pathOf = lines => lines.filter(l => l.length > 1).map(l => 'M' + l.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L')).join('');
const svg = (w, h, inner) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${inner}</svg>`;

// B hero: phase portrait with six fixed points, a calm block for the name, a clear corner for the nav
{ const W = 1440, H = 780;
  const cps = [[0.13, 0.2, [-0.5, -0.866, 0.866, -0.5]], [0.4, 0.27, [0, 1, -1, 0]], [0.68, 0.2, [-0.5, 0.866, -0.866, -0.5]], [0.9, 0.44, [1, 0, 0, 1]], [0.61, 0.58, [-1, 0, 0, -1]], [0.84, 0.82, [0.643, 0.766, 0.766, -0.643]]];
  const pts = cps.map(c => ({ x: c[0] * W, y: c[1] * H, m: c[2] })), sig = Math.min(W, H) * 0.3, nb = { l: 30, r: 606, t: 392, b: H };
  const lines = NS.streamlines({ w: W, h: H, dsep: 13,
    f(x, y) { let u = 0.1, v = 0.03; for (const p of pts) { const dx = x - p.x, dy = y - p.y, d = Math.hypot(dx, dy) + 1e-3, w = 1 / (1 + (d / sig) ** 2) / d; u += w * (p.m[0] * dx + p.m[1] * dy); v += w * (p.m[2] * dx + p.m[3] * dy); } return [u, v]; },
    mask(x, y) { if (x > nb.l && x < nb.r && y > nb.t && y < nb.b) return true; if (y < 56 && x > W - 330) return true; for (const p of pts) if ((x - p.x) ** 2 + (y - p.y) ** 2 < 90) return true; return false; },
    seeds: pts.map(p => [p.x + 34, p.y + 14]).concat([[W * 0.5, H * 0.45], [W * 0.08, H * 0.08], [W * 0.95, H * 0.95], [W * 0.3, H * 0.5]]) });
  fs.writeFileSync(OUT + 'b-field.svg', svg(W, H, `<path d="${pathOf(lines)}" fill="none" stroke="#F5F2E8" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" opacity="0.86"/>` + pts.map(p => `<circle cx="${p.x}" cy="${p.y}" r="6" fill="#FF8E78"/>`).join('')));
  console.log('b-field', lines.length);
}
// Leslie-Gower phase portrait, one per theme
for (const [name, ink, dot, op] of [['b-lg', '#F5F2E8', '#FF8E78', 0.9], ['e-lg', '#F3EDFF', '#FF7C6B', 0.85]]) {
  const W = 760, H = 475, f = NS.leslieGower(W, H, 0), lines = NS.streamlines(Object.assign({ w: W, h: H, dsep: 11 }, f));
  fs.writeFileSync(OUT + name + '.svg', svg(W, H, `<path d="${pathOf(lines)}" fill="none" stroke="${ink}" stroke-width="1" stroke-linecap="round" opacity="${op}"/><circle cx="${f.eq[0].toFixed(1)}" cy="${f.eq[1].toFixed(1)}" r="6" fill="${dot}"/>`));
}
// B skills: flow poles, every project attracting
{ const W = 1352, H = 440, g = 30, A = [[0.2, 0.3], [0.5, 0.2], [0.8, 0.3], [0.2, 0.74], [0.5, 0.8], [0.8, 0.74]].map(a => [a[0] * W, a[1] * H]); let s = '';
  for (let y = g / 2; y < H; y += g) for (let x = g / 2 + ((Math.round(y / g) % 2) * g) / 2; x < W; x += g) {
    let u = 0, v = 0, near = 1e9; A.forEach(([ax, ay]) => { const dx = ax - x, dy = ay - y, d2 = dx * dx + dy * dy + 80; u += dx / d2; v += dy / d2; near = Math.min(near, Math.sqrt(d2)); });
    const a = Math.atan2(v, u), k = Math.max(0.22, Math.min(1, 150 / near)), L = 5 + 8 * k, c = Math.cos(a), si = Math.sin(a), o = (0.35 + 0.65 * k).toFixed(2);
    s += `<path d="M${(x - c * L).toFixed(1)} ${(y - si * L).toFixed(1)}L${(x + c * L).toFixed(1)} ${(y + si * L).toFixed(1)}" stroke="#F5F2E8" stroke-width="1.1" stroke-linecap="round" opacity="${o}"/><circle cx="${(x + c * L).toFixed(1)}" cy="${(y + si * L).toFixed(1)}" r="1.9" fill="#F5F2E8" opacity="${o}"/>`; }
  fs.writeFileSync(OUT + 'b-poles.svg', svg(W, H, s));
}
// E: solver path on the hero landscape (same function as the shader, T = 0)
{ const W = 1440, H = 800, asp = W / H, wide = { sepsis: [0.12, 0.25], sindae: [0.36, 0.19], thesis: [0.61, 0.3], recsys: [0.86, 0.2], fifa: [0.58, 0.7], wayfinder: [0.85, 0.66] };
  const pts = Object.entries(wide).map(([id, q]) => ({ id, x: q[0] * asp, y: q[1], c: 0.82, s: 0.125 })).concat([{ id: 'contact', x: 0.2 * asp, y: 0.74, c: 0.86, s: 0.27 }]);
  const F = (x, y) => { let f = 0.12 * Math.sin(2.1 * x + 0.6) * Math.cos(1.7 * y - 0.4) + 0.08 * Math.sin(3.3 * y + 1.2 * x + 1.0); for (const p of pts) { const dx = x - p.x, dy = y - p.y; f -= p.c * Math.exp(-(dx * dx + dy * dy) / (2 * p.s * p.s)); } return f; };
  let x = 0.47 * asp, y = 0.52, vx = 0, vy = 0; const path = [[x, y]], h = 1e-3;
  for (let k = 0; k < 220; k++) { const gx = (F(x + h, y) - F(x - h, y)) / (2 * h), gy = (F(x, y + h) - F(x, y - h)) / (2 * h); vx = 0.8 * vx - 0.011 * gx; vy = 0.8 * vy - 0.011 * gy; x += vx; y += vy; path.push([x, y]); if (Math.hypot(gx, gy) < 0.02 && Math.hypot(vx, vy) < 4e-4) break; }
  const px = p => [(p[0] * H).toFixed(1), (p[1] * H).toFixed(1)], end = px(path[path.length - 1]), st = px(path[0]);
  fs.writeFileSync(OUT + 'e-path.svg', svg(W, H, `<polyline points="${path.map(p => px(p).join(',')).join(' ')}" fill="none" stroke="#F3EDFF" stroke-width="1.6" stroke-linejoin="round"/>` + path.map(p => `<circle cx="${px(p)[0]}" cy="${px(p)[1]}" r="2.1" fill="#F3EDFF"/>`).join('') + `<circle cx="${st[0]}" cy="${st[1]}" r="5" fill="none" stroke="#F3EDFF" stroke-width="1.6"/><circle cx="${end[0]}" cy="${end[1]}" r="9" fill="none" stroke="#FF7C6B" stroke-width="2.4"/>`));
  let best = null, bd = 9; pts.forEach(p => { const d = Math.hypot(p.x - path[path.length - 1][0], p.y - path[path.length - 1][1]); if (d < bd) { bd = d; best = p.id; } });
  console.log('e-path iterations', path.length - 1, 'lands on', best);
}
console.log(fs.readdirSync(OUT).map(f => f + ' ' + Math.round(fs.statSync(OUT + f).size / 1024) + 'k').join('\n'));
