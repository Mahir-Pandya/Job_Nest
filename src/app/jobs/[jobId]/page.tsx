import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { MapPin, Clock, Building2 } from "lucide-react";

import { getJobById } from "@/features/employers/jobs/server/jobs.queries";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import JobOverviewSidebar from "@/features/applicants/jobs/components/jobOverviewSidebar";

import { db } from "@/config/db";
import { jobApplications, resumes } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/features/auth/server/auth.queries";
import Link from "next/link";
import { ApplyJobModal } from "@/features/applicants/jobs/components/apply-job-modal";
import { savedJobs } from "@/drizzle/schema";
import { SaveJobButton } from "@/features/applicants/components/SaveJobButton";


interface EditJobPageProps {
  params: Promise<{ jobId: string }>;
}

export async function generateMetadata(
  { params }: EditJobPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { jobId: rawJobId } = await params;
  const jobId = parseInt(rawJobId);
  if (isNaN(jobId)) return { title: "Job Not Found" };

  const job = await getJobById(jobId);
  if (!job) return { title: "Job Not Found" };

  const previousImages = (await parent).openGraph?.images || [];
  const ogImage = job.companyLogo ? [job.companyLogo, ...previousImages] : previousImages;

  return {
    title: job.title,
    description: `Apply for ${job.title} at ${job.companyName} in ${job.location || 'Remote'}.`,
    openGraph: {
      title: `${job.title} at ${job.companyName}`,
      description: `Apply for ${job.title} at ${job.companyName} in ${job.location || 'Remote'}.`,
      images: ogImage,
    },
    twitter: {
      card: "summary_large_image",
      title: `${job.title} at ${job.companyName}`,
      description: `Apply for ${job.title} at ${job.companyName} in ${job.location || 'Remote'}.`,
      images: ogImage,
    },
  };
}

const JobsDetailedPage = async ({ params }: EditJobPageProps) => {
  const { jobId: rawJobId } = await params;
  const jobId = parseInt(rawJobId);
  if (isNaN(jobId)) return notFound();

  const job = await getJobById(jobId);
  if (!job) return notFound();

  // --- FETCH USER, APPLICATION STATUS, AND RESUMES ---
  const user = await getCurrentUser();
  let hasApplied = false;
  let isSaved = false;
  let userResumes: { id: number; fileName: string }[] = [];


  if (user) {
    const existingApplication = await db
      .select()
      .from(jobApplications)
      .where(
        and(
          eq(jobApplications.jobId, jobId),
          eq(jobApplications.applicantId, user.id),
        ),
      )
      .limit(1);

    hasApplied = existingApplication.length > 0;

    // Check if job is saved
    const existingSave = await db
      .select()
      .from(savedJobs)
      .where(and(eq(savedJobs.jobId, jobId), eq(savedJobs.userId, user.id)))
      .limit(1);

    isSaved = existingSave.length > 0;

    // Fetch their resumes for the dropdown

    userResumes = await db
      .select({ id: resumes.id, fileName: resumes.fileName })
      .from(resumes)
      .where(eq(resumes.applicantId, user.id));
  }

  return (
    <div className="container mx-auto max-w-6xl py-10 px-4 space-y-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between border-b pb-8">
        <div className="flex gap-5">
          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border bg-gray-50">
            {job.companyLogo ? (
              <Image
                src={job.companyLogo}
                alt={job.companyName || "Company"}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-100 text-lg font-bold text-gray-400">
                {job.companyName?.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {job.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <Link 
                href={`/companies/${job.employerId}`}
                className="font-medium text-blue-600 flex items-center gap-1 hover:underline"
              >
                <Building2 className="h-4 w-4" />
                {job.companyName}
              </Link>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {job.location || "Remote"}
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Posted{" "}
                {formatDistanceToNow(new Date(job.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>
        </div>

        {/* -- INTERACTIVE ACTION BUTTON --- */}
        <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
          {user ? (
            <>
              <ApplyJobModal
                jobId={jobId}
                jobTitle={job.title}
                hasApplied={hasApplied}
                resumes={userResumes}
              />
              <SaveJobButton jobId={jobId} initialIsSaved={isSaved} />
            </>
          ) : (

            <Button
              size="lg"
              className="w-full md:w-auto font-semibold"
              asChild
            >
              <Link href="/login">Login to Apply</Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              About the Job
            </h2>
            <div
              className="prose prose-blue max-w-none text-gray-600 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: job.description }}
            />
          </section>

          {/* Tags */}
          {job.tags && (
            <section className="pt-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">
                Skills & Technologies
              </h3>
              <div className="flex flex-wrap gap-2">
                {job.tags.split(",").map((tag) => (
                  <Badge key={tag} variant="secondary" className="px-3 py-1">
                    {tag.trim()}
                  </Badge>
                ))}
              </div>
            </section>
          )}
        </div>

        <JobOverviewSidebar job={job} />
      </div>
    </div>
  );
};

export default JobsDetailedPage;
