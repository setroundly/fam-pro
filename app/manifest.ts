import type { MetadataRoute } from "next";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/branding";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_NAME,
    short_name: "fam proレシピ",
    description: APP_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#dce8f2",
    theme_color: "#5b8fad",
    orientation: "portrait-primary",
    lang: "ja",
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
