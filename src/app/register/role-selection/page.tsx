"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Briefcase } from "lucide-react";
import { completeGoogleSignupAction } from "@/features/auth/server/auth.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function RoleSelectionPage() {
  const [loading, setLoading] = useState<"applicant" | "employer" | null>(null);
  const router = useRouter();

  const handleRoleSelection = async (role: "applicant" | "employer") => {
    setLoading(role);
    try {
      const result = await completeGoogleSignupAction(role);
      if (result.status === "SUCCESS") {
        toast.success(result.message);
        if (result.role === "employer") router.push("/dashboard");
        else router.push("/dashboard");
      } else {
        toast.error(result.message);
        setLoading(null);
      }
    } catch (error) {
      toast.error("An error occurred during registration.");
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Choose Your Path</CardTitle>
          <CardDescription className="text-lg mt-2">
            You're almost done! Please select how you want to use JobNest.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          
          <Button 
            variant="outline" 
            className="h-48 flex flex-col items-center justify-center gap-4 hover:border-primary hover:bg-primary/5 transition-all"
            onClick={() => handleRoleSelection("applicant")}
            disabled={loading !== null}
          >
            <User className="w-12 h-12 text-primary" />
            <div className="text-center">
              <h3 className="font-semibold text-lg">Job Applicant</h3>
              <p className="text-xs text-muted-foreground mt-1 whitespace-normal">I want to find jobs and apply</p>
            </div>
            {loading === "applicant" && <span className="animate-pulse">Saving...</span>}
          </Button>

          <Button 
            variant="outline" 
            className="h-48 flex flex-col items-center justify-center gap-4 hover:border-primary hover:bg-primary/5 transition-all"
            onClick={() => handleRoleSelection("employer")}
            disabled={loading !== null}
          >
            <Briefcase className="w-12 h-12 text-primary" />
            <div className="text-center">
              <h3 className="font-semibold text-lg">Employer</h3>
              <p className="text-xs text-muted-foreground mt-1 whitespace-normal">I want to post jobs and hire</p>
            </div>
            {loading === "employer" && <span className="animate-pulse">Saving...</span>}
          </Button>

        </CardContent>
      </Card>
    </div>
  );
}
