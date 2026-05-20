import Link from "next/link";
import { Briefcase, LogOut, MessageSquare, LayoutDashboard, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/features/auth/server/auth.queries";
import { logoutUserAction } from "@/features/auth/server/auth.actions";
import { getUnreadMessageCount } from "@/features/messages/server/messages.queries";
import { NavLinks } from "./nav-links";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default async function Navbar() {
  const user = await getCurrentUser();
  const unreadCount = user ? await getUnreadMessageCount(user.id) : 0;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200/50 bg-white/75 backdrop-blur-xl transition-all shadow-sm">
      <div className="container mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl text-blue-600 tracking-tight"
        >
          <div className="bg-blue-600 text-white p-1.5 rounded-lg flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
          JobNest
        </Link>

        <NavLinks />

        <div className="flex items-center gap-4">
          {!user ? (
            <>
              <Button variant="ghost" className="rounded-full font-medium" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button className="rounded-full font-medium bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20" asChild>
                <Link href="/register">Post a Job</Link>
              </Button> 
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="icon" className="relative mr-2 rounded-full hover:bg-blue-50">
                <Link href="/messages" title="Messages">
                  <MessageSquare className="w-5 h-5 text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full animate-in fade-in zoom-in duration-200">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full focus-visible:ring-2 focus-visible:ring-blue-600">
                    <Avatar className="h-10 w-10 border-2 border-transparent hover:border-blue-200 transition-all">
                      <AvatarImage src={user.avatarUrl || ""} alt={user.name} />
                      <AvatarFallback className="bg-blue-100 text-blue-700 font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 mt-2 rounded-xl" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/dashboard" className="flex w-full items-center">
                        <LayoutDashboard className="mr-2 h-4 w-4 text-gray-500" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/dashboard/settings" className="flex w-full items-center">
                        <Settings className="mr-2 h-4 w-4 text-gray-500" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer focus:bg-red-50 focus:text-red-600">
                    <form action={logoutUserAction} className="w-full">
                      <button type="submit" className="flex w-full items-center text-left">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sign out</span>
                      </button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
