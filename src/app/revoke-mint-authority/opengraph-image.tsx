import { ImageResponse } from "next/og";
import { renderOgImage, OG_IMAGE_SIZE } from "@/lib/seo/ogImage";

export const size = OG_IMAGE_SIZE;
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    renderOgImage("Revoke Mint Authority Free", "Prove your token supply can never be inflated"),
    { ...size }
  );
}
