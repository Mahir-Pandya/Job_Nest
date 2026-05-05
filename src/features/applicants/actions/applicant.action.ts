"use server";

import { getCurrentUser } from "@/features/auth/server/auth.queries";
import {
  applicantSettingsSchema,
  ApplicantSettingsSchema,
} from "../applicant.schema";
import { db } from "@/config/db";
import { applicants, resumes, savedJobs, users } from "@/drizzle/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";


export const saveApplicantProfile = async (data: ApplicantSettingsSchema) => {
  try {
    const user = await getCurrentUser();
    if (!user) return { status: "ERROR", message: "Unauthorized" };

    const { data: validatedData, error } =
      applicantSettingsSchema.safeParse(data);

    if (error) {
      // Return the very first Zod validation error message
      return { status: "ERROR", message: error.issues[0].message };
    }

    const {
      name,
      phoneNumber,
      avatarUrl,
      location,
      dateOfBirth,
      nationality,
      gender,
      maritalStatus,
      education,
      experience,
      websiteUrl,
      biography,
      resumeUrl,
      resumeName,
      resumeSize,
    } = validatedData;

    await db.transaction(async (tx) => {
      // 1. UPDATE the users table (Always an update since the user must exist to be logged in)
      await tx
        .update(users)
        .set({
          name,
          phoneNumber,
          avatarUrl,
        })
        .where(eq(users.id, user.id));

      // 2. UPSERT APPLICANTS TABLE
      const existingApplicant = await tx
        .select()
        .from(applicants)
        .where(eq(applicants.id, user.id))
        .limit(1);

      const applicantData = {
        location,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        nationality,
        gender,
        maritalStatus,
        education,
        experience,
        websiteUrl,
        biography,
      };

      if (existingApplicant.length > 0) {
        // Record exists, UPDATE
        await tx
          .update(applicants)
          .set(applicantData)
          .where(eq(applicants.id, user.id));
      } else {
        // No record, INSERT
        await tx.insert(applicants).values({
          id: user.id, // Foreign key & Primary key
          ...applicantData,
        });
      }

      // 3. UPSERT RESUMES TABLE
      if (resumeName && resumeUrl) {
        const existingResume = await tx
          .select()
          .from(resumes)
          .where(eq(resumes.applicantId, user.id))
          .limit(1);

        const resumeData = {
          fileUrl: resumeUrl,
          fileName: resumeName,
          fileSize: resumeSize,
          isPrimary: true,
        };

        if (existingResume.length > 0) {
          // Update the specific resume ID that we found
          await tx
            .update(resumes)
            .set(resumeData)
            .where(eq(resumes.id, existingResume[0].id));
        } else {
          // Insert a new resume
          await tx.insert(resumes).values({
            applicantId: user.id,
            ...resumeData,
          });
        }
      }
    });

    // Refresh the page so the pre-filled data updates immediately
    revalidatePath("/dashboard/settings");

    return { status: "SUCCESS", message: "Profile saved successfully!" };
  } catch (error) {
    console.error("SAVE PROFILE ERROR:", error);
    return { status: "ERROR", message: "Failed to save Profile." };
  }
};

export const toggleSaveJobAction = async (jobId: number) => {
  try {
    const user = await getCurrentUser();
    if (!user) return { status: "ERROR", message: "Unauthorized" };

    const existingSave = await db
      .select()
      .from(savedJobs)
      .where(and(eq(savedJobs.userId, user.id), eq(savedJobs.jobId, jobId)))
      .limit(1);

    if (existingSave.length > 0) {
      await db.delete(savedJobs).where(eq(savedJobs.id, existingSave[0].id));
      revalidatePath(`/jobs/${jobId}`);
      revalidatePath("/dashboard/saved-jobs");
      return { status: "SUCCESS", message: "Job removed from saved list" };
    } else {
      await db.insert(savedJobs).values({
        userId: user.id,
        jobId,
      });
      revalidatePath(`/jobs/${jobId}`);
      revalidatePath("/dashboard/saved-jobs");
      return { status: "SUCCESS", message: "Job saved successfully" };
    }
  } catch (error) {
    console.error("TOGGLE SAVE JOB ERROR:", error);
    return { status: "ERROR", message: "Failed to update saved jobs" };
  }
};

