/* Shared helpers for the figure islands. */
export const SVGNS = 'http://www.w3.org/2000/svg';
export const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export function el<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>, parent?: Element): SVGElementTagNameMap[K] {
  const n = document.createElementNS(SVGNS, tag);
  for (const k in attrs) n.setAttribute(k, String(attrs[k]));
  if (parent) parent.appendChild(n);
  return n;
}

const css = (n: string) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
export function theme() {
  return { fg: css('--fg'), fg2: css('--fg2'), dim: css('--dim'), coral: css('--coral'), peach: css('--peach'), bg: css('--bg'), panel: css('--panel'), ink: css('--ink'), font: css('--text') };
}

/** Runs on() when at least 35% of the element is visible and off() when it leaves, per the motion grammar. */
export function whileVisible(target: Element, on: () => void, off: () => void, threshold = 0.35) {
  new IntersectionObserver(es => es.forEach(e => (e.isIntersecting ? on() : off())), { threshold }).observe(target);
}

/** Calls fn once for every element matching selector that has not been mounted yet. */
export function mountAll(selector: string, fn: (root: HTMLElement) => void) {
  document.querySelectorAll<HTMLElement>(selector).forEach(root => {
    if (root.dataset.mounted) return;
    root.dataset.mounted = '1';
    fn(root);
  });
}

export const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

/** Returns wait(ms): sleeps, then holds until at least 35% of target is on screen, so a timeline pauses off screen. */
export function gate(target: Element, threshold = 0.35) {
  let vis = false, waiters: (() => void)[] = [];
  new IntersectionObserver(es => { vis = es[0].isIntersecting; if (vis) { waiters.forEach(f => f()); waiters = []; } }, { threshold }).observe(target);
  const ready = () => (vis ? Promise.resolve() : new Promise<void>(r => waiters.push(r)));
  return async (ms: number) => { await sleep(ms); await ready(); };
}

/** Eased tween over ms; fn receives the eased progress 0..1. */
export function tween(ms: number, fn: (e: number) => void) {
  return new Promise<void>(res => {
    const t0 = performance.now();
    const f = (now: number) => { const k = Math.max(0, Math.min(1, (now - t0) / ms)); fn(1 - Math.pow(1 - k, 3)); if (k < 1) requestAnimationFrame(f); else res(); };
    requestAnimationFrame(f);
  });
}

export type P2 = [number, number];
/** An orthogonal polyline with rounded corners. */
export function rpath(p: P2[], r = 8) {
  let d = `M${p[0][0]} ${p[0][1]}`;
  for (let i = 1; i < p.length - 1; i++) {
    const [x0, y0] = p[i - 1], [x1, y1] = p[i], [x2, y2] = p[i + 1];
    const d1 = Math.hypot(x1 - x0, y1 - y0), d2 = Math.hypot(x2 - x1, y2 - y1), rr = Math.min(r, d1 / 2, d2 / 2);
    d += ` L${x1 - ((x1 - x0) / d1) * rr} ${y1 - ((y1 - y0) / d1) * rr} Q${x1} ${y1} ${x1 + ((x2 - x1) / d2) * rr} ${y1 + ((y2 - y1) / d2) * rr}`;
  }
  const l = p[p.length - 1];
  return d + ` L${l[0]} ${l[1]}`;
}
/** The same polyline with its last segment shortened, so an arrowhead stops short of a port. */
export function trimEnd(p: P2[], by: number): P2[] {
  const q = p.map(a => [a[0], a[1]] as P2), n = q.length, [x0, y0] = q[n - 2], [x1, y1] = q[n - 1], d = Math.hypot(x1 - x0, y1 - y0);
  q[n - 1] = [x1 - ((x1 - x0) / d) * by, y1 - ((y1 - y0) / d) * by];
  return q;
}
/** Arrowhead markers: `${id}-n` in the edge colour, `${id}-a` in the active colour. */
export function markers(svg: SVGSVGElement, id: string, edge: string, active: string) {
  const defs = el('defs', {}, svg);
  ([['n', edge], ['a', active]] as const).forEach(([k, col]) => {
    const m = el('marker', { id: `${id}-${k}`, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, defs);
    el('path', { d: 'M0 1 L10 5 L0 9 z', fill: col }, m);
  });
}
