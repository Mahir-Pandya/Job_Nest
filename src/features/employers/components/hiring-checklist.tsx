import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle } from "lucide-react";
import Link from "next/link";

interface HiringChecklistProps {
  isProfileCompleted: boolean;
  pendingCount: number;
}

export function HiringChecklist({
  isProfileCompleted,
  pendingCount,
}: HiringChecklistProps) {
  const items = [
    {
      title: "Complete company profile",
      description: "Add details about your workplace culture.",
      completed: isProfileCompleted,
      action: {
        label: "Update",
        href: "/dashboard/settings",
      },
    },
    {
      title: "Review applicants",
      description:
        pendingCount > 0
          ? `You have ${pendingCount} unchecked applicant${pendingCount > 1 ? "s" : ""}.`
          : "All applicants have been reviewed.",
      completed: pendingCount === 0,
      action: {
        label: "Review",
        href: "/dashboard/applications",
      },
    },
  ];

  return (
    <Card className="bg-white border-gray-200 py-0">
      <CardContent className="p-5">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-gray-900">
            Hiring Checklist
          </h3>
          <p className="text-sm text-gray-500">
            Steps to improve your hiring pipeline.
          </p>
        </div>

        <div className="space-y-1">
          {items.map((item) => (
            <div
              key={item.title}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-150"
            >
              {/* Check icon */}
              {item.completed ? (
                <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-gray-300 shrink-0" />
              )}

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">
                  {item.title}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {item.description}
                </p>
              </div>

              {/* Action Button */}
              <Button
                asChild
                variant="outline"
                size="sm"
                className="shrink-0 rounded-lg border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 text-xs px-4"
              >
                <Link href={item.action.href}>{item.action.label}</Link>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
