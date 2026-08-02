import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { ArticleSummary } from "@/types/blog";

export function ArticleCard({ article }: { article: ArticleSummary }) {
  return (
    <Link
      href={`/blog/${article.slug}`}
      className="group flex flex-col rounded-xl border border-border/60 p-5 transition-colors hover:border-primary/50"
    >
      <div className="flex flex-wrap gap-1.5">
        {article.tags.slice(0, 2).map((tag) => (
          <Badge key={tag} variant="secondary" className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>
      <h3 className="mt-3 font-semibold leading-snug group-hover:text-primary">
        {article.title}
      </h3>
      <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{article.metaDescription}</p>
      <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
        <time dateTime={article.date}>
          {new Date(article.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
        <span aria-hidden>&middot;</span>
        <span>{article.readingTimeMinutes} min read</span>
      </div>
    </Link>
  );
}
