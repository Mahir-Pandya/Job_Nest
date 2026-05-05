import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, ClipboardList, Users } from "lucide-react";

interface StatsCardsProps {
  stats: {
    activeJobs: number;
    totalApplicants: number;
    shortlisted: number;
    expiringJobs: number;
    newThisWeek: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {/* Total Active Jobs */}
      <Card className="bg-white border-gray-200 hover:shadow-md transition-shadow duration-300 py-0">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">
                Total Active Jobs
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.activeJobs}
              </p>
              <p className="text-xs text-orange-600 font-medium mt-1">
                {stats.expiringJobs > 0
                  ? `${stats.expiringJobs} job${stats.expiringJobs > 1 ? "s" : ""} expires soon`
                  : "All jobs active"}
              </p>
            </div>
            <div className="p-2.5 bg-orange-50 rounded-lg">
              <Briefcase className="h-5 w-5 text-orange-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Applicants */}
      <Card className="bg-white border-gray-200 hover:shadow-md transition-shadow duration-300 py-0">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">
                Total Applicants
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.totalApplicants}
              </p>
              <p className="text-xs text-blue-600 font-medium mt-1">
                {stats.newThisWeek > 0
                  ? `↑ ${stats.newThisWeek} new this week`
                  : "No new applicants this week"}
              </p>
            </div>
            <div className="p-2.5 bg-blue-50 rounded-lg">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shortlisted */}
      <Card className="bg-white border-gray-200 hover:shadow-md transition-shadow duration-300 py-0">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Shortlisted</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.shortlisted}
              </p>
              <p className="text-xs text-gray-400 font-medium mt-1">
                Awaiting interviews
              </p>
            </div>
            <div className="p-2.5 bg-emerald-50 rounded-lg">
              <ClipboardList className="h-5 w-5 text-emerald-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
