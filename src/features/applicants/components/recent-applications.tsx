import Link from "next/link";
import Image from "next/image";
import { MapPin, ArrowRight, Building2, Calendar, ExternalLink } from "lucide-react";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { getCurrentUser } from "@/features/auth/server/auth.queries";
import { getAppliedJobsForApplicant } from "@/features/applicants/server/applicant.queries";
import { redirect } from "next/navigation";

export async function RecentApplications() {
  const user = await getCurrentUser();
  if (!user) return redirect("/login");

  const allApplications = await getAppliedJobsForApplicant(user.id);
  const recentApplications = allApplications.slice(0, 5);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50">
        <div>
          <h3 className="font-bold text-gray-900">Recent Applications</h3>
          <p className="text-xs text-gray-400 mt-0.5">Your most recent job applications</p>
        </div>
        <Link
          href="/dashboard/applied-jobs"
          className="flex items-center gap-1.5 text-sm font-medium text-violet-600 hover:text-violet-700 transition-colors group"
        >
          View all
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {recentApplications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="h-16 w-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-gray-300" />
          </div>
          <p className="font-semibold text-gray-700 mb-1">No applications yet</p>
          <p className="text-sm text-gray-400 mb-5">
            Start applying to jobs and track your progress here.
          </p>
          <Button size="sm" asChild className="bg-violet-600 hover:bg-violet-700 text-white">
            <Link href="/jobs">Browse Jobs</Link>
          </Button>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {recentApplications.map((app) => {
            const { application, job, employer } = app;

            return (
              <div
                key={application.id}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/60 transition-colors group"
              >
                {/* Company Logo */}
                <div className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gray-100 overflow-hidden border border-gray-100">
                  {employer?.bannerImageUrl ? (
                    <Image
                      src={employer.bannerImageUrl}
                      alt={employer.name || "Company"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <Building2 className="h-5 w-5 text-gray-400" />
                  )}
                </div>

                {/* Job Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 text-sm line-clamp-1 group-hover:text-violet-700 transition-colors">
                      {job.title}
                    </span>
                    {job.jobType && (
                      <Badge className="rounded-full px-2 py-0 text-[10px] font-medium border-0 bg-violet-50 text-violet-600 hover:bg-violet-50 whitespace-nowrap hidden sm:inline-flex">
                        {job.jobType}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="font-medium text-gray-500">
                      {employer?.name || "Unknown Company"}
                    </span>
                    {job.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {job.location}
                      </span>
                    )}
                  </div>
                </div>

                {/* Date */}
                <div className="hidden md:flex items-center gap-1.5 text-xs text-gray-400 flex-shrink-0">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(application.appliedAt), "MMM d, yyyy")}
                </div>

                {/* Status */}
                <div className="flex-shrink-0">
                  <StatusBadge status={application.status} />
                </div>

                {/* Action */}
                <Link
                  href={`/jobs/${job.id}`}
                  className="hidden md:flex flex-shrink-0 items-center gap-1 text-xs font-medium text-gray-400 hover:text-violet-600 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
