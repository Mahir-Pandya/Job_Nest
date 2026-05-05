/**
 * Integration Tests: Applicant Server Actions
 * File: src/features/applicants/actions/applicant.action.ts
 *
 * Tests saveApplicantProfile and toggleSaveJobAction business logic
 * using vi.mock() to isolate from the real DB and Next.js APIs.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mock all external dependencies ─────────────────────────────────────────
vi.mock("@/config/db", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    transaction: vi.fn(),
  },
}));

vi.mock("@/features/auth/server/auth.queries", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/drizzle/schema", () => ({
  users: "users",
  applicants: "applicants",
  resumes: "resumes",
  savedJobs: "savedJobs",
}));

// ── Import under test ───────────────────────────────────────────────────────
import { db } from "@/config/db";
import { getCurrentUser } from "@/features/auth/server/auth.queries";
import { revalidatePath } from "next/cache";
import {
  saveApplicantProfile,
  toggleSaveJobAction,
} from "@/features/applicants/actions/applicant.action";

// ─── Shared mock helpers ────────────────────────────────────────────────────
/**
 * Creates a fully chainable, thenable mock for Drizzle SELECT queries.
 * Supports any chain length: .from().where(), .from().where().limit(), etc.
 */
function makeSelectChain(result: unknown[]) {
  const promise = Promise.resolve(result);
  const chain: any = {
    then: promise.then.bind(promise),
    catch: promise.catch.bind(promise),
    finally: promise.finally.bind(promise),
  };
  for (const m of ["select", "from", "where", "limit", "innerJoin", "leftJoin", "orderBy"])
    chain[m] = vi.fn().mockReturnValue(chain);
  vi.mocked(db.select).mockReturnValue(chain);
  return chain;
}

function makeInsertChain() {
  const chain: any = {
    values: vi.fn().mockResolvedValue([{ insertId: 1 }]),
  };
  vi.mocked(db.insert).mockReturnValue(chain);
  return chain;
}

function makeDeleteChain() {
  const promise = Promise.resolve([{}]);
  const chain: any = {
    then: promise.then.bind(promise),
    catch: promise.catch.bind(promise),
    finally: promise.finally.bind(promise),
  };
  chain.where = vi.fn().mockReturnValue(chain);
  vi.mocked(db.delete).mockReturnValue(chain);
  return chain;
}

const validProfileData = {
  name: "Alice Johnson",
  email: "alice@example.com",
  phoneNumber: "1234567890",
  location: "New York",
  dateOfBirth: "1995-06-15",
  nationality: "American",
  gender: "female" as const,
  maritalStatus: "single" as const,
  education: "undergraduate" as const,
  experience: "3 years of experience",
  websiteUrl: "",
  biography: "A passionate developer",
  avatarUrl: "https://example.com/avatar.jpg",
  resumeUrl: "",
  resumeName: "",
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ═══════════════════════════════════════════════════════════════════════════
// saveApplicantProfile
// ═══════════════════════════════════════════════════════════════════════════

describe("saveApplicantProfile", () => {
  it("returns ERROR when user is not authenticated", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null as any);

    const result = await saveApplicantProfile(validProfileData);
    expect(result.status).toBe("ERROR");
    expect(result.message).toMatch(/unauthorized/i);
  });

  it("returns ERROR when Zod validation fails (short name)", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 1 } as any);

    const result = await saveApplicantProfile({ ...validProfileData, name: "A" });
    expect(result.status).toBe("ERROR");
  });

  it("runs a DB transaction when authenticated and data is valid", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 1 } as any);
    vi.mocked(db.transaction).mockResolvedValue(undefined as any);

    const result = await saveApplicantProfile(validProfileData);
    expect(db.transaction).toHaveBeenCalledOnce();
    expect(result.status).toBe("SUCCESS");
  });

  it("returns SUCCESS with correct message on save", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 1 } as any);
    vi.mocked(db.transaction).mockResolvedValue(undefined as any);

    const result = await saveApplicantProfile(validProfileData);
    expect(result.status).toBe("SUCCESS");
    expect(result.message).toMatch(/saved successfully/i);
  });

  it("calls revalidatePath for settings page on success", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 1 } as any);
    vi.mocked(db.transaction).mockResolvedValue(undefined as any);

    await saveApplicantProfile(validProfileData);
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard/settings");
  });

  it("returns ERROR with message when DB transaction throws", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 1 } as any);
    vi.mocked(db.transaction).mockRejectedValue(new Error("DB error") as any);

    const result = await saveApplicantProfile(validProfileData);
    expect(result.status).toBe("ERROR");
    expect(result.message).toMatch(/failed to save/i);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// toggleSaveJobAction
// ═══════════════════════════════════════════════════════════════════════════

describe("toggleSaveJobAction", () => {
  it("returns ERROR when user is not authenticated", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null as any);

    const result = await toggleSaveJobAction(42);
    expect(result.status).toBe("ERROR");
    expect(result.message).toMatch(/unauthorized/i);
  });

  it("inserts a new saved job when job is not yet saved", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 1 } as any);
    // First select: no existing saved job
    makeSelectChain([]);
    makeInsertChain();

    const result = await toggleSaveJobAction(42);
    expect(result.status).toBe("SUCCESS");
    expect(result.message).toMatch(/saved successfully/i);
    expect(db.insert).toHaveBeenCalledOnce();
  });

  it("deletes the saved job when it already exists (unsave)", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 1 } as any);
    // Existing saved job found
    makeSelectChain([{ id: 7, userId: 1, jobId: 42 }]);
    makeDeleteChain();

    const result = await toggleSaveJobAction(42);
    expect(result.status).toBe("SUCCESS");
    expect(result.message).toMatch(/removed from saved/i);
    expect(db.delete).toHaveBeenCalledOnce();
  });

  it("calls revalidatePath for both job page and saved-jobs page after saving", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 1 } as any);
    makeSelectChain([]);
    makeInsertChain();

    await toggleSaveJobAction(42);
    expect(revalidatePath).toHaveBeenCalledWith("/jobs/42");
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard/saved-jobs");
  });

  it("calls revalidatePath for both pages after unsaving", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 1 } as any);
    makeSelectChain([{ id: 7, userId: 1, jobId: 42 }]);
    makeDeleteChain();

    await toggleSaveJobAction(42);
    expect(revalidatePath).toHaveBeenCalledWith("/jobs/42");
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard/saved-jobs");
  });

  it("returns ERROR with message when DB throws during save", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 1 } as any);
    vi.mocked(db.select).mockImplementation(() => {
      throw new Error("DB unavailable");
    });

    const result = await toggleSaveJobAction(42);
    expect(result.status).toBe("ERROR");
    expect(result.message).toMatch(/failed to update saved jobs/i);
  });
});
