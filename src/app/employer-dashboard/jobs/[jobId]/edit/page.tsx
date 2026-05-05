import { JobForm } from "@/features/employers/components/employer-job-form";
import { getJobByIdAction } from "@/features/server/jobs.actions";
import { redirect } from "next/navigation";

interface EditJobPageProps {
  params: Promise<{ jobId: string }>;
}

export const EditJobPage = async ({ params }: EditJobPageProps) => {
  const { jobId: rawJobId } = await params;
  const jobId = Number(rawJobId);

  // if (Number.isNaN(jobId)) {
  //   throw new Error("Invalid job ID");
  // } ❌

  if (Number.isNaN(jobId)) redirect("/employer-dashboard/jobs");

  // 1. Fetch Data
  const { status, data: job } = await getJobByIdAction(jobId);
  console.log("Job Data after ID: ", job);

  // 2. Handle Errors (e.g., user manually types a random ID)
  if (status === "ERROR" || !job) {
    redirect("/employer-dashboard/jobs");
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Edit Job: {job.title}</h1>
      </div>

      {/* 3. Pass the fetched data to the form */}
      <JobForm initialData={job} isEditMode={true} />
    </div>
  );
};

export default EditJobPage;
