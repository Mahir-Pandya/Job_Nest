import { getCurrentEmployerDetails } from "@/features/server/employers.queries";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Pencil,
  Globe,
  MapPin,
  Users,
  Calendar,
  Building2,
} from "lucide-react";

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      <Icon className="h-4 w-4 text-gray-400 shrink-0" />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}

export default async function CompanyProfilePage() {
  const employer = await getCurrentEmployerDetails();
  if (!employer) return redirect("/login");

  const profile = employer.employerDetails;

  return (
    <div className="max-w-4xl space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Company Profile</h2>
          <p className="text-gray-500 mt-1">
            Manage your company information and branding.
          </p>
        </div>
        <Button
          asChild
          className="bg-orange-500 hover:bg-orange-600 text-white gap-2 rounded-lg"
        >
          <Link href="/employer-dashboard/settings">
            <Pencil className="h-4 w-4" />
            Edit Profile
          </Link>
        </Button>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Banner */}
        {profile.bannerImageUrl && (
          <div className="h-40 relative bg-gradient-to-r from-orange-100 to-amber-50">
            <Image
              src={profile.bannerImageUrl}
              alt="Company banner"
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Avatar & Name */}
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-200 border-2 border-white shadow-sm shrink-0">
              {employer.avatarUrl ? (
                <Image
                  src={employer.avatarUrl}
                  alt="Company"
                  width={64}
                  height={64}
                  className="object-cover h-full w-full"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {profile.name || "Company Name"}
              </h3>
              <p className="text-sm text-gray-500 capitalize">
                {profile.organizationType || "Not specified"}
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {profile.location && (
              <InfoItem
                icon={MapPin}
                label="Location"
                value={profile.location}
              />
            )}
            {profile.teamSize && (
              <InfoItem
                icon={Users}
                label="Team Size"
                value={`${profile.teamSize} employees`}
              />
            )}
            {profile.yearOfEstablishment && (
              <InfoItem
                icon={Calendar}
                label="Established"
                value={profile.yearOfEstablishment.toString()}
              />
            )}
            {profile.websiteUrl && (
              <InfoItem
                icon={Globe}
                label="Website"
                value={profile.websiteUrl}
              />
            )}
          </div>

          {/* Description */}
          {profile.description && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">About</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                {profile.description}
              </p>
            </div>
          )}

          {/* Empty State */}
          {!profile.name && !profile.description && (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Profile not set up yet
              </h3>
              <p className="text-gray-500 mb-4">
                Add your company details to attract top talent.
              </p>
              <Button
                asChild
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Link href="/employer-dashboard/settings">
                  Complete Profile
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
