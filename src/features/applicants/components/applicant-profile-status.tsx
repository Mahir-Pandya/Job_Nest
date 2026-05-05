import Link from "next/link";
import { ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/features/auth/server/auth.queries";
import { redirect } from "next/navigation";
import { getApplicantProfileData } from "../server/applicant.queries";

export async function ApplicantProfileStatus() {
  const user = await getCurrentUser();
  if (!user) return redirect("/login");

  const profileData = await getApplicantProfileData(user.id);

  const isCompleted = !!(
    profileData?.location &&
    profileData?.biography &&
    profileData?.experience &&
    profileData?.resumeUrl
  );

  if (isCompleted) {
    return null;
  }

  // What's missing
  const missing = [];
  if (!profileData?.location) missing.push("location");
  if (!profileData?.biography) missing.push("bio");
  if (!profileData?.experience) missing.push("experience");
  if (!profileData?.resumeUrl) missing.push("resume");

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white shadow-lg">
      {/* Decorative */}
      <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/10" />
      <div className="absolute right-24 -bottom-8 h-24 w-24 rounded-full bg-white/10" />

      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <AlertCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Complete your profile to get better matches
            </h3>
            <p className="text-amber-100 text-sm mt-1">
              Missing:{" "}
              <span className="font-semibold text-white">
                {missing.join(", ")}
              </span>{" "}
              — A complete profile gets 3× more views.
            </p>
          </div>
        </div>

        <Link href="/dashboard/settings" className="flex-shrink-0">
          <Button
            variant="secondary"
            className="whitespace-nowrap bg-white text-orange-600 hover:bg-orange-50 font-semibold shadow-md gap-2"
          >
            Complete Profile
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
