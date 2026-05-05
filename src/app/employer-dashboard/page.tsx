import { getCurrentUser } from "@/features/auth/server/auth.queries";
import { EmployerProfileCompletionStatus } from "@/features/employers/components/employer-profile-status";
import { StatsCards } from "@/features/employers/components/employer-stats";
import { RecentApplications } from "@/features/employers/components/recent-applications";
import { HiringChecklist } from "@/features/employers/components/hiring-checklist";
import {
  getCurrentEmployerDetails,
  getEmployerDashboardStats,
} from "@/features/server/employers.queries";
import { redirect } from "next/navigation";

const EmployerDashboard = async () => {
  const user = await getCurrentUser();

  if (!user) return redirect("/login");

  const employer = await getCurrentEmployerDetails();
  if (!employer) return redirect("/login");

  const stats = await getEmployerDashboardStats(user.id);

  // Get first name for welcome message
  const firstName = user.name.split(" ")[0];

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
      <StatsCards stats={stats} />

      {/* Bottom Grid: Recent Applications + Hiring Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentApplications applications={stats.recentApplications} />
        <HiringChecklist
          isProfileCompleted={!!employer.isProfileCompleted}
          pendingCount={stats.pendingCount}
        />
      </div>
    </div>
  );
};

export default EmployerDashboard;
