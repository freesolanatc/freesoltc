import { ImageResponse } from "next/og";
import { renderOgImage, OG_IMAGE_SIZE } from "@/lib/seo/ogImage";
import { getArticleBySlug } from "@/lib/mdx/getArticleBySlug";

export const size = OG_IMAGE_SIZE;
export const contentType = "image/png";

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  return new ImageResponse(renderOgImage(article?.title ?? "Solana Token Guides"), { ...size });
}
