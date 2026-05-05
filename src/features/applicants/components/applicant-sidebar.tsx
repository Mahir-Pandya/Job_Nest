"use client";

import { logoutUserAction } from "@/features/auth/server/auth.actions";
import { isActiveLink } from "@/lib/navigation-utils";
import { cn } from "@/lib/utils";
import { LogOut, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { applicantNavItems } from "@/config/constant";

interface ApplicantSidebarProps {
  appliedCount?: number;
  savedCount?: number;
  unreadCount?: number;
}

const ApplicantSidebar = ({
  appliedCount = 0,
  savedCount = 0,
  unreadCount = 0,
}: ApplicantSidebarProps) => {
  const pathname = usePathname();

  const getBadgeCount = (href: string) => {
    if (href === "/dashboard/applied-jobs") return appliedCount;
    if (href === "/dashboard/saved-jobs") return savedCount;
    if (href === "/messages") return unreadCount;
    return 0;
  };

  return (
    <div className="w-64 bg-white border-r border-gray-100 fixed bottom-0 top-0 flex flex-col shadow-sm z-30">
      {/* Logo / Brand */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-sm">JP</span>
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm leading-tight">Job Portal</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">Applicant</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-3 mb-3">
          Menu
        </p>
        {applicantNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActiveLink(pathname, item.href, item.exact);
          const badgeCount = getBadgeCount(item.href);

          return (
            <Link
              key={item.name}
              href={item.href || "#"}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group",
                active
                  ? "bg-violet-600 text-white shadow-md shadow-violet-200"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 flex-shrink-0 transition-transform group-hover:scale-110",
                  active ? "text-white" : "text-gray-400 group-hover:text-violet-600"
                )}
              />
              <span className="flex-1">{item.name}</span>

              {/* Badge for counts */}
              {badgeCount > 0 && (
                <span
                  className={cn(
                    "inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-[10px] font-bold rounded-full",
                    active
                      ? "bg-white/20 text-white"
                      : "bg-violet-100 text-violet-700"
                  )}
                >
                  {badgeCount > 99 ? "99+" : badgeCount}
                </span>
              )}

              {/* Arrow for active */}
              {active && <ChevronRight className="h-3 w-3 text-white/70 flex-shrink-0" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: Logout */}
      <div className="p-3 border-t border-gray-100">
        <form action={logoutUserAction}>
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 w-full group"
          >
            <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform" />
            Log out
          </button>
        </form>
      </div>
    </div>
  );
};

export default ApplicantSidebar;
