import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { getAllArticleSummaries, getAllTags } from "@/lib/mdx/getAllArticles";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = buildMetadata({
  title: "Blog — Free Solana Token Creator",
  description:
    "Guides, tutorials, and best practices for creating Solana SPL tokens, managing mint and freeze authority, and launching safely on Solana.",
  path: "/blog",
});

export default function BlogIndexPage() {
  const articles = getAllArticleSummaries();
  const tags = getAllTags();

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ name: "Blog", path: "/blog" }]} />

      <div className="py-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Solana Token Guides &amp; Tutorials
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Everything you need to know about creating, securing, and launching SPL tokens on
          Solana.
        </p>
      </div>

      {tags.length > 0 && (
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {tags.map((tag) => (
            <Link key={tag} href={`/blog/tag/${encodeURIComponent(tag)}`}>
              <Badge variant="secondary" className="cursor-pointer">
                {tag}
              </Badge>
            </Link>
          ))}
        </div>
      )}

      {articles.length === 0 ? (
        <p className="text-center text-muted-foreground">
          Articles are coming soon &mdash; check back shortly.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
