// @ts-check
import { defineConfig } from 'astro/config';

// Static output for Cloudflare Pages. Content lives in /content (projects, data, assets); see AGENTS.md.
export default defineConfig({
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file' },
  vite: { server: { fs: { allow: ['.'] } } },
});
