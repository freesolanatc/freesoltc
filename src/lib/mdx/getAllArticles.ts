import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { articleFrontmatterSchema } from "@/lib/mdx/frontmatterSchema";
import type { Article, ArticleSummary } from "@/types/blog";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

function readArticleFile(filename: string): Article {
  const filePath = path.join(BLOG_DIR, filename);
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);

  const parsed = articleFrontmatterSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(
      `Invalid frontmatter in content/blog/${filename}:\n${parsed.error.issues
        .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
        .join("\n")}`
    );
  }

  const stats = readingTime(content);

  return {
    ...parsed.data,
    readingTimeMinutes: Math.max(1, Math.round(stats.minutes)),
    content,
  };
}

let cache: Article[] | null = null;

/** Reads and validates every article in content/blog, sorted newest first. Cached per server process. */
export function getAllArticles(): Article[] {
  if (cache) return cache;
  if (!fs.existsSync(BLOG_DIR)) {
    cache = [];
    return cache;
  }
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));
  const articles = files.map(readArticleFile);

  const slugs = new Set<string>();
  for (const article of articles) {
    if (slugs.has(article.slug)) {
      throw new Error(`Duplicate blog slug detected: "${article.slug}"`);
    }
    slugs.add(article.slug);
  }

  articles.sort((a, b) => (a.date < b.date ? 1 : -1));
  cache = articles;
  return articles;
}

export function getAllArticleSummaries(): ArticleSummary[] {
  return getAllArticles().map((article) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { content, ...summary } = article;
    return summary;
  });
}

export function getAllTags(): string[] {
  const tags = new Set<string>();
  for (const article of getAllArticles()) {
    for (const tag of article.tags) tags.add(tag);
  }
  return Array.from(tags).sort();
}

export function getArticlesByTag(tag: string): ArticleSummary[] {
  return getAllArticleSummaries().filter((a) => a.tags.includes(tag));
}

export function getRelatedArticles(current: ArticleSummary, limit = 3): ArticleSummary[] {
  const others = getAllArticleSummaries().filter((a) => a.slug !== current.slug);
  const scored = others.map((article) => {
    const overlap = article.tags.filter((t) => current.tags.includes(t)).length;
    return { article, overlap };
  });
  scored.sort((a, b) => b.overlap - a.overlap);
  return scored.slice(0, limit).map((s) => s.article);
}
