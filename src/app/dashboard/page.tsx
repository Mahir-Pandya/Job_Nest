import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";

import { getCurrentUser } from "@/features/auth/server/auth.queries";
import {
  getApplicantDashboardStats,
} from "@/features/applicants/server/applicant.queries";
import { ApplicantStats } from "@/features/applicants/components/applicant-stats";
import { ApplicantProfileStatus } from "@/features/applicants/components/applicant-profile-status";
import { RecentApplications as ApplicantRecentApplications } from "@/features/applicants/components/recent-applications";
import { Button } from "@/components/ui/button";

import { EmployerProfileCompletionStatus } from "@/features/employers/components/employer-profile-status";
import { StatsCards as EmployerStatsCards } from "@/features/employers/components/employer-stats";
import { RecentApplications as EmployerRecentApplications } from "@/features/employers/components/recent-applications";
import { HiringChecklist } from "@/features/employers/components/hiring-checklist";
import {
  getCurrentEmployerDetails,
  getEmployerDashboardStats,
} from "@/features/server/employers.queries";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return redirect("/login");

  const firstName = user.name.split(" ")[0];

  if (user.role === "employer") {
    const employer = await getCurrentEmployerDetails();
    if (!employer) return redirect("/login");

    const stats = await getEmployerDashboardStats(user.id);

    return (
      <div className="space-y-6 max-w-6xl">
        {/* Welcome Section */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back,{" "}
            <span className="capitalize">{firstName.toLowerCase()}</span>!
          </h1>
          <p className="text-gray-500 mt-1">
            Here&apos;s an overview of your hiring progress today.
          </p>
        </div>

        {/* Profile Incomplete Alert */}
        <EmployerProfileCompletionStatus />

        {/* Stats Cards */}
        <EmployerStatsCards stats={stats} />

        {/* Bottom Grid: Recent Applications + Hiring Checklist */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EmployerRecentApplications applications={stats.recentApplications} />
          <HiringChecklist
            isProfileCompleted={!!employer.isProfileCompleted}
            pendingCount={stats.pendingCount}
          />
        </div>
      </div>
    );
  }

  // Applicant Dashboard
  const [stats] = await Promise.all([
    getApplicantDashboardStats(user.id),
  ]);

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? "Good morning"
      : currentHour < 17
        ? "Good afternoon"
        : "Good evening";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-violet-700 to-blue-700 px-8 py-10">
        {/* Decorative blobs */}
        <div className="absolute -top-10 -right-10 h-48 w-48 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-white/5 blur-xl" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6 max-w-5xl mx-auto">
          <div>
            <p className="text-violet-200 text-sm font-medium mb-1">{greeting} 👋</p>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Welcome,{" "}
              <span className="capitalize">{firstName.toLowerCase()}</span>!
            </h1>
            <p className="text-violet-200 text-sm mt-2">
              Here&apos;s what&apos;s happening with your job search today.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              className="bg-white text-violet-700 hover:bg-violet-50 font-semibold shadow-lg gap-2"
              asChild
            >
              <Link href="/jobs">
                <Search className="h-4 w-4" />
                Browse Jobs
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-8 py-8 space-y-8">
        {/* Stats Cards */}
        <ApplicantStats stats={stats} />

        {/* Profile Incomplete Banner */}
        <ApplicantProfileStatus />

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/dashboard/applied-jobs">
            <div className="group flex items-center justify-between p-5 bg-white rounded-2xl border border-gray-100 hover:border-violet-200 hover:shadow-md transition-all duration-300 cursor-pointer">
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-violet-700 transition-colors">
                  My Applications
                </p>
                <p className="text-sm text-gray-400 mt-0.5">
                  {stats.appliedCount} total applications
                </p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-violet-50 group-hover:bg-violet-100 flex items-center justify-center transition-colors">
                <ArrowRight className="h-5 w-5 text-violet-600" />
              </div>
            </div>
          </Link>

          <Link href="/dashboard/saved-jobs">
            <div className="group flex items-center justify-between p-5 bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-300 cursor-pointer">
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  Saved Jobs
                </p>
                <p className="text-sm text-gray-400 mt-0.5">
                  {stats.savedCount} jobs bookmarked
                </p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                <ArrowRight className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Applications Table */}
        <ApplicantRecentApplications />
      </div>
    </div>
  );
}
