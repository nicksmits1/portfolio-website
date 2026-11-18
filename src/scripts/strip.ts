import { landscape } from './landscape';
import { mountAll } from './dom';
import type { ProjectRef } from './maps';

/* Project page arrival: the home landscape close in on this project's minimum, the neighbours as previous and
   next. The solver arrives once on load; a click that ends in a neighbour's basin links to it. */
mountAll('[data-land="strip"]', root => {
  const cur: ProjectRef = JSON.parse(root.dataset.current!), prev: ProjectRef = JSON.parse(root.dataset.prev!), next: ProjectRef = JSON.parse(root.dataset.next!);
  const read = root.closest('.strip')!.querySelector<HTMLElement>('[data-read]');
  landscape(root, {
    offset: -0.4, cue: true, read,
    points(W, H) {
      const ph = W < 600, R = W / H;
      const sp = ph ? { cur: [.76, .34], prev: [.16, .33], next: [.44, .17], who: [.4, .9] } : { cur: [.64, .44], prev: [.36, .2], next: [.9, .62], who: [.22, .86] };
      return [
        { id: cur.id, label: cur.short, current: true, x: sp.cur[0] * R, y: sp.cur[1], d: .92, s: ph ? .16 : .19 },
        { id: prev.id, label: prev.short, href: prev.href, tag: 'previous', x: sp.prev[0] * R, y: sp.prev[1], d: .62, s: ph ? .1 : .12 },
        { id: next.id, label: next.short, href: next.href, tag: 'next', x: sp.next[0] * R, y: sp.next[1], d: .62, s: ph ? .1 : .12 },
        { id: 'who', hidden: true, x: sp.who[0] * R, y: sp.who[1], d: .7, s: ph ? .3 : .34 },
      ];
    },
    start: W => (W < 600 ? [[.62, .1], [.95, .5], [.6, .4]] : [[.5, .1], [.8, .14], [.5, .6], [.78, .3]]),
    done(hit, n) {
      if (!hit || hit.hidden) return `Stopped after <b>${n}</b> iterations under the title. Try another start.`;
      if (hit.current) return `Converged in <b>${n}</b> iterations on <b>${hit.label}</b>.`;
      return `Converged in <b>${n}</b> iterations on <a href="${hit.href}">${hit.label}</a>.`;
    },
  });
});
