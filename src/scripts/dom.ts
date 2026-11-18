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
