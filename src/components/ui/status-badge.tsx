"use client";

import { Badge } from "@/components/ui/badge";
import { APPLICATION_STATUS } from "@/config/constant";

const statusColors: Record<(typeof APPLICATION_STATUS)[number], string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  reviewed: "bg-blue-100 text-blue-800 border-blue-200",
  shortlisted: "bg-purple-100 text-purple-800 border-purple-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  hired: "bg-green-100 text-green-800 border-green-200",
};

export function StatusBadge({
  status,
}: {
  status: (typeof APPLICATION_STATUS)[number];
}) {
  return (
    <Badge
      variant="outline"
      className={`capitalize font-medium shadow-sm ${
        statusColors[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {status}
    </Badge>
  );
}
