import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: "SolToken",
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#ab9ff2",
    icons: [
      { src: "/images/logo.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
