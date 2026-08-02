import { cn } from "@/lib/utils";
import type { HeadingEntry } from "@/lib/mdx/extractHeadings";

export function TableOfContents({ headings }: { headings: HeadingEntry[] }) {
  if (headings.length === 0) return null;

  return (
    <nav aria-label="Table of contents" className="rounded-xl border border-border/60 p-4">
      <p className="mb-2 text-sm font-semibold">On this page</p>
      <ul className="space-y-1.5 text-sm">
        {headings.map((heading) => (
          <li key={heading.id} className={cn(heading.depth === 3 && "ml-3")}>
            <a href={`#${heading.id}`} className="text-muted-foreground hover:text-foreground">
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
