import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/server/auth.queries";
import ApplicantSettingsForm from "@/features/applicants/components/applicant-settings-form";
import { getApplicantProfileData } from "@/features/applicants/server/applicant.queries";
import EmployerSettingsForm from "@/features/employers/components/employer-setting-form";
import { EmployerProfileData } from "@/features/employers/employers.schema";
import { getCurrentEmployerDetails } from "@/features/server/employers.queries";

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user) return redirect("/login");

  if (user.role === "employer") {
    const employer = await getCurrentEmployerDetails();
    if (!employer) return redirect("/login");

    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Company Settings</h1>
          <p className="text-gray-500 mt-1">Manage your company profile and preferences.</p>
        </div>
        <EmployerSettingsForm
          initialData={
            {
              name: employer.employerDetails.name,
              description: employer.employerDetails.description,
              organizationType: employer.employerDetails.organizationType,
              teamSize: employer.employerDetails.teamSize,
              location: employer.employerDetails.location,
              websiteUrl: employer.employerDetails.websiteUrl,
              yearOfEstablishment:
                employer.employerDetails.yearOfEstablishment?.toString(),
              avatarUrl: employer.avatarUrl,
              bannerImageUrl: employer.employerDetails.bannerImageUrl,
            } as EmployerProfileData
          }
        />
      </div>
    );
  }

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
