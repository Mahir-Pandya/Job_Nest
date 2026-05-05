import { Button } from "@/components/ui/button";
import { getCurrentEmployerDetails } from "@/features/server/employers.queries";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export async function EmployerProfileCompletionStatus() {
  const currentEmployer = await getCurrentEmployerDetails();

  if (!currentEmployer) return redirect("/login");

  if (currentEmployer.isProfileCompleted) return null;

  return (
    <div className="rounded-xl border border-orange-200 bg-orange-50/60 p-5 flex items-center gap-5 flex-wrap md:flex-nowrap">
      <div className="p-2.5 bg-orange-100 rounded-full shrink-0">
        <AlertCircle className="h-5 w-5 text-orange-500" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-orange-700 uppercase tracking-wide">
          Profile Incomplete
        </h3>
        <p className="text-sm text-orange-600/80 mt-0.5 leading-relaxed">
          Your company profile is missing vital information. Complete it now to
          build trust with candidates and increase your application rate by up to
          40%.
        </p>
      </div>
      <Button
        asChild
        className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-5 shadow-sm shrink-0"
      >
        <Link href="/employer-dashboard/settings">Complete Profile</Link>
      </Button>
    </div>
  );
}
