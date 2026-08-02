import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

interface BuildMetadataOptions {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  noIndex?: boolean;
}

/** Central helper so every route produces consistent title/canonical/OG/Twitter metadata. */
export function buildMetadata({
  title,
  description,
  path,
  image,
  type = "website",
  noIndex = false,
}: BuildMetadataOptions): Metadata {
  const url = new URL(path, siteConfig.url).toString();
  const ogImage = image ?? siteConfig.ogImage;
  const fullTitle = path === "/" ? title : `${title} | ${siteConfig.name}`;

  return {
    title: fullTitle,
    description,
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      site: siteConfig.twitterHandle,
      images: [ogImage],
    },
  };
}
