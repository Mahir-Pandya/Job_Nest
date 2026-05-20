"use server";

import { db } from "@/config/db";
import { getCurrentUser } from "../auth/server/auth.queries";
import { employers, jobApplications, jobs, savedCandidates, users } from "@/drizzle/schema";
import { and, eq } from "drizzle-orm";
import { EmployerProfileData } from "../employers/employers.schema";
import { APPLICATION_STATUS } from "@/config/constant";
import { revalidatePath } from "next/cache";


// const organizationTypeOptions = [
//   "development",
//   "business",
//   "design",
//   "android dev",
//   "cloud business",
// ] as const;
// type OrganizationType = (typeof organizationTypeOptions)[number];

// const teamSizeOptions = ["1-5", "6-20", "21-50"] as const;
// type TeamSize = (typeof teamSizeOptions)[number];

// interface IFormInput {
//   name: string;
//   description: string;
//   yearOfEstablishment: string;
//   location: string;
//   websiteUrl: string;
//   organizationType: OrganizationType;
//   teamSize: TeamSize;
// }

export const updateEmployerProfileAction = async (
  data: EmployerProfileData
) => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "employer") {
      return { status: "ERROR", message: "Unauthorized" };
    }

    const {
      name,
      description,
      yearOfEstablishment,
      location,
      websiteUrl,
      organizationType,
      teamSize,
      avatarUrl,
      bannerImageUrl,
    } = data;

    const updatedEmployer = await db
      .update(employers)
      .set({
        name,
        description,
        location,
        websiteUrl,
        organizationType,
        teamSize,
        bannerImageUrl,
        yearOfEstablishment: yearOfEstablishment
          ? parseInt(yearOfEstablishment)
          : null,
      })
      .where(eq(employers.id, currentUser.id));

    console.log("employers ", updatedEmployer);

    await db
      .update(users)
      .set({
        avatarUrl,
      })
      .where(eq(users.id, currentUser.id));

    return { status: "SUCCESS", message: "Profile updated successfully" };
  } catch (error) {
    return {
      status: "ERROR",
      message: "Something went wrong, please try again",
    };
  }
};

export const updateApplicationStatusAction = async (
  applicationId: number,
  status: (typeof APPLICATION_STATUS)[number]
) => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "employer") {
      return { status: "ERROR", message: "Unauthorized" };
    }

    // Security check: ensure the application belongs to a job posted by this employer
    const [application] = await db
      .select({ id: jobApplications.id })
      .from(jobApplications)
      .innerJoin(jobs, eq(jobApplications.jobId, jobs.id))
      .where(
        and(
          eq(jobApplications.id, applicationId),
          eq(jobs.employerId, currentUser.id)
        )
      );

    if (!application) {
      return { status: "ERROR", message: "Application not found" };
    }

    await db
      .update(jobApplications)
      .set({ status })
      .where(eq(jobApplications.id, applicationId));

    revalidatePath("/dashboard/applications");

    return { status: "SUCCESS", message: "Status updated successfully" };
  } catch (error) {
    return { status: "ERROR", message: "Failed to update status" };
  }
};

export const toggleSaveCandidateAction = async (applicantId: number) => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "employer") {
      return { status: "ERROR", message: "Unauthorized" };
    }

    const existing = await db
      .select()
      .from(savedCandidates)
      .where(
        and(
          eq(savedCandidates.employerId, currentUser.id),
          eq(savedCandidates.applicantId, applicantId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      await db
        .delete(savedCandidates)
        .where(eq(savedCandidates.id, existing[0].id));
      revalidatePath("/dashboard/candidates");
      revalidatePath("/dashboard/applications");
      return { status: "SUCCESS", message: "Candidate removed from saved list" };
    } else {
      await db.insert(savedCandidates).values({
        employerId: currentUser.id,
        applicantId,
      });
      revalidatePath("/dashboard/candidates");
      revalidatePath("/dashboard/applications");
      return { status: "SUCCESS", message: "Candidate saved successfully" };
    }
  } catch (error) {
    return { status: "ERROR", message: "Failed to update saved candidates" };
  }
};

