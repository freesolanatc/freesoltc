import { getAllArticles } from "@/lib/mdx/getAllArticles";
import type { Article } from "@/types/blog";

export function getArticleBySlug(slug: string): Article | null {
  return getAllArticles().find((article) => article.slug === slug) ?? null;
}
