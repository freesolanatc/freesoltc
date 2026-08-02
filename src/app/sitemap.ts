import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { getAllArticleSummaries } from "@/lib/mdx/getAllArticles";

const STATIC_ROUTES = [
  { path: "/", priority: 1, changeFrequency: "weekly" as const },
  { path: "/create-token", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/revoke-mint-authority", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/revoke-freeze-authority", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/airdrop", priority: 0.8, changeFrequency: "weekly" as const },
  { path: "/referral", priority: 0.7, changeFrequency: "weekly" as const },
  { path: "/blog", priority: 0.7, changeFrequency: "daily" as const },
  { path: "/faq", priority: 0.6, changeFrequency: "monthly" as const },
  { path: "/about", priority: 0.5, changeFrequency: "monthly" as const },
  { path: "/contact", priority: 0.4, changeFrequency: "yearly" as const },
  { path: "/privacy-policy", priority: 0.2, changeFrequency: "yearly" as const },
  { path: "/terms", priority: 0.2, changeFrequency: "yearly" as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: new URL(route.path, siteConfig.url).toString(),
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const articleEntries: MetadataRoute.Sitemap = getAllArticleSummaries().map((article) => ({
    url: new URL(`/blog/${article.slug}`, siteConfig.url).toString(),
    lastModified: new Date(article.updatedDate ?? article.date),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticEntries, ...articleEntries];
}
