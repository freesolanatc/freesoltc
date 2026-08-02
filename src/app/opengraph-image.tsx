import { ImageResponse } from "next/og";
import { renderOgImage, OG_IMAGE_SIZE } from "@/lib/seo/ogImage";

export const size = OG_IMAGE_SIZE;
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    renderOgImage("Create Solana Token Free", "No platform fee — only the Solana network fee"),
    { ...size }
  );
}
