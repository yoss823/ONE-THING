import type { MetadataRoute } from "next";

import { tryResolvePublicBaseUrl } from "@/lib/url/public-base-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const raw = tryResolvePublicBaseUrl() ?? "https://one-thing-nu.vercel.app";
  const base = raw.replace(/\/+$/, "");
  const now = new Date();

  const locales = ["en", "fr", "es"] as const;

  const weekly = "weekly" as const;

  const supporting = ["faq", "legal", "privacy"] as const;

  return [
    { url: `${base}/`, lastModified: now, changeFrequency: weekly, priority: 1 },
    ...locales.flatMap((locale) => [
      {
        url: `${base}/l/${locale}`,
        lastModified: now,
        changeFrequency: weekly,
        priority: 0.9,
      },
      ...supporting.map((slug) => ({
        url: `${base}/l/${locale}/${slug}`,
        lastModified: now,
        changeFrequency: weekly,
        priority: 0.75,
      })),
    ]),
  ];
}
