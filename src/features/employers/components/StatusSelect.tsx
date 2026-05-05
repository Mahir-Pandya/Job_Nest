"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { APPLICATION_STATUS } from "@/config/constant";
import { updateApplicationStatusAction } from "@/features/server/employer.action";
import { Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";

interface StatusSelectProps {
  applicationId: number;
  currentStatus: (typeof APPLICATION_STATUS)[number];
}

export function StatusSelect({
  applicationId,
  currentStatus,
}: StatusSelectProps) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (value: string) => {
    startTransition(async () => {
      const result = await updateApplicationStatusAction(
        applicationId,
        value as (typeof APPLICATION_STATUS)[number]
      );

      if (result.status === "SUCCESS") {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        defaultValue={currentStatus}
        onValueChange={handleStatusChange}
        disabled={isPending}
      >
        <SelectTrigger className="w-[130px] h-8 text-xs">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {APPLICATION_STATUS.map((status) => (
            <SelectItem key={status} value={status} className="capitalize text-xs">
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isPending && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
    </div>
  );
}

