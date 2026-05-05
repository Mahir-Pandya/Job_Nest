import { getCurrentUser } from "../auth/server/auth.queries";
import {
  applicants,
  employers,
  jobApplications,
  jobs,
  messages as messagesTable,
  resumes,
  savedCandidates,
  users,
} from "../../drizzle/schema";
import { db } from "@/config/db";
import { and, desc, eq, gte, isNull, sql } from "drizzle-orm";

export const getCurrentEmployerDetails = async () => {
  const currentUser = await getCurrentUser();

  if (!currentUser) return null;

  if (currentUser.role !== "employer") return null;

  const [employer] = await db
    .select()
    .from(employers)
    .where(eq(employers.id, currentUser.id));

  const isProfileCompleted =
    employer.name &&
    employer.description &&
    currentUser.avatarUrl &&
    employer.organizationType &&
    employer.yearOfEstablishment;

  return { ...currentUser, employerDetails: employer, isProfileCompleted };
};

export async function getEmployerApplications(employerId: number) {
  const applications = await db
    .select({
      application: jobApplications,
      job: jobs,
      user: users,
      applicant: applicants,
      resume: resumes,
    })
    .from(jobApplications)
    .innerJoin(jobs, eq(jobApplications.jobId, jobs.id))
    .innerJoin(users, eq(jobApplications.applicantId, users.id))
    .leftJoin(applicants, eq(jobApplications.applicantId, applicants.id))
    .leftJoin(resumes, eq(jobApplications.resumeId, resumes.id))
    .where(eq(jobs.employerId, employerId))
    .orderBy(desc(jobApplications.appliedAt));

  return applications;
}

/**
 * Get all dashboard stats for the employer overview page
 */
export async function getEmployerDashboardStats(employerId: number) {
  // Count active jobs (not deleted)
  const [activeJobsResult] = await db
    .select({ value: sql<number>`count(*)` })
    .from(jobs)
    .where(
      and(eq(jobs.employerId, employerId), isNull(jobs.deletedAt))
    );

  // Count total applicants across all employer's jobs
  const [totalApplicantsResult] = await db
    .select({ value: sql<number>`count(*)` })
    .from(jobApplications)
    .innerJoin(jobs, eq(jobApplications.jobId, jobs.id))
    .where(eq(jobs.employerId, employerId));

  // Count shortlisted applicants
  const [shortlistedResult] = await db
    .select({ value: sql<number>`count(*)` })
    .from(jobApplications)
    .innerJoin(jobs, eq(jobApplications.jobId, jobs.id))
    .where(
      and(
        eq(jobs.employerId, employerId),
        eq(jobApplications.status, "shortlisted")
      )
    );

  // Count pending/unchecked applicants
  const [pendingResult] = await db
    .select({ value: sql<number>`count(*)` })
    .from(jobApplications)
    .innerJoin(jobs, eq(jobApplications.jobId, jobs.id))
    .where(
      and(
        eq(jobs.employerId, employerId),
        eq(jobApplications.status, "pending")
      )
    );

  // New applicants this week
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [newThisWeekResult] = await db
    .select({ value: sql<number>`count(*)` })
    .from(jobApplications)
    .innerJoin(jobs, eq(jobApplications.jobId, jobs.id))
    .where(
      and(
        eq(jobs.employerId, employerId),
        gte(jobApplications.appliedAt, oneWeekAgo)
      )
    );

  // Jobs expiring soon (within 7 days)
  const now = new Date();
  const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const [expiringResult] = await db
    .select({ value: sql<number>`count(*)` })
    .from(jobs)
    .where(
      and(
        eq(jobs.employerId, employerId),
        isNull(jobs.deletedAt),
        gte(jobs.expiresAt, now),
        sql`${jobs.expiresAt} <= ${oneWeekFromNow}`
      )
    );

  // Recent applications (last 5)
  const recentApplications = await db
    .select({
      application: jobApplications,
      job: jobs,
      user: users,
      applicant: applicants,
    })
    .from(jobApplications)
    .innerJoin(jobs, eq(jobApplications.jobId, jobs.id))
    .innerJoin(users, eq(jobApplications.applicantId, users.id))
    .leftJoin(applicants, eq(jobApplications.applicantId, applicants.id))
    .where(eq(jobs.employerId, employerId))
    .orderBy(desc(jobApplications.appliedAt))
    .limit(5);

  const [unreadCountResult] = await db
    .select({ value: sql<number>`count(*)` })
    .from(messagesTable)
    .where(and(eq(messagesTable.receiverId, employerId), eq(messagesTable.isRead, false)));

  return {
    activeJobs: activeJobsResult.value ?? 0,
    totalApplicants: totalApplicantsResult.value ?? 0,
    shortlisted: shortlistedResult.value ?? 0,
    pendingCount: pendingResult.value ?? 0,
    newThisWeek: newThisWeekResult.value ?? 0,
    expiringJobs: expiringResult.value ?? 0,
    unreadMessagesCount: unreadCountResult.value ?? 0,
    recentApplications,
  };
}

/**
 * Get saved candidates for the employer
 */
export async function getSavedCandidates(employerId: number) {
  const candidates = await db
    .select({
      savedCandidate: savedCandidates,
      user: users,
      applicant: applicants,
    })
    .from(savedCandidates)
    .innerJoin(users, eq(savedCandidates.applicantId, users.id))
    .leftJoin(applicants, eq(savedCandidates.applicantId, applicants.id))
    .where(eq(savedCandidates.employerId, employerId))
    .orderBy(desc(savedCandidates.createdAt));

  return candidates;
}

/**
 * Get a Set of saved candidate IDs for the employer (for quick lookup)
 */
export async function getSavedCandidateIds(
  employerId: number
): Promise<Set<number>> {
  const saved = await db
    .select({ applicantId: savedCandidates.applicantId })
    .from(savedCandidates)
    .where(eq(savedCandidates.employerId, employerId));

  return new Set(saved.map((s) => s.applicantId));
}

/**
 * Get a specific employer by their ID (User ID)
 */
export async function getEmployerById(id: number) {
  const [employer] = await db
    .select({
      employer: employers,
      user: users,
    })
    .from(employers)
    .innerJoin(users, eq(employers.id, users.id))
    .where(eq(employers.id, id));

  if (!employer) return null;

  // Get active jobs for this employer
  const activeJobs = await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.employerId, id), isNull(jobs.deletedAt)))
    .orderBy(desc(jobs.createdAt));

  return { ...employer, activeJobs };
}

/**
 * Get all employers for the companies listing page
 */
export async function getAllEmployers() {
  const allEmployers = await db
    .select({
      employer: employers,
      user: users,
    })
    .from(employers)
    .innerJoin(users, eq(employers.id, users.id))
    .where(isNull(employers.deletedAt));

  // For each employer, count their active jobs
  const employersWithJobCount = await Promise.all(
    allEmployers.map(async (emp) => {
      const [countResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(jobs)
        .where(and(eq(jobs.employerId, emp.employer.id), isNull(jobs.deletedAt)));

      return {
        ...emp,
        jobCount: countResult.count ?? 0,
      };
    })
  );

  return employersWithJobCount;
}
