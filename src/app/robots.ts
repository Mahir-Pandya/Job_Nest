import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://jobnest.vercel.app";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/(applicants)/dashboard/",
        "/employer-dashboard/",
        "/messages/",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
