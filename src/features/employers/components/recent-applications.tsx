import { formatDistanceToNow } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Inbox } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface RecentApplication {
  application: {
    id: number;
    status: string;
    appliedAt: Date;
  };
  job: {
    title: string;
  };
  user: {
    name: string;
    email: string;
    avatarUrl: string | null;
  };
}

interface RecentApplicationsProps {
  applications: RecentApplication[];
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  reviewed: "bg-blue-100 text-blue-700",
  shortlisted: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
  hired: "bg-purple-100 text-purple-700",
};

export function RecentApplications({
  applications,
}: RecentApplicationsProps) {
  return (
    <Card className="bg-white border-gray-200 py-0">
      <CardContent className="p-5">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-gray-900">
            Recent Applications
          </h3>
          <p className="text-sm text-gray-500">
            Candidates who recently applied to your jobs.
          </p>
        </div>

        {applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="p-3 bg-gray-100 rounded-full mb-3">
              <Inbox className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-400">
              No recent applications to show.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <div
                key={app.application.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-150"
              >
                {/* Avatar */}
                <div className="h-9 w-9 rounded-full overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                  {app.user.avatarUrl ? (
                    <Image
                      src={app.user.avatarUrl}
                      alt={app.user.name}
                      width={36}
                      height={36}
                      className="object-cover h-full w-full"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-xs font-bold text-gray-500 bg-gray-200">
                      {app.user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {app.user.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    Applied for{" "}
                    <span className="font-medium text-gray-700">
                      {app.job.title}
                    </span>
                  </p>
                </div>

                {/* Meta */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <Badge
                    variant="secondary"
                    className={`text-[10px] font-medium px-2 py-0.5 capitalize ${statusColors[app.application.status] || ""}`}
                  >
                    {app.application.status}
                  </Badge>
                  <span className="text-[10px] text-gray-400">
                    {formatDistanceToNow(new Date(app.application.appliedAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            ))}

            {/* View All Link */}
            <Link
              href="/employer-dashboard/applications"
              className="block text-center text-sm text-orange-600 hover:text-orange-700 font-medium pt-2 transition-colors"
            >
              View all applications →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
