import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

/* One file per project in content/projects. Frontmatter holds the page structure (rail, figures, order, reading);
   the body holds the line, ## Facts (evidence notes), ## Sections (the prose) and ## Visual (notes for agents). */
const link = z.object({ label: z.string(), href: z.string(), icon: z.enum(['gh', 'paper', 'file']), lead: z.boolean().optional() });
const figure = z.object({
  kind: z.enum(['net', 'policy', 'amort', 'dqn', 'system', 'flow', 'ladder', 'scale', 'trade', 'forecast', 'img', 'grid', 'video']),
  src: z.string().optional(), poster: z.string().optional(), alt: z.string().optional(),
  caption: z.string().optional(), source: z.string().optional(), fine: z.string().optional(),
  plate: z.enum(['white', 'dash', 'shot']).optional(), narrow: z.boolean().optional(), data: z.string().optional(),
  items: z.array(z.object({ src: z.string(), alt: z.string() })).optional(),
  legend: z.array(z.tuple([z.string(), z.string()])).optional(),
  ext: z.array(z.object({ id: z.string(), name: z.string(), on: z.enum(['env', 'buf', 'loss', 'tgt', 'onl']), tex: z.string() })).optional(),
});
const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './content/projects', generateId: ({ data }) => String(data.id) }),
  schema: z.object({
    id: z.string(), name: z.string(), short: z.string(), where: z.string(), with: z.string().optional(),
    when: z.string(), year: z.number(), topics: z.array(z.string()).min(1), methods: z.array(z.string()), tools: z.array(z.string()),
    disclosure: z.string(),
    links: z.array(link).default([]),
    note: z.string().optional(),
    badge: z.object({ logo: z.string(), alt: z.string(), title: z.string(), text: z.string() }).optional(),
    banner: z.object({ src: z.string(), alt: z.string() }).optional(),
    badges: z.record(z.string(), z.object({ mark: z.string(), label: z.string(), href: z.string() })).optional(),
    rail: z.array(z.tuple([z.string(), z.string()])),
    figures: z.record(z.string(), figure),
    order: z.array(z.string()),
    reading: z.array(z.object({ title: z.string(), what: z.string(), href: z.string(), preview: z.string().optional(), logo: z.string().optional(), wide: z.boolean().optional() })).optional(),
  }).loose(),
});

const latest = defineCollection({
  loader: file('content/data/latest.yaml'),
  schema: z.object({ date: z.coerce.date(), label: z.string(), kind: z.string(), title: z.string(), detail: z.string(), href: z.string().optional() }),
});
const publications = defineCollection({
  loader: file('content/data/publications.yaml'),
  schema: z.object({
    year: z.string(), title: z.string(), authors: z.array(z.string()).min(1), venue: z.string(), kind: z.string(),
    status: z.string().optional(), href: z.string().optional(),
    document: z.object({ owner: z.string(), pdf: z.string(), preview: z.string() }).optional(),
    links: z.array(z.object({ label: z.string(), href: z.string(), owner: z.string().optional(), icon: z.enum(['gh', 'paper', 'file', 'next']) })).default([]),
  }),
});
const timeline = defineCollection({
  loader: file('content/data/timeline.yaml'),
  schema: z.object({ group: z.enum(['Experience', 'Teaching', 'Education']), years: z.string(), title: z.string(), detail: z.string(), short: z.string().optional(), topics: z.array(z.string()).default([]) }),
});
const roles = defineCollection({
  loader: file('content/data/roles.yaml'),
  schema: z.object({
    org: z.string(), role: z.string(), when: z.string(), where: z.string(),
    logo: z.object({ owner: z.string(), file: z.string(), alt: z.string() }),
    line: z.string(), figure: z.enum(['flow', 'cage', 'kinetics']), points: z.array(z.string()),
    facts: z.array(z.tuple([z.string(), z.string()])).max(4), tools: z.array(z.string()).default([]),
    badge: z.object({ owner: z.string(), logo: z.string(), alt: z.string(), title: z.string(), text: z.string() }).optional(),
    links: z.array(z.object({ label: z.string(), href: z.string(), icon: z.enum(['gh', 'paper', 'file', 'next']) })).default([]),
  }),
});
const skills = defineCollection({
  loader: file('content/data/skills.yaml'),
  schema: z.object({ name: z.string(), skills: z.array(z.string()) }),
});

export const collections = { projects, latest, publications, timeline, roles, skills };
