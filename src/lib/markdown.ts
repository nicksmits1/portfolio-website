import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import temml from 'temml';

/* Markdown for project sections, with TeX rendered at build time to MathML by Temml. The page sets MathML in
   self-hosted STIX Two Math, so no maths script ships to the browser. */
type Node = { type: string; value?: string; children?: Node[]; data?: unknown };

function mathToHtml(tree: Node) {
  const walk = (n: Node) => {
    if (n.type === 'math' || n.type === 'inlineMath') {
      const display = n.type === 'math';
      n.value = temml.renderToString(n.value ?? '', { displayMode: display, throwOnError: true });
      n.type = 'html';
      delete n.children;
      delete n.data; // remark-math's hName would turn it back into <code>
      return;
    }
    n.children?.forEach(walk);
  };
  return () => walk(tree);
}

const processor = unified()
  .use(remarkParse)
  .use(remarkMath)
  .use(() => (tree: Node) => mathToHtml(tree)())
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeStringify, { allowDangerousHtml: true });

/** A line that is only $$...$$ becomes a display block. */
const fenceDisplay = (md: string) => md.replace(/^\$\$(.+)\$\$\s*$/gm, (_m, tex) => `$$\n${tex}\n$$`);

export function renderMarkdown(md: string): string {
  /* MathML elements ignore overflow in Chrome, so each display equation scrolls inside its own box. */
  return String(processor.processSync(fenceDisplay(md.trim())))
    .replace(/<p>\s*(<math display="block"[\s\S]*?<\/math>)\s*<\/p>/g, '<div class="eqn">$1</div>')
    .replace(/(?<!<div class="eqn">)(<math display="block"[\s\S]*?<\/math>)/g, '<div class="eqn">$1</div>');
}

export function renderInline(md: string): string {
  return renderMarkdown(md).replace(/^<p>|<\/p>\s*$/g, '');
}
