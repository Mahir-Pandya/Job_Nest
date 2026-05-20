import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/server/auth.queries";
import ApplicantSidebar from "@/features/applicants/components/applicant-sidebar";
import { getApplicantDashboardStats } from "@/features/applicants/server/applicant.queries";
import EmployerSidebar from "@/features/employers/components/employer-sidebar";
import { EmployerDashboardHeader } from "@/features/employers/components/employer-dashboard-header";
import { getEmployerDashboardStats } from "@/features/server/employers.queries";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  if (!user) return redirect("/login");

  if (user.role === "employer") {
    const stats = await getEmployerDashboardStats(user.id);
    return (
      <div className="flex min-h-screen bg-gray-50/50">
        <EmployerSidebar 
          userName={user.name} 
          unreadCount={stats.unreadMessagesCount}
        />
        <div className="flex-1 ml-64 flex flex-col">
          <EmployerDashboardHeader userName={user.name} />
          <main className="flex-1 px-8 py-6">{children}</main>
        </div>
      </div>
    );
  }

  if (user.role === "applicant") {
    const stats = await getApplicantDashboardStats(user.id);
    return (
      <div className="flex min-h-screen bg-gray-50">
        <ApplicantSidebar
          appliedCount={stats.appliedCount}
          savedCount={stats.savedCount}
          unreadCount={stats.unreadMessagesCount}
        />
        <main className="flex-1 ml-64 min-h-screen">{children}</main>
      </div>
    );
  }

  return redirect("/login");
}
