/**
 * Unit Tests: Applicant Settings Schema
 * File: src/features/applicants/applicant.schema.ts
 *
 * Tests all Zod validation rules for the applicant profile settings form.
 * No DB or mocking required — pure function tests.
 */
import { describe, it, expect } from "vitest";
import { applicantSettingsSchema } from "@/features/applicants/applicant.schema";

const validData = {
  name: "Alice Johnson",
  email: "alice@example.com",
  phoneNumber: "1234567890",
  location: "New York",
  dateOfBirth: "1995-06-15",
  nationality: "American",
  gender: "female" as const,
  maritalStatus: "single" as const,
  education: "undergraduate" as const,
  experience: "3 years in software development",
  websiteUrl: "",
  biography: "A passionate developer.",
  avatarUrl: "https://example.com/avatar.jpg",
  resumeUrl: "",
  resumeName: "",
};

describe("applicantSettingsSchema", () => {
  it("accepts valid complete applicant data", () => {
    expect(applicantSettingsSchema.safeParse(validData).success).toBe(true);
  });

  // ── name ─────────────────────────────────────────────────────────────────────
  it("rejects name shorter than 2 characters", () => {
    const result = applicantSettingsSchema.safeParse({ ...validData, name: "A" });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues[0].message).toMatch(/2/);
  });

  // ── email ─────────────────────────────────────────────────────────────────────
  it("rejects invalid email", () => {
    const result = applicantSettingsSchema.safeParse({
      ...validData,
      email: "not-valid",
    });
    expect(result.success).toBe(false);
  });

  // ── phoneNumber ───────────────────────────────────────────────────────────────
  it("rejects phone number shorter than 10 digits", () => {
    const result = applicantSettingsSchema.safeParse({
      ...validData,
      phoneNumber: "123",
    });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues[0].message).toMatch(/10/);
  });

  // ── dateOfBirth ───────────────────────────────────────────────────────────────
  it("rejects an invalid date string", () => {
    const result = applicantSettingsSchema.safeParse({
      ...validData,
      dateOfBirth: "not-a-date",
    });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues[0].message).toMatch(/date/i);
  });

  it("accepts a valid ISO date string", () => {
    const result = applicantSettingsSchema.safeParse({
      ...validData,
      dateOfBirth: "2000-01-01",
    });
    expect(result.success).toBe(true);
  });

  // ── gender ────────────────────────────────────────────────────────────────────
  it("rejects invalid gender value", () => {
    const result = applicantSettingsSchema.safeParse({
      ...validData,
      gender: "alien" as any,
    });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues[0].message).toMatch(/gender/i);
  });

  it("accepts all valid gender values", () => {
    for (const g of ["male", "female", "other"] as const) {
      expect(
        applicantSettingsSchema.safeParse({ ...validData, gender: g }).success
      ).toBe(true);
    }
  });

  // ── maritalStatus ─────────────────────────────────────────────────────────────
  it("rejects invalid maritalStatus value", () => {
    const result = applicantSettingsSchema.safeParse({
      ...validData,
      maritalStatus: "widowed" as any,
    });
    expect(result.success).toBe(false);
  });

  it("accepts all valid marital status values", () => {
    for (const s of ["single", "married", "divorced"] as const) {
      expect(
        applicantSettingsSchema.safeParse({ ...validData, maritalStatus: s }).success
      ).toBe(true);
    }
  });

  // ── education ─────────────────────────────────────────────────────────────────
  it("rejects invalid education value", () => {
    const result = applicantSettingsSchema.safeParse({
      ...validData,
      education: "kindergarten" as any,
    });
    expect(result.success).toBe(false);
  });

  it("accepts all valid education values", () => {
    for (const e of ["none", "high school", "undergraduate", "masters", "phd"] as const) {
      expect(
        applicantSettingsSchema.safeParse({ ...validData, education: e }).success
      ).toBe(true);
    }
  });

  // ── websiteUrl ────────────────────────────────────────────────────────────────
  it("accepts an empty string for optional websiteUrl", () => {
    expect(
      applicantSettingsSchema.safeParse({ ...validData, websiteUrl: "" }).success
    ).toBe(true);
  });

  it("accepts a valid URL for websiteUrl", () => {
    expect(
      applicantSettingsSchema.safeParse({
        ...validData,
        websiteUrl: "https://alice.dev",
      }).success
    ).toBe(true);
  });

  it("rejects an invalid URL for websiteUrl", () => {
    const result = applicantSettingsSchema.safeParse({
      ...validData,
      websiteUrl: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  // ── biography ─────────────────────────────────────────────────────────────────
  it("rejects biography longer than 500 characters", () => {
    const result = applicantSettingsSchema.safeParse({
      ...validData,
      biography: "A".repeat(501),
    });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues[0].message).toMatch(/500/);
  });

  it("accepts biography of exactly 500 characters", () => {
    expect(
      applicantSettingsSchema.safeParse({
        ...validData,
        biography: "A".repeat(500),
      }).success
    ).toBe(true);
  });

  // ── resumeUrl ─────────────────────────────────────────────────────────────────
  it("accepts empty string for optional resumeUrl", () => {
    expect(
      applicantSettingsSchema.safeParse({ ...validData, resumeUrl: "" }).success
    ).toBe(true);
  });

  it("accepts a valid URL for resumeUrl", () => {
    expect(
      applicantSettingsSchema.safeParse({
        ...validData,
        resumeUrl: "https://cdn.example.com/resume.pdf",
      }).success
    ).toBe(true);
  });

  it("rejects an invalid URL for resumeUrl", () => {
    const result = applicantSettingsSchema.safeParse({
      ...validData,
      resumeUrl: "bad-url",
    });
    expect(result.success).toBe(false);
  });
});
