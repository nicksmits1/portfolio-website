import { theme, mountAll, reduce, whileVisible } from './dom';

/* HydrateTech: a 5¹² cage of 20 waters around a methane guest, cut by minimum image (cubic cell, 11.70 Å) from the
   relaxed structure I methane hydrate in the project's reference files, reference_files/si_ch4/methane_relaxed.xyz
   (github.com/nicksmits1/CHEE-494-hydrate-cage-research-project). Coordinates in Å, centred on the carbon.
   A: atoms; OH: covalent O–H bonds; HB: hydrogen bonds, H on one water to O on the next (H···O < 2.2 Å).
   The 30 hydrogen bonds are the dodecahedron's 30 edges; each water's other hydrogen points out of the cage. */
const A: [string, number, number, number][] = [["C",0.0,0.0,0.0],["H",1.09,0.0,-0.05],["H",-0.32,0.04,1.05],["H",-0.38,-0.93,-0.47],["H",-0.39,0.87,-0.53],["O",-0.02,1.37,-3.62],["H",-0.04,1.9,-4.47],["H",-0.82,1.65,-3.1],["O",-0.04,-1.39,-3.63],["H",-0.06,-0.4,-3.71],["H",-0.85,-1.65,-3.1],["O",-0.04,1.36,3.58],["H",-0.02,0.37,3.67],["H",0.77,1.62,3.04],["O",-0.06,-1.4,3.57],["H",-0.03,-1.94,4.41],["H",0.74,-1.68,3.04],["O",-3.62,0.01,-1.39],["H",-4.46,0.01,-1.92],["H",-3.11,-0.82,-1.67],["O",-3.64,-0.03,1.35],["H",-3.72,0.0,0.36],["H",-3.1,0.8,1.6],["O",-2.17,2.15,-2.18],["H",-1.9,2.68,-1.37],["H",-2.7,1.36,-1.86],["O",-2.18,-2.17,-2.18],["H",-1.89,-2.72,-1.39],["H",-2.76,-2.76,-2.75],["O",-2.18,2.14,2.11],["H",-1.4,1.84,2.66],["H",-2.75,2.7,2.71],["O",-2.2,-2.19,2.13],["H",-2.71,-1.38,1.83],["H",-1.42,-1.87,2.67],["O",3.58,-0.0,-1.41],["H",3.65,-0.04,-0.41],["H",3.04,-0.83,-1.66],["O",3.55,-0.04,1.32],["H",4.4,-0.04,1.86],["H",3.05,0.8,1.61],["O",2.13,2.16,-2.18],["H",2.63,1.35,-1.89],["H",1.34,1.84,-2.72],["O",2.11,-2.15,-2.16],["H",1.32,-1.86,-2.7],["H",2.67,-2.73,-2.77],["O",2.1,2.13,2.12],["H",1.8,2.67,1.33],["H",2.67,2.73,2.68],["O",2.08,-2.17,2.12],["H",2.62,-1.38,1.8],["H",1.81,-2.68,1.3],["O",-1.4,3.6,-0.03],["H",-1.94,4.44,-0.02],["H",-1.68,3.09,0.79],["O",1.33,3.6,-0.03],["H",0.34,3.68,-0.04],["H",1.58,3.06,-0.83],["O",-1.42,-3.63,-0.02],["H",-0.42,-3.71,-0.02],["H",-1.66,-3.08,0.78],["O",1.31,-3.62,-0.03],["H",1.85,-4.46,-0.03],["H",1.6,-3.11,-0.84]];
const OH: [number, number][] = [[5,6],[5,7],[8,9],[8,10],[11,12],[11,13],[14,15],[14,16],[17,18],[17,19],[20,21],[20,22],[23,24],[23,25],[26,27],[26,28],[29,30],[29,31],[32,33],[32,34],[35,36],[35,37],[38,39],[38,40],[41,42],[41,43],[44,45],[44,46],[47,48],[47,49],[50,51],[50,52],[53,54],[53,55],[56,57],[56,58],[59,60],[59,61],[62,63],[62,64]];
const HB: [number, number][] = [[7,23],[9,5],[10,26],[12,14],[13,47],[16,50],[19,26],[21,17],[22,29],[24,53],[25,17],[27,59],[30,11],[33,20],[34,14],[36,38],[37,44],[40,47],[42,35],[43,5],[45,8],[48,56],[51,38],[52,62],[55,29],[57,53],[58,41],[60,62],[61,32],[64,44]];
const CH: [number, number][] = [[0, 1], [0, 2], [0, 3], [0, 4]];
const R: Record<string, number> = { O: 0.36, H: 0.2, C: 0.38 };

const rgb = (hex: string) => { const n = parseInt(hex.replace('#', ''), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
const mix = (a: number[], b: number[], k: number) => `rgb(${a.map((v, i) => Math.round(b[i] + (v - b[i]) * k)).join(',')})`;

mountAll('[data-fig="cage"]', root => {
  const cv = root.querySelector('canvas')!, c = cv.getContext('2d')!, t = theme();
  const bg = rgb(t.bg), col = { O: rgb(t.fg), H: rgb(t.fg2), C: rgb(t.peach), G: rgb(t.peach), B: rgb(t.fg2) };
  let W = 0, H = 0, dpr = 1, yaw = 0.55, pitch = 0.42;

  function draw() {
    c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);
    const s = Math.min(W / 10.4, H / 9.4), cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    const P = A.map(([e, x, y, z]) => {
      const x1 = x * cy + z * sy, z1 = -x * sy + z * cy, y2 = y * cp - z1 * sp, z2 = y * sp + z1 * cp, f = 24 / (24 - z2);
      return { e, x: W / 2 + x1 * s * f, y: H / 2 - y2 * s * f, z: z2, f };
    });
    /* depth cue: far atoms and bonds sink towards the ground colour; nearest drawn last */
    const k = (z: number) => 0.28 + 0.72 * Math.max(0, Math.min(1, (z + 4.6) / 9.2));
    type Item = { z: number; draw: () => void };
    const items: Item[] = [];
    const bond = (i: number, j: number, kind: 'cov' | 'hb' | 'gas') => items.push({ z: (P[i].z + P[j].z) / 2 - 0.01, draw: () => {
      const a = P[i], b = P[j], d = k((a.z + b.z) / 2);
      c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y);
      c.lineCap = 'round';
      if (kind === 'hb') { c.setLineDash([4, 3]); c.lineWidth = 1.9; c.strokeStyle = mix(col.B, bg, 0.35 + 0.65 * d); }
      else { c.setLineDash([]); c.lineWidth = (kind === 'gas' ? 3 : 2.6) * a.f; c.strokeStyle = mix(kind === 'gas' ? col.G : col.H, bg, d); }
      c.stroke(); c.setLineDash([]);
    } });
    OH.forEach(([i, j]) => bond(i, j, 'cov')); HB.forEach(([i, j]) => bond(i, j, 'hb')); CH.forEach(([i, j]) => bond(i, j, 'gas'));
    P.forEach((p, i) => items.push({ z: p.z, draw: () => {
      const guest = i < 5, base = guest ? (p.e === 'C' ? col.C : col.G) : (col as any)[p.e], d = k(p.z);
      c.beginPath(); c.arc(p.x, p.y, R[p.e] * s * p.f * (guest && p.e === 'H' ? 0.9 : 1), 0, 7);
      c.fillStyle = mix(base, bg, d); c.fill();
      c.lineWidth = 1; c.strokeStyle = mix(bg, base, 0.15); c.stroke();
    } }));
    items.sort((a, b) => a.z - b.z).forEach(it => it.draw());
  }
  function size() {
    const r = cv.getBoundingClientRect(); dpr = Math.min(2, devicePixelRatio || 1); W = r.width; H = r.height;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); draw();
  }
  new ResizeObserver(size).observe(cv);

  /* turns slowly while in view; dragging turns it by hand; reduced motion holds the still unless dragged */
  let raf = 0, last = 0, held = false;
  const spin = (now: number) => { if (last && !held) { yaw += (now - last) / 1000 * 0.28; draw(); } last = now; raf = requestAnimationFrame(spin); };
  if (!reduce) whileVisible(root, () => { if (!raf) { last = 0; raf = requestAnimationFrame(spin); } }, () => { cancelAnimationFrame(raf); raf = 0; });
  let px = 0, py = 0;
  cv.addEventListener('pointerdown', e => { held = true; px = e.clientX; py = e.clientY; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', e => {
    if (!held) return;
    yaw += (e.clientX - px) * 0.01; pitch = Math.max(-1.2, Math.min(1.2, pitch + (e.clientY - py) * 0.01)); px = e.clientX; py = e.clientY; draw();
  });
  const up = () => { held = false; last = 0; };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
});
