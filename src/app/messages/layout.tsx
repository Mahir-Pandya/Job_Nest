import { getCurrentUser } from "@/features/auth/server/auth.queries";
import { getUserConversations } from "@/features/messages/server/messages.queries";
import { ConversationList } from "@/features/messages/components/ConversationList";
import { redirect } from "next/navigation";
import ApplicantSidebar from "@/features/applicants/components/applicant-sidebar";
import EmployerSidebar from "@/features/employers/components/employer-sidebar";
import { getApplicantDashboardStats } from "@/features/applicants/server/applicant.queries";
import { getEmployerDashboardStats } from "@/features/server/employers.queries";

export default async function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) return redirect("/login");

  const conversations = await getUserConversations(user.id);
  const isEmployer = user.role === "employer";

  const stats = isEmployer
    ? await getEmployerDashboardStats(user.id)
    : await getApplicantDashboardStats(user.id);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left navigation sidebar */}
      {isEmployer ? (
        <EmployerSidebar
          userName={user.name}
          unreadCount={stats.unreadMessagesCount}
        />
      ) : (
        <ApplicantSidebar
          appliedCount={(stats as Awaited<ReturnType<typeof getApplicantDashboardStats>>).appliedCount ?? 0}
          savedCount={(stats as Awaited<ReturnType<typeof getApplicantDashboardStats>>).savedCount ?? 0}
          unreadCount={stats.unreadMessagesCount ?? 0}
        />
      )}

      {/* Main content area — offset by sidebar width */}
      <main className="flex-1 ml-64 min-h-screen">
        <div className="p-6 h-full">
          <div
            className="grid grid-cols-1 md:grid-cols-12 gap-5"
            style={{ height: "calc(100vh - 64px - 48px)" }}
          >
            {/* Conversation list */}
            <div className="md:col-span-4 h-full">
              <ConversationList conversations={conversations} />
            </div>

            {/* Chat window */}
            <div className="md:col-span-8 h-full">
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
