import { landscape, type Pt } from './landscape';
import { MAPS, type ProjectRef } from './maps';
import { mountAll, reduce } from './dom';

const said = (n: number) => `Converged in <b>${n}</b> iterations`;

type Topic = { id: string; name: string; wide: [number, number]; tall: [number, number]; n: number };
const count = (n: number) => `${n} ${n === 1 ? 'project' : 'projects'}`;

/* Research rows: the topic chips, the hero's topic minima and any link to /#<topic> show one topic's projects. */
const research = document.getElementById('research')!;
const chips = [...research.querySelectorAll<HTMLButtonElement>('[data-topic-chips] button')];
const rows = [...research.querySelectorAll<HTMLElement>('li[data-topics]')];
const topicIds = new Set(chips.map(b => b.dataset.topic).filter(Boolean) as string[]);
let shown: string | null = null;
function show(id: string | null, scroll = false) {
  shown = id && topicIds.has(id) ? id : null;
  chips.forEach(b => b.setAttribute('aria-pressed', String((b.dataset.topic || null) === shown)));
  rows.forEach(r => (r.hidden = !!shown && !r.dataset.topics!.split(' ').includes(shown)));
  document.querySelectorAll<HTMLElement>('.hero .labs .lab').forEach(a => a.classList.toggle('hit', a.getAttribute('href') === `#${shown}`));
  const url = shown ? `#${shown}` : location.pathname + location.search;
  if (location.hash !== (shown ? `#${shown}` : '')) history.replaceState(null, '', url);
  if (scroll) research.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
}
chips.forEach(b => b.addEventListener('click', () => show(b.dataset.topic || null)));
/* a topic label on the map, or a topic link in the readout, filters the rows and brings them into view */
document.addEventListener('click', e => {
  const a = (e.target as Element).closest<HTMLAnchorElement>('a[href^="#"]'), id = a?.getAttribute('href')!.slice(1);
  if (!a || !id || !topicIds.has(id)) return;
  e.preventDefault(); show(id, true);
});
addEventListener('hashchange', () => show(location.hash.slice(1), true));

/* Hero: one minimum per research topic, plus a broad basin under the name that converges on Contact. */
mountAll('[data-land="hero"]', root => {
  const topics: Topic[] = JSON.parse(root.dataset.topics!), hero = root.closest('.hero') as HTMLElement, who = hero.querySelector('.who') as HTMLElement;
  const read = hero.querySelector<HTMLElement>('[data-read]');
  let tapped = false;
  root.addEventListener('click', () => (tapped = true));
  const L = landscape(root, {
    drift: true, cue: true, read,
    points(W, H) {
      const phone = W < 700, s = phone ? 0.085 : 0.125;
      const hr = hero.getBoundingClientRect(), r = who.getBoundingClientRect();
      const pts: Omit<Pt, 'c'>[] = topics.map(t => { const [x, y] = phone ? t.tall : t.wide; return { id: t.id, label: t.name, tag: count(t.n), href: `#${t.id}`, x: x * W / H, y, d: 0.82, s, current: t.id === shown }; });
      pts.push({ id: 'contact', hidden: true, x: (r.left - hr.left + Math.min(r.width, W * 0.9) * 0.42) / H, y: (r.top - hr.top + r.height * 0.5) / H, d: 0.86, s: phone ? 0.2 : 0.27 });
      return pts;
    },
    start: W => (W < 700 ? [[0.5, 0.22]] : [[0.47, 0.52]]),
    done(hit, n) {
      const tail = L?.touch && !tapped ? ' Tap the map to start another descent.' : '';
      if (!hit) return `Stopped after <b>${n}</b> iterations on a saddle. Try another start.`;
      if (hit.id === 'contact') return `${said(n)}, right on <a href="#contact">Contact</a>.${tail}`;
      /* a descent the visitor started also filters the rows; the opening one leaves the list whole */
      if (tapped) show(hit.id);
      return `${said(n)} on <a href="${hit.href}">${hit.label}</a>, ${hit.tag}${tapped ? ' now listed below' : ''}.${tail}`;
    },
  });
});
if (topicIds.has(location.hash.slice(1))) show(location.hash.slice(1), true);

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

/* Latest reel: enough copies of the set that the loop never shows a gap, shifted by one set's width at 28 px/s. */
document.querySelectorAll<HTMLElement>('[data-reel]').forEach(reel => {
  const win = reel.querySelector<HTMLElement>('.win')!, track = reel.querySelector<HTMLElement>('.track')!, first = track.querySelector<HTMLElement>('.set')!;
  const fit = () => {
    const w = first.getBoundingClientRect().width;
    if (!w) return;
    while (track.children.length < 8 && (track.children.length - 1) * w < win.clientWidth) {
      const copy = first.cloneNode(true) as HTMLElement;
      copy.setAttribute('aria-hidden', 'true'); copy.querySelectorAll('a').forEach(a => (a.tabIndex = -1));
      track.appendChild(copy);
    }
    track.style.setProperty('--shift', `${w}px`); track.style.setProperty('--dur', `${(w / 28).toFixed(1)}s`);
  };
  new ResizeObserver(fit).observe(win);
  document.fonts?.ready.then(fit);
});
