import ApplicantSidebar from "@/features/applicants/components/applicant-sidebar";
import { getCurrentUser } from "@/features/auth/server/auth.queries";
import { getApplicantDashboardStats } from "@/features/applicants/server/applicant.queries";
import { redirect } from "next/navigation";
import React from "react";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  if (!user) return redirect("/login");

  if (user.role === "employer") return redirect("/employer-dashboard");
  if (user.role !== "applicant") return redirect("/login");

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
