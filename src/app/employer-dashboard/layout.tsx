import { getCurrentUser } from "@/features/auth/server/auth.queries";
import EmployerSidebar from "@/features/employers/components/employer-sidebar";
import { EmployerDashboardHeader } from "@/features/employers/components/employer-dashboard-header";
import { getEmployerDashboardStats } from "@/features/server/employers.queries";
import { redirect } from "next/navigation";
import React from "react";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  if (!user) return redirect("/login");

  if (user.role === "applicant") return redirect("/dashboard");
  if (user.role !== "employer") return redirect("/login");

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
