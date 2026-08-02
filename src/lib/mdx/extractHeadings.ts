import GithubSlugger from "github-slugger";

export interface HeadingEntry {
  id: string;
  text: string;
  depth: 2 | 3;
}

/** Extracts h2/h3 headings from raw MDX source, slugged identically to rehype-slug's algorithm. */
export function extractHeadings(source: string): HeadingEntry[] {
  const slugger = new GithubSlugger();
  const headings: HeadingEntry[] = [];
  const lines = source.split("\n");

  for (const line of lines) {
    const match = /^(##|###)\s+(.+)$/.exec(line.trim());
    if (!match) continue;
    const depth = match[1].length === 2 ? 2 : 3;
    const text = match[2].trim();
    headings.push({ id: slugger.slug(text), text, depth });
  }

  return headings;
}
