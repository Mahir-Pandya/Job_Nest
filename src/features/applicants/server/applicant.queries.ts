import { db } from "@/config/db";
import { and, count, desc, eq } from "drizzle-orm";
import {
  applicants,
  users,
  resumes,
  jobApplications,
  jobs,
  employers,
  savedJobs,
  messages,
} from "@/drizzle/schema";

export async function getApplicantProfileData(userId: number) {
  const [combinedData] = await db
    .select({
      user: users,
      applicant: applicants,
      resume: resumes,
    })
    .from(users)
    .leftJoin(applicants, eq(users.id, applicants.id))
    .leftJoin(resumes, eq(applicants.id, resumes.applicantId))
    .where(eq(users.id, userId))
    .limit(1); // Object Based Projection

  // If no user is found, combinedData will be undefined
  if (!combinedData || !combinedData.user) return null;

  const { user, applicant, resume } = combinedData;

  return {
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber ?? "",
    avatarUrl: user.avatarUrl ?? "",
    location: applicant?.location ?? "",
    dateOfBirth: applicant?.dateOfBirth
      ? new Date(applicant.dateOfBirth).toISOString().split("T")[0]
      : "",
    nationality: applicant?.nationality ?? "",
    gender: applicant?.gender ?? undefined,
    maritalStatus: applicant?.maritalStatus ?? undefined,
    education: applicant?.education ?? undefined,
    experience: applicant?.experience ?? "",
    websiteUrl: applicant?.websiteUrl ?? "",
    biography: applicant?.biography ?? "",
    resumeUrl: resume?.fileUrl ?? "",
    resumeName: resume?.fileName ?? "",
    resumeSize: resume?.fileSize ?? undefined,
  };
}

export type ApplicantProfileType = NonNullable<
  Awaited<ReturnType<typeof getApplicantProfileData>>
>;

export async function getAppliedJobsForApplicant(userId: number) {
  const applications = await db
    .select({
      application: jobApplications,
      job: jobs,
      employer: employers,
    })
    .from(jobApplications)
    .innerJoin(jobs, eq(jobApplications.jobId, jobs.id))
    .leftJoin(employers, eq(jobs.employerId, employers.id))
    .where(eq(jobApplications.applicantId, userId))
    .orderBy(desc(jobApplications.appliedAt));

  return applications;
}

export async function getSavedJobsForApplicant(userId: number) {
  const saved = await db
    .select({
      id: savedJobs.id,
      job: jobs,
      employer: employers,
    })
    .from(savedJobs)
    .innerJoin(jobs, eq(savedJobs.jobId, jobs.id))
    .leftJoin(employers, eq(jobs.employerId, employers.id))
    .where(eq(savedJobs.userId, userId))
    .orderBy(desc(savedJobs.createdAt));

  return saved;
}

export async function getApplicantDashboardStats(userId: number) {
  const [appliedCountResult] = await db
    .select({ value: count() })
    .from(jobApplications)
    .where(eq(jobApplications.applicantId, userId));

  const [savedCountResult] = await db
    .select({ value: count() })
    .from(savedJobs)
    .where(eq(savedJobs.userId, userId));

  // Fetch all statuses to compute shortlisted/hired counts
  const allApplications = await db
    .select({ status: jobApplications.status })
    .from(jobApplications)
    .where(eq(jobApplications.applicantId, userId));

  const shortlistedCount = allApplications.filter(
    (a) => a.status === "shortlisted"
  ).length;

  const hiredCount = allApplications.filter(
    (a) => a.status === "hired"
  ).length;

  const [unreadCountResult] = await db
    .select({ value: count() })
    .from(messages)
    .where(and(eq(messages.receiverId, userId), eq(messages.isRead, false)));

  return {
    appliedCount: appliedCountResult?.value ?? 0,
    savedCount: savedCountResult?.value ?? 0,
    unreadMessagesCount: unreadCountResult?.value ?? 0,
    shortlistedCount,
    hiredCount,
  };
}

export type ApplicantDashboardStats = Awaited<
  ReturnType<typeof getApplicantDashboardStats>
>;
