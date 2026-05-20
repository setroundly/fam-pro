import type { MetadataRoute } from "next";
import { getAppUrl } from "@/lib/branding";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getAppUrl();
  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
