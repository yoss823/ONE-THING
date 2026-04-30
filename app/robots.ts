import type { MetadataRoute } from "next";

import { tryResolvePublicBaseUrl } from "@/lib/url/public-base-url";

export default function robots(): MetadataRoute.Robots {
  const raw = tryResolvePublicBaseUrl() ?? "https://one-thing-nu.vercel.app";
  const base = raw.replace(/\/+$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
