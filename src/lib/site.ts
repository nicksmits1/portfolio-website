import { getCollection, type CollectionEntry } from 'astro:content';
import { readFileSync } from 'node:fs';
import { load } from 'js-yaml';

export type Project = CollectionEntry<'projects'>;

/* Home list order, and the order of previous / next on project pages. A new project gets a place here and a
   minimum in each landscape map (src/scripts/maps.ts). */
export const ORDER = ['thesis', 'sindae', 'recsys', 'mmrag', 'wayfinder', 'fifa', 'sepsis', 'electricity'];

export async function projects(): Promise<Project[]> {
  const all = await getCollection('projects');
  const missing = all.filter(p => !ORDER.includes(p.id)).map(p => p.id);
  if (missing.length) throw new Error(`Add ${missing.join(', ')} to ORDER in src/lib/site.ts`);
  return ORDER.map(id => all.find(p => p.id === id)).filter((p): p is Project => !!p);
}

export function neighbours(list: Project[], id: string) {
  const i = list.findIndex(p => p.id === id), n = list.length;
  return { prev: list[(i + n - 1) % n], next: list[(i + 1) % n] };
}

export const whereLine = (p: Project) =>
  [p.data.where, p.data.with ? `with ${p.data.with.replace(/, ([^,]+)$/, ' and $1')}` : '', p.data.when].filter(Boolean) as string[];

/** The body: the one-line summary before the first heading, and each ### section under ## Sections. */
export function body(p: Project) {
  const src = p.body ?? '';
  const line = src.split(/\n## /)[0].trim();
  const block = src.match(/\n## Sections\n([\s\S]*?)(?=\n## |$)/)?.[1] ?? '';
  const sections = new Map<string, string>();
  for (const part of ('\n' + block).split(/\n### /).slice(1)) {
    const nl = part.indexOf('\n');
    sections.set(part.slice(0, nl).trim(), part.slice(nl + 1).trim());
  }
  return { line, sections };
}

/** The first four-digit year in a years string ("2022–23" -> 2022). */
export const firstYear = (y: string) => parseInt(y.match(/\d{4}/)?.[0] ?? '0', 10);
/** Content collections come back ordered by id; data lists sort newest first by their first year. */
export const timelineNewest = async () => (await getCollection('timeline')).sort((a, b) => firstYear(b.data.years) - firstYear(a.data.years));
export const publicationsNewest = async () => (await getCollection('publications')).sort((a, b) => firstYear(b.data.year) - firstYear(a.data.year));

export const skillsOf = (p: Project) => [...p.data.methods, ...p.data.tools];

type Profile = { name: string; focus: string; email: string; linkedin: string; github: string; orcid: string | null };
export const profile = load(readFileSync('content/data/profile.yaml', 'utf8')) as Profile;

/* Research topics in the order content/data/topics.yaml lists them (the file loader would sort them by id). */
type TopicRow = { id: string; name: string; short?: string; wide: [number, number]; tall: [number, number] };
export const TOPICS = load(readFileSync('content/data/topics.yaml', 'utf8')) as TopicRow[];
for (const t of TOPICS) if (!t.id || !t.name || t.wide?.length !== 2 || t.tall?.length !== 2) throw new Error(`content/data/topics.yaml: ${t.id ?? 'an entry'} needs id, name, wide [x, y] and tall [x, y]`);
