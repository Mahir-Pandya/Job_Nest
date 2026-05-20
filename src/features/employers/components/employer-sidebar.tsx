"use client";

import { logoutUserAction } from "@/features/auth/server/auth.actions";
import { isActiveLink } from "@/lib/navigation-utils";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { employerNavItems } from "@/config/constant";

interface EmployerSidebarProps {
  userName?: string;
  unreadCount?: number;
}

const EmployerSidebar = ({ userName, unreadCount = 0 }: EmployerSidebarProps) => {
  const pathname = usePathname();
  const initial = userName?.charAt(0).toUpperCase() || "U";

  return (
    <aside className="w-64 bg-white border-r border-gray-200 fixed bottom-0 top-0 flex flex-col z-30">
      {/* Brand / Logo */}
      <div className="px-6 py-5">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 group"
        >
          <span className="text-xl font-bold text-gray-900 tracking-tight transition-colors">
            Job<span className="text-orange-500">Nest</span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="px-3 flex-1 space-y-1 mt-2">
        {employerNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActiveLink(pathname, item.href, item.exact);
          const isMessages = item.href === "/messages";

          return (
            <Link
              key={item.name}
              href={item.href || "#"}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                active
                  ? "bg-gray-900 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Icon className="h-[18px] w-[18px]" />
              <span className="flex-1">{item.name}</span>
              {isMessages && unreadCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-100">
        <form action={logoutUserAction}>
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-all duration-200 w-full"
          >
            <div className="h-7 w-7 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-xs font-bold shrink-0">
              {initial}
            </div>
            Logout
          </button>
        </form>
      </div>
    </aside>
  );
};

export default EmployerSidebar;
