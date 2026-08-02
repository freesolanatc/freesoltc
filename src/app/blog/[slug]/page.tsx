import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo/metadata";
import { ArticleLayout } from "@/components/blog/ArticleLayout";
import { getAllArticleSummaries } from "@/lib/mdx/getAllArticles";
import { getArticleBySlug } from "@/lib/mdx/getArticleBySlug";

export function generateStaticParams() {
  return getAllArticleSummaries().map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};

  return buildMetadata({
    title: article.title,
    description: article.metaDescription,
    path: `/blog/${article.slug}`,
    type: "article",
    image: article.coverImage,
  });
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  return <ArticleLayout article={article} />;
}

