import { reduce, theme, whileVisible, mountAll } from './dom';

type Vec = [number, number];
/* Evenly spaced streamlines, after Jobard and Lefer (1997). Our own implementation (see AGENTS.md on Book of Shapes). */
export function streamlines(o: { f: (x: number, y: number) => Vec; w: number; h: number; dsep?: number; seeds?: Vec[]; mask?: (x: number, y: number) => boolean }) {
  const { f, w, h } = o, dsep = o.dsep ?? 14, dtest = dsep * 0.5, step = 2.5, maxPts = 700, maxLines = 900;
  const cs = dsep, cols = Math.ceil(w / cs) + 1, rows = Math.ceil(h / cs) + 1, grid: number[][][] = new Array(cols * rows);
  const lines: Vec[][] = [], queue: Vec[] = (o.seeds ?? [[w / 2, h / 2]]).slice();
  const dir = (x: number, y: number): Vec | null => { const v = f(x, y), m = Math.hypot(v[0], v[1]); return m < 1e-9 ? null : [v[0] / m, v[1] / m]; };
  function tooClose(x: number, y: number, d: number, line: number, from: number, head: number) {
    const cx = Math.floor(x / cs), cy = Math.floor(y / cs);
    for (let j = cy - 1; j <= cy + 1; j++) for (let i = cx - 1; i <= cx + 1; i++) {
      if (i < 0 || j < 0 || i >= cols || j >= rows) continue;
      const cell = grid[j * cols + i]; if (!cell) continue;
      for (const p of cell) { if (p[2] === line && (p[3] >= from || p[3] < head)) continue; if ((p[0] - x) ** 2 + (p[1] - y) ** 2 < d * d) return true; }
    }
    return false;
  }
  const put = (x: number, y: number, line: number, idx: number) => { const k = Math.floor(y / cs) * cols + Math.floor(x / cs); (grid[k] ||= []).push([x, y, line, idx]); };
  const K = Math.ceil(dsep * 1.6 / step);
  function trace(sx: number, sy: number, id: number) {
    let c = 0;
    const half = (sign: number) => {
      const pts: Vec[] = []; let x = sx, y = sy;
      for (let n = 0; n < maxPts; n++) {
        const d1 = dir(x, y); if (!d1) break;
        const d2 = dir(x + sign * d1[0] * step * 0.5, y + sign * d1[1] * step * 0.5); if (!d2) break;
        x += sign * d2[0] * step; y += sign * d2[1] * step;
        if (x < 0 || y < 0 || x >= w || y >= h || o.mask?.(x, y) || tooClose(x, y, dtest, id, c - K, sign < 0 ? K : 0)) break;
        pts.push([x, y]); put(x, y, id, c++);
      }
      return pts;
    };
    put(sx, sy, id, c++);
    const fwd = half(1), back = half(-1);
    return back.reverse().concat([[sx, sy]], fwd);
  }
  while (queue.length && lines.length < maxLines) {
    const [sx, sy] = queue.shift()!;
    if (sx < 0 || sy < 0 || sx >= w || sy >= h || o.mask?.(sx, sy) || tooClose(sx, sy, dsep * 0.92, -1, 0, 0)) continue;
    const id = lines.length, pts = trace(sx, sy, id);
    lines.push(pts);
    for (let i = 0; i < pts.length; i += 3) {
      const d = dir(pts[i][0], pts[i][1]); if (!d) continue;
      queue.push([pts[i][0] - d[1] * dsep, pts[i][1] + d[0] * dsep], [pts[i][0] + d[1] * dsep, pts[i][1] - d[0] * dsep]);
    }
  }
  return lines;
}

/* Two-tank cascade, the JOSS paper's example and parameters (paper/example.ipynb): A1 h1' = Fin - q1,
   A2 h2' = q1 - c2 sqrt(h2); the true q1 = c1 sqrt(h1) is what the network learns. Three training trajectories, RK4. */
export function twoTank(W: number, H: number) {
  const A1 = 1, A2 = 1.5, Fin = 0.5, c1 = 0.5, c2 = 0.4, X1 = 3.2, Y1 = 3.0, sx = W / X1, sy = H / Y1;
  const toX = (px: number) => px / sx, toY = (py: number) => Y1 - py / sy, fromX = (h: number) => h * sx, fromY = (h: number) => (Y1 - h) * sy;
  const rate = (h1: number, h2: number): Vec => { const q1 = c1 * Math.sqrt(Math.max(h1, 0)), q2 = c2 * Math.sqrt(Math.max(h2, 0)); return [(Fin - q1) / A1, (q1 - q2) / A2]; };
  const eq: Vec = [fromX((Fin / c1) ** 2), fromY((Fin / c2) ** 2)];
  const trajectory = (h: Vec) => {
    const pts: Vec[] = [[fromX(h[0]), fromY(h[1])]], dt = 0.05; let [a, b] = h;
    for (let t = 0; t < 40; t += dt) {
      const k1 = rate(a, b), k2 = rate(a + dt / 2 * k1[0], b + dt / 2 * k1[1]), k3 = rate(a + dt / 2 * k2[0], b + dt / 2 * k2[1]), k4 = rate(a + dt * k3[0], b + dt * k3[1]);
      a += dt / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]); b += dt / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
      pts.push([fromX(a), fromY(b)]);
    }
    return pts;
  };
  return {
    f: (px: number, py: number): Vec => { const d = rate(toX(px), toY(py)); return [d[0] * sx, -d[1] * sy]; },
    seeds: [[W * 0.5, H * 0.5], [W * 0.15, H * 0.2], [W * 0.85, H * 0.8], [W * 0.8, H * 0.15], [W * 0.2, H * 0.85]] as Vec[],
    mask: (px: number, py: number) => Math.hypot(px - eq[0], py - eq[1]) < 7,
    eq,
    trajectories: ([[3.0, 0.5], [0.5, 2.5], [2.0, 1.0]] as Vec[]).map(trajectory),
  };
}

/* The lead figure: streamlines draw in, then the paper's trajectories in peach, the steady state in coral. */
mountAll('[data-fig="flow"]', root => {
  const cv = root.querySelector('canvas')!, ctx = cv.getContext('2d')!, t = theme();
  let raf = 0, t0 = 0, done = false, paintAt: (k: number) => void = () => {};
  function build() {
    const r = cv.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2), W = Math.max(1, Math.round(r.width)), H = Math.max(1, Math.round(r.height));
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const phone = W < 600, fld = twoTank(W, H), L = streamlines({ ...fld, w: W, h: H, dsep: phone ? 13 : 15 }), n = L.length;
    paintAt = (k: number) => {
      ctx.clearRect(0, 0, W, H); ctx.lineWidth = phone ? 1.1 : 1.3; ctx.strokeStyle = t.fg; ctx.globalAlpha = 0.85; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      for (let i = 0; i < n; i++) {
        const s = (i / n) * 0.62, q = Math.max(0, Math.min(1, (k - s) / 0.38)); if (q <= 0) continue;
        const p = L[i], m = Math.max(2, Math.floor(p.length * (1 - Math.pow(1 - q, 3))));
        ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]); for (let j = 1; j < m; j++) ctx.lineTo(p[j][0], p[j][1]); ctx.stroke();
      }
      ctx.globalAlpha = 1; ctx.strokeStyle = t.peach; ctx.fillStyle = t.peach; ctx.lineWidth = phone ? 2 : 2.6;
      if (k >= 0.45) fld.trajectories.forEach(tr => {
        const m = Math.max(2, Math.floor(tr.length * Math.min(1, (k - 0.45) / 0.55)));
        ctx.beginPath(); ctx.moveTo(tr[0][0], tr[0][1]); for (let j = 1; j < m; j++) ctx.lineTo(tr[j][0], tr[j][1]); ctx.stroke();
        ctx.beginPath(); ctx.arc(tr[0][0], tr[0][1], phone ? 4 : 5, 0, 7); ctx.fill();
      });
      ctx.fillStyle = t.coral; ctx.beginPath(); ctx.arc(fld.eq[0], fld.eq[1], 8, 0, 7); ctx.fill();
    };
    paintAt(reduce || done ? 1 : 0);
  }
  const tick = (now: number) => { if (!t0) t0 = now; const k = Math.min(1, (now - t0) / 2600); paintAt(k); if (k < 1) raf = requestAnimationFrame(tick); else done = true; };
  let lastW = 0, rt = 0;
  new ResizeObserver(() => { const w = Math.round(cv.getBoundingClientRect().width); if (w === lastW) return; lastW = w; clearTimeout(rt); rt = window.setTimeout(build, 120); }).observe(cv);
  build();
  whileVisible(root, () => { if (!reduce && !done && !raf) raf = requestAnimationFrame(tick); }, () => { cancelAnimationFrame(raf); raf = 0; t0 = 0; });
});
