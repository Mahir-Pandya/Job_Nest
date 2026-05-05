import { MetadataRoute } from "next";
import { db } from "@/config/db";
import { jobs, employers } from "@/drizzle/schema";
import { isNull } from "drizzle-orm";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://jobnest.vercel.app";

  // Fetch all active jobs
  const allJobs = await db
    .select({ id: jobs.id, createdAt: jobs.createdAt })
    .from(jobs)
    .where(isNull(jobs.deletedAt));

  // Fetch all companies
  const allCompanies = await db
    .select({ id: employers.id })
    .from(employers);

  const jobUrls = allJobs.map((job) => ({
    url: `${baseUrl}/jobs/${job.id}`,
    lastModified: job.createdAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const companyUrls = allCompanies.map((company) => ({
    url: `${baseUrl}/companies/${company.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const staticUrls = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/jobs`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/companies`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
  ];

  return [...staticUrls, ...jobUrls, ...companyUrls];
}
