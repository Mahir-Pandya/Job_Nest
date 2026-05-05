/**
 * Unit Tests: Employer Profile Schema
 * File: src/features/employers/employers.schema.ts
 *
 * Tests all Zod validation rules for the employer profile form.
 * No DB or mocking required — pure function tests.
 */
import { describe, it, expect } from "vitest";
import {
  employerProfileSchema,
  organizationTypes,
  teamSizes,
} from "@/features/employers/employers.schema";

const validData = {
  name: "Tech Corp",
  description: "A software company focused on innovation and quality.",
  organizationType: "it & software" as const,
  teamSize: "11-50" as const,
  yearOfEstablishment: "2010",
  websiteUrl: "https://techcorp.com",
  location: "San Francisco",
  avatarUrl: "https://techcorp.com/logo.png",
  bannerImageUrl: "",
};

describe("employerProfileSchema", () => {
  it("accepts valid employer profile data", () => {
    expect(employerProfileSchema.safeParse(validData).success).toBe(true);
  });

  // ── name ─────────────────────────────────────────────────────────────────────
  it("rejects company name shorter than 2 characters", () => {
    const result = employerProfileSchema.safeParse({ ...validData, name: "A" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].message).toMatch(/2/);
  });

  it("rejects company name longer than 255 characters", () => {
    const result = employerProfileSchema.safeParse({
      ...validData,
      name: "A".repeat(256),
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].message).toMatch(/255/);
  });

  // ── description ───────────────────────────────────────────────────────────────
  it("rejects description shorter than 10 characters", () => {
    const result = employerProfileSchema.safeParse({
      ...validData,
      description: "Short",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].message).toMatch(/10/);
  });

  it("rejects description longer than 2000 characters", () => {
    const result = employerProfileSchema.safeParse({
      ...validData,
      description: "A".repeat(2001),
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].message).toMatch(/2000/);
  });

  // ── organizationType ──────────────────────────────────────────────────────────
  it("rejects invalid organizationType", () => {
    const result = employerProfileSchema.safeParse({
      ...validData,
      organizationType: "space-exploration" as any,
    });
    expect(result.success).toBe(false);
  });

  it("accepts every valid organizationType value", () => {
    for (const type of organizationTypes) {
      const result = employerProfileSchema.safeParse({
        ...validData,
        organizationType: type,
      });
      expect(result.success, `Failed for type: ${type}`).toBe(true);
    }
  });

  // ── teamSize ──────────────────────────────────────────────────────────────────
  it("rejects invalid teamSize", () => {
    const result = employerProfileSchema.safeParse({
      ...validData,
      teamSize: "5000+" as any,
    });
    expect(result.success).toBe(false);
  });

  it("accepts every valid teamSize value", () => {
    for (const size of teamSizes) {
      const result = employerProfileSchema.safeParse({
        ...validData,
        teamSize: size,
      });
      expect(result.success, `Failed for size: ${size}`).toBe(true);
    }
  });

  // ── yearOfEstablishment ───────────────────────────────────────────────────────
  it("rejects a 3-digit year", () => {
    const result = employerProfileSchema.safeParse({
      ...validData,
      yearOfEstablishment: "999",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].message).toMatch(/4-digit/i);
  });

  it("rejects a 5-digit year", () => {
    const result = employerProfileSchema.safeParse({
      ...validData,
      yearOfEstablishment: "20001",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a year before 1800", () => {
    const result = employerProfileSchema.safeParse({
      ...validData,
      yearOfEstablishment: "1799",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].message).toMatch(/1800/);
  });

  it("rejects a future year beyond current year", () => {
    const futureYear = (new Date().getFullYear() + 1).toString();
    const result = employerProfileSchema.safeParse({
      ...validData,
      yearOfEstablishment: futureYear,
    });
    expect(result.success).toBe(false);
  });

  it("accepts a valid year like 1800", () => {
    expect(
      employerProfileSchema.safeParse({ ...validData, yearOfEstablishment: "1800" })
        .success
    ).toBe(true);
  });

  it("accepts the current year", () => {
    const currentYear = new Date().getFullYear().toString();
    expect(
      employerProfileSchema.safeParse({
        ...validData,
        yearOfEstablishment: currentYear,
      }).success
    ).toBe(true);
  });

  // ── websiteUrl ────────────────────────────────────────────────────────────────
  it("accepts empty string for optional websiteUrl", () => {
    expect(
      employerProfileSchema.safeParse({ ...validData, websiteUrl: "" }).success
    ).toBe(true);
  });

  it("accepts undefined for optional websiteUrl", () => {
    const { websiteUrl, ...withoutWebsite } = validData;
    expect(employerProfileSchema.safeParse(withoutWebsite).success).toBe(true);
  });

  it("rejects an invalid URL for websiteUrl", () => {
    const result = employerProfileSchema.safeParse({
      ...validData,
      websiteUrl: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  // ── avatarUrl ─────────────────────────────────────────────────────────────────
  it("rejects missing avatarUrl", () => {
    const { avatarUrl, ...withoutAvatar } = validData;
    const result = employerProfileSchema.safeParse(withoutAvatar);
    expect(result.success).toBe(false);
  });

  it("rejects invalid URL for avatarUrl", () => {
    const result = employerProfileSchema.safeParse({
      ...validData,
      avatarUrl: "bad-url",
    });
    expect(result.success).toBe(false);
  });

  // ── bannerImageUrl ────────────────────────────────────────────────────────────
  it("accepts empty string for optional bannerImageUrl", () => {
    expect(
      employerProfileSchema.safeParse({ ...validData, bannerImageUrl: "" }).success
    ).toBe(true);
  });

  it("rejects an invalid URL for bannerImageUrl", () => {
    const result = employerProfileSchema.safeParse({
      ...validData,
      bannerImageUrl: "not-valid",
    });
    expect(result.success).toBe(false);
  });
});
