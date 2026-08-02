import { NextResponse } from "next/server";
import { siteConfig } from "@/lib/site-config";
import { getAllArticleSummaries } from "@/lib/mdx/getAllArticles";

export const runtime = "nodejs";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function GET() {
  const articles = getAllArticleSummaries();

  const items = articles
    .map((article) => {
      const url = new URL(`/blog/${article.slug}`, siteConfig.url).toString();
      return `
    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      <description>${escapeXml(article.metaDescription)}</description>
      <pubDate>${new Date(article.date).toUTCString()}</pubDate>
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(siteConfig.name)} Blog</title>
    <link>${siteConfig.url}</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>en-us</language>${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
