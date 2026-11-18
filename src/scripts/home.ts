import { landscape, type Pt } from './landscape';
import { MAPS, type ProjectRef } from './maps';
import { mountAll } from './dom';

const said = (n: number) => `Converged in <b>${n}</b> iterations`;

/* Hero: seven project minima, plus a broad basin under the name that converges on Contact. */
mountAll('[data-land="hero"]', root => {
  const list: ProjectRef[] = JSON.parse(root.dataset.projects!), hero = root.closest('.hero') as HTMLElement, who = hero.querySelector('.who') as HTMLElement;
  const read = hero.querySelector<HTMLElement>('[data-read]');
  let tapped = false;
  root.addEventListener('click', () => (tapped = true));
  const L = landscape(root, {
    drift: true, cue: true, read,
    points(W, H) {
      const phone = W < 700, map = phone ? MAPS.tall : MAPS.wide, s = phone ? 0.085 : 0.125;
      const hr = hero.getBoundingClientRect(), r = who.getBoundingClientRect();
      const pts: Omit<Pt, 'c'>[] = list.map(p => ({ id: p.id, label: p.short, href: `/projects/${p.id}`, x: map[p.id][0] * W / H, y: map[p.id][1], d: 0.82, s }));
      pts.push({ id: 'contact', hidden: true, x: (r.left - hr.left + Math.min(r.width, W * 0.9) * 0.42) / H, y: (r.top - hr.top + r.height * 0.5) / H, d: 0.86, s: phone ? 0.2 : 0.27 });
      return pts;
    },
    start: W => (W < 700 ? [[0.5, 0.22]] : [[0.47, 0.52]]),
    done(hit, n) {
      const tail = L?.touch && !tapped ? ' Tap the map to start another descent.' : '';
      if (!hit) return `Stopped after <b>${n}</b> iterations on a saddle. Try another start.`;
      if (hit.id === 'contact') return `${said(n)}, right on <a href="#contact">Contact</a>.${tail}`;
      return `${said(n)} on <a href="${hit.href}">${hit.label}</a>.${tail}`;
    },
  });
});

/* Skills: the same function laid out on a grid; picking a skill flattens the projects that don't use it. */
mountAll('[data-land="skills"]', root => {
  const list: ProjectRef[] = JSON.parse(root.dataset.projects!), box = root.closest('.skills') as HTMLElement, read = box.querySelector<HTMLElement>('[data-read]')!;
  const idle = read.innerHTML;
  const L = landscape(root, {
    read,
    points(W, H) {
      const phone = W < 500, map = phone ? MAPS.tallgrid : MAPS.side, s = phone ? 0.09 : 0.13;
      return list.map(p => ({ id: p.id, label: p.short, href: `/projects/${p.id}`, x: map[p.id][0] * W / H, y: map[p.id][1], d: 0.82, s }));
    },
    done(hit, n) { return hit ? `${said(n)} on <a href="${hit.href}">${hit.label}</a>.` : `Stopped after <b>${n}</b> iterations on a saddle.`; },
  });
  let cur: string | null = null;
  box.querySelectorAll<HTMLButtonElement>('button[data-skill]').forEach(b => b.addEventListener('click', () => {
    cur = cur === b.dataset.skill ? null : b.dataset.skill!;
    box.querySelectorAll<HTMLButtonElement>('button[data-skill]').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.skill === cur)));
    const uses = cur ? box.querySelector<HTMLButtonElement>(`button[data-skill="${CSS.escape(cur)}"]`)!.dataset.uses!.split(',') : [];
    L.setWeights(cur ? Object.fromEntries(list.map(p => [p.id, uses.includes(p.id) ? 1 : 0.1])) : null);
    read.innerHTML = cur ? `<b>${cur}</b>: ${list.filter(p => uses.includes(p.id)).map(p => `<a href="/projects/${p.id}">${p.short}</a>`).join(', ')}.` : idle;
  }));
  /* a skill chip on a project page links here with ?skill=…; pick it on arrival */
  const want = new URLSearchParams(location.search).get('skill');
  if (want) box.querySelector<HTMLButtonElement>(`button[data-skill="${CSS.escape(want)}"]`)?.click();
});
