import type { MetadataRoute } from "next";
import { getAppUrl } from "@/lib/branding";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/"],
    },
    sitemap: `${getAppUrl()}/sitemap.xml`,
  };
}
