import { Bookmark, Building2, MapPin, Clock, ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/features/auth/server/auth.queries";
import { getSavedJobsForApplicant } from "@/features/applicants/server/applicant.queries";
import { redirect } from "next/navigation";
import { SaveJobButton } from "@/features/applicants/components/SaveJobButton";

export default async function SavedJobsPage() {
  const user = await getCurrentUser();
  if (!user) return redirect("/login");

  const savedJobs = await getSavedJobsForApplicant(user.id);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-100 px-8 py-6">
        <div className="max-w-5xl mx-auto">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-violet-600 transition-colors mb-4 w-fit"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Saved Jobs</h1>
              <p className="text-gray-400 text-sm mt-1">
                Jobs you&apos;ve bookmarked to apply later
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-blue-50 text-blue-700 text-sm font-bold px-4 py-2 rounded-xl">
                {savedJobs.length} saved
              </div>
              <Button size="sm" asChild className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
                <Link href="/jobs">
                  <Search className="h-4 w-4" />
                  Browse More
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-8">
        {/* Empty State */}
        {savedJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-gray-200 py-20 text-center">
            <div className="h-20 w-20 rounded-2xl bg-blue-50 flex items-center justify-center mb-5">
              <Bookmark className="w-10 h-10 text-blue-200" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">No saved jobs yet</h3>
            <p className="text-gray-400 text-sm mb-6 max-w-xs">
              Save jobs you&apos;re interested in to revisit and apply later.
            </p>
            <Button asChild className="bg-violet-600 hover:bg-violet-700 text-white">
              <Link href="/jobs">Browse Jobs</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {savedJobs.map((item) => {
              const { job, employer } = item;

              return (
                <div
                  key={item.id}
                  className="group bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-300 p-6"
                >
                  <div className="flex flex-col sm:flex-row items-start gap-5">
                    {/* Company Logo */}
                    <div className="relative h-14 w-14 flex-shrink-0 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden">
                      {employer?.bannerImageUrl ? (
                        <Image
                          src={employer.bannerImageUrl}
                          alt={employer.name || "Company"}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <Building2 className="w-7 h-7 text-gray-300" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                            <Link href={`/jobs/${job.id}`}>{job.title}</Link>
                          </h3>
                          <p className="text-sm font-semibold text-blue-600 mb-3">
                            {employer?.name || "Unknown Company"}
                          </p>

                          <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-gray-300" />
                              {job.location || "Remote"}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-gray-300" />
                              Saved{" "}
                              {formatDistanceToNow(new Date(job.createdAt), {
                                addSuffix: true,
                              })}
                            </span>
                            {job.jobType && (
                              <Badge
                                variant="secondary"
                                className="capitalize text-[11px] rounded-full"
                              >
                                {job.jobType}
                              </Badge>
                            )}
                            {job.workType && (
                              <Badge
                                variant="secondary"
                                className="capitalize text-[11px] rounded-full bg-blue-50 text-blue-600 hover:bg-blue-50"
                              >
                                {job.workType}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <SaveJobButton jobId={job.id} initialIsSaved={true} />
                          <Button
                            size="sm"
                            className="bg-violet-600 hover:bg-violet-700 text-white"
                            asChild
                          >
                            <Link href={`/jobs/${job.id}`}>Apply Now</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
