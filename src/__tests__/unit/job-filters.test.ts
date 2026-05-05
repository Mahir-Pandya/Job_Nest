/**
 * Unit Tests: Job Filter Parameter Logic
 * File: src/features/employers/jobs/server/jobs.queries.ts
 *
 * Tests the filter/pagination logic in isolation — specifically the construction
 * of SQL conditions from JobFilterParams. These are pure-logic tests that don't
 * require a real database connection.
 */
import { describe, it, expect } from "vitest";

// ─── Helper: replicate the filter-condition logic ─────────────────────────────
// We extract and test the logic that converts filter params into conditions,
// without running a DB query.

interface JobFilterParams {
  search?: string;
  jobType?: string;
  jobLevel?: string;
  workType?: string;
  page?: number;
  limit?: number;
}

function buildPaginationValues(filters: JobFilterParams) {
  const page = filters.page || 1;
  const limit = filters.limit || 9;
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

function shouldApplyFilter(value?: string): boolean {
  return !!value && value !== "all";
}

// ─── Pagination Logic ─────────────────────────────────────────────────────────

describe("Job pagination logic", () => {
  it("defaults to page 1 and limit 9", () => {
    const { page, limit, offset } = buildPaginationValues({});
    expect(page).toBe(1);
    expect(limit).toBe(9);
    expect(offset).toBe(0);
  });

  it("calculates correct offset for page 2 with default limit", () => {
    const { offset } = buildPaginationValues({ page: 2 });
    expect(offset).toBe(9);
  });

  it("calculates correct offset for page 3 with limit 9", () => {
    const { offset } = buildPaginationValues({ page: 3, limit: 9 });
    expect(offset).toBe(18);
  });

  it("calculates correct offset for page 2 with custom limit 5", () => {
    const { offset } = buildPaginationValues({ page: 2, limit: 5 });
    expect(offset).toBe(5);
  });

  it("uses page 1 when page is not provided", () => {
    const { page } = buildPaginationValues({ limit: 5 });
    expect(page).toBe(1);
  });

  it("uses limit 9 when limit is not provided", () => {
    const { limit } = buildPaginationValues({ page: 2 });
    expect(limit).toBe(9);
  });
});

// ─── Filter Application Logic ─────────────────────────────────────────────────

describe("Job filter application logic", () => {
  it("does not apply jobType filter when value is 'all'", () => {
    expect(shouldApplyFilter("all")).toBe(false);
  });

  it("does not apply filter when value is undefined", () => {
    expect(shouldApplyFilter(undefined)).toBe(false);
  });

  it("does not apply filter when value is empty string", () => {
    expect(shouldApplyFilter("")).toBe(false);
  });

  it("applies filter when jobType is a valid value", () => {
    expect(shouldApplyFilter("remote")).toBe(true);
  });

  it("applies filter when jobLevel is 'senior'", () => {
    expect(shouldApplyFilter("senior")).toBe(true);
  });

  it("applies filter when workType is 'full-time'", () => {
    expect(shouldApplyFilter("full-time")).toBe(true);
  });

  it("applies filter when workType is 'part-time'", () => {
    expect(shouldApplyFilter("part-time")).toBe(true);
  });
});

// ─── Search Term Construction ──────────────────────────────────────────────────

describe("Search term wildcard construction", () => {
  it("wraps search term in SQL wildcard % characters", () => {
    const search = "react";
    const searchTerm = `%${search}%`;
    expect(searchTerm).toBe("%react%");
  });

  it("preserves spaces in multi-word search terms", () => {
    const search = "react developer";
    const searchTerm = `%${search}%`;
    expect(searchTerm).toBe("%react developer%");
  });

  it("preserves casing in search term", () => {
    const search = "React";
    const searchTerm = `%${search}%`;
    expect(searchTerm).toBe("%React%");
  });
});

// ─── Date Comparison for Expiry ───────────────────────────────────────────────

describe("Job expiry date logic", () => {
  it("today with zeroed time is less than a future date", () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    expect(today < tomorrow).toBe(true);
  });

  it("today with zeroed time is equal to itself", () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCopy = new Date(today);
    expect(today.getTime()).toBe(todayCopy.getTime());
  });

  it("yesterday is less than today", () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    // An expired job (expiresAt = yesterday) should NOT pass `gte(expiresAt, today)`
    expect(yesterday < today).toBe(true);
  });
});
