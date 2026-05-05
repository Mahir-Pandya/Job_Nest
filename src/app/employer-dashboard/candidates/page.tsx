import { getCurrentUser } from "@/features/auth/server/auth.queries";
import { getSavedCandidates } from "@/features/server/employers.queries";
import { redirect } from "next/navigation";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { UserCircle, Users, MapPin, Mail, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SaveCandidateButton } from "@/features/employers/components/save-candidate-button";

export default async function CandidatesPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "employer") return redirect("/login");

  const savedCandidates = await getSavedCandidates(user.id);

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Saved Candidates</h2>
        <p className="text-gray-500 mt-1">
          Candidates you&apos;ve bookmarked for future reference. Save candidates from
          the{" "}
          <a
            href="/employer-dashboard/applications"
            className="text-orange-600 hover:text-orange-700 font-medium underline underline-offset-2"
          >
            Applications
          </a>{" "}
          page.
        </p>
      </div>

      {savedCandidates.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
          <div className="inline-flex items-center justify-center p-4 bg-gray-100 rounded-full mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            No saved candidates yet
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            When you bookmark candidates from the applications page, they will
            appear here for quick access.
          </p>
          <Button asChild className="mt-6 bg-orange-500 hover:bg-orange-600">
            <a href="/employer-dashboard/applications">Browse Applications</a>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedCandidates.map((candidate) => {
            const { savedCandidate, user: candidateUser, applicant } = candidate;

            return (
              <div
                key={savedCandidate.id}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all duration-200 group"
              >
                {/* Header Row */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 relative rounded-full overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                      {candidateUser.avatarUrl ? (
                        <Image
                          src={candidateUser.avatarUrl}
                          alt={candidateUser.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <UserCircle className="h-full w-full text-gray-400 p-0.5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">
                        {candidateUser.name}
                      </h3>
                      <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                        <Mail className="h-3 w-3 shrink-0" />
                        {candidateUser.email}
                      </p>
                    </div>
                  </div>
                  <SaveCandidateButton
                    applicantId={savedCandidate.applicantId}
                    initialIsSaved={true}
                  />
                </div>

                {/* Details */}
                <div className="space-y-2 text-xs text-gray-500">
                  {applicant?.location && (
                    <p className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-gray-400" />
                      {applicant.location}
                    </p>
                  )}
                  {applicant?.education && (
                    <p className="capitalize">
                      🎓 {applicant.education}
                    </p>
                  )}
                  {applicant?.experience && (
                    <p className="line-clamp-2">
                      💼 {applicant.experience}
                    </p>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] text-gray-400">
                    Saved{" "}
                    {formatDistanceToNow(new Date(savedCandidate.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
