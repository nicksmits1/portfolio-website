import type { ImageMetadata } from 'astro';

/* Every shipping asset lives in content/assets/<owner>/ with a README naming its provenance. */
const images = import.meta.glob<ImageMetadata>('/content/assets/**/*.{webp,png}', { eager: true, import: 'default' });
const files = import.meta.glob<string>('/content/assets/**/*.{svg,pdf,mp4}', { eager: true, query: '?url', import: 'default' });
const raws = import.meta.glob<string>('/content/assets/**/*.svg', { eager: true, query: '?raw', import: 'default' });
const cv = import.meta.glob<string>('/content/cv/Nicolas_Smits_CV.pdf', { eager: true, query: '?url', import: 'default' });

const key = (owner: string, name: string) => `/content/assets/${owner}/${name}`;
const missing = (k: string): never => { throw new Error(`Missing asset ${k}`); };

export function image(owner: string, name: string): ImageMetadata {
  const k = key(owner, name);
  return images[k] ?? missing(k);
}
export function url(owner: string, name: string): string {
  const k = key(owner, name);
  return files[k] ?? images[k]?.src ?? missing(k);
}
export function svgRaw(owner: string, name: string): string {
  const k = key(owner, name);
  return raws[k] ?? missing(k);
}
/** A link target: absolute URLs and site paths pass through; a bare file name is a project asset. */
export function href(owner: string, target: string): string {
  return /^(https?:|mailto:|\/)/.test(target) ? target : url(owner, target);
}
export const cvUrl: string = Object.values(cv)[0] ?? missing('content/cv/Nicolas_Smits_CV.pdf');
