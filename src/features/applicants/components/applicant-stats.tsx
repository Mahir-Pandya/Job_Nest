import { Briefcase, Bookmark, Star } from "lucide-react";
import { ApplicantDashboardStats } from "../server/applicant.queries";

interface ApplicantStatsProps {
  stats: ApplicantDashboardStats;
}

export function ApplicantStats({ stats }: ApplicantStatsProps) {
  const cards = [
    {
      label: "Applied Jobs",
      value: stats.appliedCount,
      icon: Briefcase,
      bg: "from-blue-500 to-blue-600",
      lightBg: "bg-blue-50",
      border: "border-blue-100",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      sub: "Total applications",
      subColor: "text-blue-600",
    },
    {
      label: "Saved Jobs",
      value: stats.savedCount,
      icon: Bookmark,
      bg: "from-violet-500 to-purple-600",
      lightBg: "bg-violet-50",
      border: "border-violet-100",
      iconBg: "bg-violet-100",
      iconColor: "text-violet-600",
      sub: "Jobs bookmarked",
      subColor: "text-violet-600",
    },
    {
      label: "Shortlisted",
      value: stats.shortlistedCount,
      icon: Star,
      bg: "from-emerald-500 to-green-600",
      lightBg: "bg-emerald-50",
      border: "border-emerald-100",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      sub: stats.hiredCount > 0 ? `${stats.hiredCount} hired 🎉` : "Keep applying!",
      subColor: stats.hiredCount > 0 ? "text-emerald-600" : "text-gray-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`relative overflow-hidden rounded-2xl border ${card.border} ${card.lightBg} p-6 shadow-sm hover:shadow-md transition-all duration-300 group`}
          >
            {/* Decorative gradient blob */}
            <div
              className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${card.bg} opacity-10 group-hover:opacity-20 transition-opacity`}
            />

            <div className="flex items-center justify-between relative">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{card.label}</p>
                <p className="text-4xl font-bold text-gray-900 tracking-tight">
                  {card.value}
                </p>
                <p className={`text-xs font-medium mt-2 ${card.subColor}`}>
                  {card.sub}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${card.iconBg} shadow-sm`}>
                <Icon className={`h-6 w-6 ${card.iconColor}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
