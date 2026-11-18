import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

/* One file per project in content/projects. Frontmatter holds the page structure (rail, figures, order, reading);
   the body holds the line, ## Facts (evidence notes), ## Sections (the prose) and ## Visual (notes for agents). */
const link = z.object({ label: z.string(), href: z.string(), icon: z.enum(['gh', 'paper', 'file']), lead: z.boolean().optional() });
const figure = z.object({
  kind: z.enum(['net', 'policy', 'amort', 'dqn', 'system', 'flow', 'ladder', 'scale', 'img', 'grid', 'video']),
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
    when: z.string(), year: z.number(), methods: z.array(z.string()), tools: z.array(z.string()),
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
  schema: z.object({ year: z.string(), title: z.string(), detail: z.string(), status: z.string().optional(), href: z.string().optional() }),
});
const timeline = defineCollection({
  loader: file('content/data/timeline.yaml'),
  schema: z.object({ group: z.enum(['Experience', 'Teaching', 'Education']), years: z.string(), title: z.string(), detail: z.string() }),
});
const skills = defineCollection({
  loader: file('content/data/skills.yaml'),
  schema: z.object({ name: z.string(), skills: z.array(z.string()) }),
});

export const collections = { projects, latest, publications, timeline, skills };
