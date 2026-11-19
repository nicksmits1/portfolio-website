import { landscape, type Surface } from './landscape';
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

/* Hero: one minimum per research topic on a calm basin: the name block sits on a flat ink floor, and a descent that
   ends there lands on Contact. The formula tab top left rotates the surface through four functions; the three test
   functions have four minimum slots, assigned to the topics in order, so they appear only while there are four topics. */
type Key = 'bowls' | 'himmelblau' | 'rosenbrock' | 'ripple';
const WORD = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
const FX: { key: Key; name: (n: number) => string; eq: string }[] = [
  { key: 'bowls', name: n => `${WORD[n] ?? n} bowls`, eq: 'f(x) = w(x) − Σ<sub>i</sub> 0.82 exp(−‖x − c<sub>i</sub>‖² / 2σ²)' },
  { key: 'himmelblau', name: () => 'Himmelblau', eq: 'f(x, y) = (x² + y − 11)² + (x + y² − 7)²' },
  { key: 'rosenbrock', name: () => 'Rosenbrock', eq: 'f(x, y) = (1 − x)² + 100 (y − x²)²' },
  { key: 'ripple', name: () => 'Ripple field', eq: 'Rastrigin ripples, 2 − cos 2πx/λ − cos 2πy/λ, over four basins' },
];
function surface(key: Key, W: number, H: number, topics: Topic[]): Surface {
  const R = W / H, phone = W < 700, tall = phone || R < 1.25, fit = (a: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, a));
  const base = (t: Topic) => ({ id: t.id, label: t.name, tag: count(t.n), href: `#${t.id}`, current: t.id === shown });
  if (key === 'himmelblau') {
    /* Himmelblau's four minima, mirrored left to right so the one nearest the name holds the shortest label */
    const [xf, y0, k] = tall ? [.5, .22, .042 * fit(R / .53, .8, 1.3)] : [.702, .4, .095 * Math.min(1, R / 1.71)], x0 = xf * R;
    const slot = [[3, 2], [-2.805118, 3.131312], [3.584428, -1.848126], [-3.77931, -3.283186]];
    return { kind: key, p: [x0, y0, k], points: topics.map((t, i) => ({ ...base(t), x: x0 - k * slot[i][0], y: y0 - k * slot[i][1], d: 0, s: .1 })) };
  }
  if (key === 'rosenbrock') {
    /* Rosenbrock's valley on a log scale; the topics are shallow pools along its floor */
    const [xf, y0, ku, kw] = tall ? [.5, .36, .11 * fit(R / .53, .8, 1.3), .085] : [.655, .66, .27 * Math.min(1, R / 1.71), .16], x0 = xf * R;
    const slot = tall ? [-1.75, -.85, .55, 1.45] : [-1.55, -.55, .45, 1.25];
    return { kind: key, p: [x0, y0, ku, kw], points: topics.map((t, i) => ({ ...base(t), x: x0 + ku * slot[i], y: y0 - kw * slot[i] ** 2, d: .2, s: .05 })) };
  }
  if (key === 'ripple') {
    /* a Rastrigin egg crate over a gentle slope; the topics are the deep basins where the ripple dies away */
    const slot = tall ? [[.26, .1], [.74, .14], [.3, .3], [.72, .34]] : [[.2, .2], [.44, .12], [.66, .34], [.86, .6]];
    return { kind: key, p: [tall ? .075 : .105], points: topics.map((t, i) => ({ ...base(t), x: slot[i][0] * R, y: slot[i][1], d: .42, s: tall ? .075 : .1 })) };
  }
  const s = phone ? .085 : .125;
  return { kind: 'bowls', points: topics.map(t => { const [x, y] = phone ? t.tall : t.wide; return { ...base(t), x: x * R, y, d: .82, s }; }) };
}

mountAll('[data-land="hero"]', root => {
  const topics: Topic[] = JSON.parse(root.dataset.topics!), hero = root.closest('.hero') as HTMLElement, who = hero.querySelector('.who') as HTMLElement;
  const read = hero.querySelector<HTMLElement>('[data-read]'), tab = hero.querySelector<HTMLButtonElement>('[data-fx]');
  const fxs = FX.filter(f => f.key === 'bowls' || topics.length === 4);
  let tapped = false, at = 0;
  root.addEventListener('click', () => (tapped = true));
  const L = landscape(root, {
    drift: true, cue: true, read,
    points: (W, H) => surface(fxs[at].key, W, H, topics),
    floor() {
      const hr = root.getBoundingClientRect(), r = who.getBoundingClientRect();
      return { l: r.left - hr.left, t: r.top - hr.top, r: r.right - hr.left, b: r.bottom - hr.top };
    },
    /* the opening descent starts top right and lands on a topic without crossing the name block */
    start: W => (W < 700 ? [[.62, .06], [.9, .1], [.5, .2], [.85, .3], [.2, .2], [.6, .4]] : [[.6, .08], [.74, .1], [.88, .12], [.52, .14], [.8, .36], [.96, .42], [.62, .5], [.3, .08]]),
    done(hit, n, auto) {
      const tail = L?.touch && !tapped ? ' Tap the map to start another descent.' : '';
      if (!hit) return fxs[at].key === 'ripple' ? `Stuck in a local minimum after <b>${n}</b> iterations. Try another start.` : `Stopped after <b>${n}</b> iterations on a saddle. Try another start.`;
      if (hit.id === 'contact') return `${said(n)}, right on <a href="#contact">Contact</a>.${tail}`;
      /* a descent the visitor started also filters the rows; an opening one leaves the list as it is */
      const filter = tapped && !auto;
      if (filter) show(hit.id);
      return `${said(n)} on <a href="${hit.href}">${hit.label}</a>, ${hit.tag}${filter ? ' now listed below' : ''}.${tail}`;
    },
  });
  if (tab && fxs.length > 1) {
    const label = () => {
      const f = fxs[at], name = f.name(topics.length);
      tab.querySelector('[data-fx-eq]')!.innerHTML = f.eq;
      tab.querySelector('[data-fx-name]')!.textContent = name;
      tab.setAttribute('aria-label', `Landscape: ${name}. Show the next function.`);
    };
    label(); tab.hidden = false;
    tab.addEventListener('click', () => {
      at = (at + 1) % fxs.length; label();
      if (read) read.innerHTML = `Switched to <b>${fxs[at].name(topics.length)}</b>.`;
      L.morph();
    });
  }
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
