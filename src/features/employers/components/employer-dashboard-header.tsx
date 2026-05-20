import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

interface EmployerDashboardHeaderProps {
  userName: string;
}

export function EmployerDashboardHeader({
  userName,
}: EmployerDashboardHeaderProps) {
  const initial = userName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="flex items-center justify-between px-8 py-4">
        <h1 className="text-lg font-semibold text-gray-900 tracking-tight">
          Employer Dashboard
        </h1>
        <div className="flex items-center gap-3">
          <Button
            asChild
            className="bg-orange-500 hover:bg-orange-600 text-white gap-2 rounded-full px-5 shadow-sm shadow-orange-200 transition-all duration-200 hover:shadow-md hover:shadow-orange-200"
          >
            <Link href="/dashboard/jobs/create">
              <Plus className="h-4 w-4" />
              Post a Job
            </Link>
          </Button>
          <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-700 border border-gray-300">
            {initial}
          </div>
        </div>
      </div>
    </header>
  );
}
