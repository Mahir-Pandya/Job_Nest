"use client";

import { useState, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleSaveJobAction } from "@/features/applicants/actions/applicant.action";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SaveJobButtonProps {
  jobId: number;
  initialIsSaved: boolean;
}

export function SaveJobButton({ jobId, initialIsSaved }: SaveJobButtonProps) {
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    // Optimistic UI update
    const previousState = isSaved;
    setIsSaved(!previousState);

    startTransition(async () => {
      const result = await toggleSaveJobAction(jobId);
      if (result.status === "ERROR") {
        setIsSaved(previousState);
        toast.error(result.message);
      } else {
        toast.success(result.message);
      }
    });
  };

  return (
    <Button
      variant="outline"
      size="lg"
      className={cn(
        "gap-2 font-semibold transition-all duration-300",
        isSaved ? "bg-blue-50 text-blue-600 border-blue-200" : "text-gray-600 hover:text-blue-600"
      )}
      onClick={handleToggle}
      disabled={isPending}
    >
      <Bookmark
        className={cn("w-5 h-5", isSaved ? "fill-blue-600" : "fill-none")}
      />
      {isSaved ? "Saved" : "Save Job"}
    </Button>
  );
}
