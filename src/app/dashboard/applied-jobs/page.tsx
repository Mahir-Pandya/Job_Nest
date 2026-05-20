import { getCurrentUser } from "@/features/auth/server/auth.queries";
import { getAppliedJobsForApplicant } from "@/features/applicants/server/applicant.queries";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Building2, MapPin, Clock, Banknote, ArrowLeft, FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";

export default async function AppliedJobsPage() {
  const user = await getCurrentUser();
  if (!user) return redirect("/login");

  const applications = await getAppliedJobsForApplicant(user.id);

  // Group by status
  const statusOrder = ["pending", "reviewed", "shortlisted", "hired", "rejected"];
  const sorted = [...applications].sort(
    (a, b) =>
      statusOrder.indexOf(a.application.status) -
      statusOrder.indexOf(b.application.status)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
              <h1 className="text-2xl font-bold text-gray-900">Applied Jobs</h1>
              <p className="text-gray-400 text-sm mt-1">
                Track all your job applications in one place
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-violet-50 text-violet-700 text-sm font-bold px-4 py-2 rounded-xl">
                {applications.length} total
              </div>
              <Button size="sm" asChild className="bg-violet-600 hover:bg-violet-700 text-white">
                <Link href="/jobs">Find More Jobs</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-8">
        {/* Empty State */}
        {applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-gray-200 py-20 text-center">
            <div className="h-20 w-20 rounded-2xl bg-gray-50 flex items-center justify-center mb-5">
              <FileText className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">No applications yet</h3>
            <p className="text-gray-400 text-sm mb-6 max-w-xs">
              You haven&apos;t applied to any jobs yet. Start exploring opportunities!
            </p>
            <Button asChild className="bg-violet-600 hover:bg-violet-700 text-white">
              <Link href="/jobs">Browse Jobs</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {sorted.map((app) => {
              const { application, job, employer } = app;

              return (
                <div
                  key={application.id}
                  className="group bg-white rounded-2xl border border-gray-100 hover:border-violet-200 hover:shadow-md transition-all duration-300 overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row gap-5 p-6">
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

                    {/* Main Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-bold text-gray-900 text-lg group-hover:text-violet-700 transition-colors line-clamp-1">
                              {job.title}
                            </h3>
                            {job.jobType && (
                              <Badge className="rounded-full text-[10px] font-medium border-0 bg-violet-50 text-violet-600 hover:bg-violet-50">
                                {job.jobType}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm font-semibold text-violet-600 mb-3">
                            {employer?.name || "Unknown Company"}
                          </p>

                          <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-gray-300" />
                              {job.location || "Remote"}
                            </span>
                            {(job.minSalary || job.maxSalary) && (
                              <span className="flex items-center gap-1.5">
                                <Banknote className="w-3.5 h-3.5 text-gray-300" />
                                {job.salaryCurrency} {job.minSalary?.toLocaleString()} –{" "}
                                {job.maxSalary?.toLocaleString()}/{job.salaryPeriod}
                              </span>
                            )}
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-gray-300" />
                              Applied{" "}
                              {formatDistanceToNow(new Date(application.appliedAt), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Right: Status + Action */}
                        <div className="flex sm:flex-col items-center sm:items-end gap-3 flex-shrink-0">
                          <StatusBadge status={application.status} />
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-200 hover:border-violet-300 hover:text-violet-600 text-xs"
                            asChild
                          >
                            <Link href={`/jobs/${job.id}`}>View Job</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom status bar */}
                  <div
                    className={`h-1 w-full transition-all duration-300 ${
                      application.status === "hired"
                        ? "bg-emerald-400"
                        : application.status === "shortlisted"
                          ? "bg-purple-400"
                          : application.status === "rejected"
                            ? "bg-red-300"
                            : application.status === "reviewed"
                              ? "bg-blue-300"
                              : "bg-amber-200"
                    }`}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
