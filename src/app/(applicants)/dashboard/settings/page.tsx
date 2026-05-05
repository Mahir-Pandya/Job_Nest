// "use client";

import ApplicantSettingsForm from "@/features/applicants/components/applicant-settings-form";
import { getApplicantProfileData } from "@/features/applicants/server/applicant.queries";
import { getCurrentUser } from "@/features/auth/server/auth.queries";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user) return redirect("/login");

  const initialData = await getApplicantProfileData(user.id);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-100 px-8 py-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage your profile, preferences, and account security.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-8 space-y-8">
        {/* Profile Settings */}
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-4">Profile Information</h2>
          <ApplicantSettingsForm initialData={initialData} />
        </div>

        {/* Security Section */}
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-4">Account Security</h2>
        </div>
      </div>
    </div>
  );
}
