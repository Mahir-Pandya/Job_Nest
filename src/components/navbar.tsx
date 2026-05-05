import Link from "next/link";
import { Briefcase, LogOut, MessageSquare } from "lucide-react"; // Import LogOut icon
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/features/auth/server/auth.queries";
import { logoutUserAction } from "@/features/auth/server/auth.actions";
import { getUnreadMessageCount } from "@/features/messages/server/messages.queries";

export default async function Navbar() {
  const user = await getCurrentUser();
  const unreadCount = user ? await getUnreadMessageCount(user.id) : 0;

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl text-blue-600"
        >
          🎓 JobNest
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <Link href="/jobs" className="hover:text-blue-600 transition-colors">
            Find Job
          </Link>
          <Link href="/companies" className="hover:text-blue-600 transition-colors">
            Companies
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {!user ? (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Post a Job</Link>
              </Button> 
            </>
          ) : (
            <>
              <Button asChild variant="outline">
                <Link
                  href={
                    user.role === "employer"
                      ? "/employer-dashboard"
                      : "/dashboard/settings"
                  }
                >
                  Dashboard
                </Link>
              </Button>

              <Button asChild variant="ghost" size="icon" className="relative mr-1">
                <Link href="/messages" title="Messages">
                  <MessageSquare className="w-5 h-5 text-gray-600 hover:text-blue-600 transition-colors" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full animate-in fade-in zoom-in duration-200">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
              </Button>

              <form action={logoutUserAction}>
                <Button
                  variant="ghost"
                  type="submit"
                  size="icon"
                  title="Log out"
                >
                  <LogOut className="w-5 h-5 text-gray-600 hover:text-red-600 transition-colors" />
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
