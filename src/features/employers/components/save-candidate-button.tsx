"use client";

import { useState, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleSaveCandidateAction } from "@/features/server/employer.action";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SaveCandidateButtonProps {
  applicantId: number;
  initialIsSaved: boolean;
}

export function SaveCandidateButton({
  applicantId,
  initialIsSaved,
}: SaveCandidateButtonProps) {
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const previousState = isSaved;
    setIsSaved(!previousState);

    startTransition(async () => {
      const result = await toggleSaveCandidateAction(applicantId);
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
      variant="ghost"
      size="icon"
      className={cn(
        "transition-all duration-300",
        isSaved
          ? "text-orange-500 hover:text-orange-600 hover:bg-orange-50"
          : "text-gray-400 hover:text-orange-500 hover:bg-orange-50"
      )}
      onClick={handleToggle}
      disabled={isPending}
      title={isSaved ? "Remove from saved" : "Save candidate"}
    >
      <Bookmark
        className={cn("w-4 h-4", isSaved ? "fill-orange-500" : "fill-none")}
      />
    </Button>
  );
}
