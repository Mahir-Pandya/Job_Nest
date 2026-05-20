"use client";

import { useEffect, useState } from "react";
import { EmployerJobCard } from "./employer-job-card";
import {
  deleteJobAction,
  getEmployerJobsAction,
} from "@/features/server/jobs.actions";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Job } from "../jobs/types/job.types";
import { useRouter } from "next/navigation";

export const EmployerJobList = () => {
  const [jobs, setJobs] = useState<Job[]>([]); //useState<Job[]> is a generic that explicitly defines the state type because TypeScript cannot infer the type from an empty array.
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    async function fetchJobs() {
      setIsLoading(true);
      try {
        const res = await getEmployerJobsAction();

        if (res.status === "SUCCESS" && res.data) {
          setJobs(res.data);
        } else {
          toast.error(res.message || "Failed to load jobs");
        }
      } catch (error) {
        toast.error("Something went wrong");
      } finally {
        setIsLoading(false);
      }
    }

    fetchJobs();
  }, []);

  const handleDelete = async (jobId: number) => {
    try {
      const res = await deleteJobAction(jobId);
      if (res.status === "SUCCESS") {
        setJobs((prevJobs) => prevJobs.filter((job) => job.id !== jobId));
        toast.success("Job deleted successfully");
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    }
  };

  const handleEdit = async (jobId: number) => {
    router.push(`/dashboard/jobs/${jobId}/edit`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No jobs posted yet</p>
      </div>
    );
  }

  return (
    <section className="grid lg:grid-cols-3 md:grid-cols-2 gap-4">
      {jobs.map((job) => (
        <EmployerJobCard
          key={job.id}
          job={job}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      ))}
    </section>
  );
};
