import { ImageResponse } from "next/og";
import { renderOgImage, OG_IMAGE_SIZE } from "@/lib/seo/ogImage";

export const size = OG_IMAGE_SIZE;
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    renderOgImage("Revoke Freeze Authority Free", "Prove holder accounts can never be frozen"),
    { ...size }
  );
}
