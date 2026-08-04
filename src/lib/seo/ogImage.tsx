import { siteConfig } from "@/lib/site-config";
import { OG_LOGO_DATA_URI } from "@/lib/seo/ogLogoDataUri";

export const OG_IMAGE_SIZE = { width: 1200, height: 630 };

export function renderOgImage(title: string, subtitle?: string) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#000000",
        color: "white",
        fontFamily: "sans-serif",
        padding: 80,
        textAlign: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          fontSize: 28,
          fontWeight: 700,
          marginBottom: 32,
          color: "#a1a1aa",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={OG_LOGO_DATA_URI} width={44} height={44} alt="" />
        {siteConfig.name}
      </div>
      <div style={{ display: "flex", fontSize: 56, fontWeight: 800, maxWidth: 900 }}>{title}</div>
      {subtitle && (
        <div style={{ display: "flex", fontSize: 26, color: "#a1a1aa", marginTop: 20, maxWidth: 800 }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}
