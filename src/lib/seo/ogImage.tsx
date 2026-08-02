import { siteConfig } from "@/lib/site-config";

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
        <div
          style={{
            display: "flex",
            width: 44,
            height: 44,
            borderRadius: 999,
            background: "#ab9ff2",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            fontWeight: 800,
            color: "#0a0a0a",
          }}
        >
          S
        </div>
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
