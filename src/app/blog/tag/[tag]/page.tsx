import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo/metadata";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { getAllTags, getArticlesByTag } from "@/lib/mdx/getAllArticles";

export function generateStaticParams() {
  return getAllTags().map((tag) => ({ tag }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  return buildMetadata({
    title: `${tag} Articles — Free Solana Token Creator Blog`,
    description: `Guides and tutorials tagged "${tag}" from the Free Solana Token Creator blog.`,
    path: `/blog/tag/${tag}`,
  });
}

export default async function BlogTagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  const articles = getArticlesByTag(tag);
  if (articles.length === 0) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ name: "Blog", path: "/blog" }, { name: tag, path: `/blog/tag/${tag}` }]} />

      <div className="py-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Articles tagged &ldquo;{tag}&rdquo;
        </h1>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>
    </div>
  );
}
