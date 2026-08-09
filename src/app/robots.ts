import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://modareseani.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login", "/signup", "/forgot-password"],
        // Everything past this point requires a logged-in session anyway
        // (see middleware.ts), so there's nothing for a crawler to index —
        // disallowing avoids wasted crawl budget and redirect chains.
        disallow: ["/teachers", "/settings", "/admin", "/onboarding", "/api"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
