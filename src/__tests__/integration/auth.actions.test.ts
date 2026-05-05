/**
 * Integration Tests: Auth Server Actions
 * File: src/features/auth/server/auth.actions.tsx
 *
 * Tests the full business logic of register, login, logout, and changePassword
 * actions using vi.mock() to isolate from the real DB and Next.js APIs.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mock all external dependencies ──────────────────────────────────────────
vi.mock("@/config/db", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    transaction: vi.fn(),
  },
}));

vi.mock("argon2", () => ({
  default: {
    hash: vi.fn(),
    verify: vi.fn(),
  },
}));

vi.mock("@/features/auth/server/use-cases/sessions", () => ({
  createSessionAndSetCookies: vi.fn(),
  invalidateSession: vi.fn(),
}));

vi.mock("@/features/auth/server/auth.queries", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
  headers: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`);
  }),
}));

vi.mock("@/drizzle/schema", () => ({
  users: "users",
  applicants: "applicants",
  employers: "employers",
}));

// ── Import actions under test (after mocks are hoisted) ─────────────────────
import { db } from "@/config/db";
import argon2 from "argon2";
import {
  createSessionAndSetCookies,
  invalidateSession,
} from "@/features/auth/server/use-cases/sessions";
import { getCurrentUser } from "@/features/auth/server/auth.queries";
import { cookies } from "next/headers";
import {
  registerUserAction,
  loginUserAction,
  logoutUserAction,
  changePasswordAction,
} from "@/features/auth/server/auth.actions";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Creates a fully chainable, thenable mock for Drizzle queries.
 * Every builder method (from/where/limit/etc.) returns the same chain,
 * and the chain itself is awaitable via .then/.catch — so both:
 *   await db.select().from(x).where(y)
 *   await db.select().from(x).where(y).limit(1)
 * resolve correctly to `result`.
 */
function makeThenableChain(result: unknown[]) {
  const promise = Promise.resolve(result);
  const chain: any = {
    then: promise.then.bind(promise),
    catch: promise.catch.bind(promise),
    finally: promise.finally.bind(promise),
  };
  // All builder methods return the same thenable chain
  const methods = ["select", "from", "where", "limit", "innerJoin", "leftJoin", "orderBy"];
  for (const m of methods) chain[m] = vi.fn().mockReturnValue(chain);
  return chain;
}

function mockSelect(result: unknown[]) {
  const chain = makeThenableChain(result);
  vi.mocked(db.select).mockReturnValue(chain);
  return chain;
}

function mockInsert(insertId = 1) {
  const chain: any = {
    values: vi.fn().mockResolvedValue([{ insertId }]),
  };
  vi.mocked(db.insert).mockReturnValue(chain);
  return chain;
}

function mockUpdate() {
  const promise = Promise.resolve([{}]);
  const chain: any = {
    then: promise.then.bind(promise),
    catch: promise.catch.bind(promise),
    finally: promise.finally.bind(promise),
  };
  chain.set = vi.fn().mockReturnValue(chain);
  chain.where = vi.fn().mockReturnValue(chain);
  vi.mocked(db.update).mockReturnValue(chain);
  return chain;
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ═══════════════════════════════════════════════════════════════════════════════
// registerUserAction
// ═══════════════════════════════════════════════════════════════════════════════

describe("registerUserAction", () => {
  const validApplicant = {
    name: "Alice Test",
    userName: "alice_test",
    email: "alice@test.com",
    password: "SecurePass1",
    role: "applicant" as const,
  };

  it("returns ERROR for invalid Zod data (short password)", async () => {
    const result = await registerUserAction({
      ...validApplicant,
      password: "short",
    });
    expect(result.status).toBe("ERROR");
  });

  it("returns ERROR when email already exists in DB", async () => {
    // Simulate DB returning an existing user with same email
    mockSelect([{ id: 99, email: "alice@test.com", userName: "other" }]);

    const result = await registerUserAction(validApplicant);
    expect(result.status).toBe("ERROR");
    expect(result.message).toMatch(/email already exists/i);
  });

  it("returns ERROR when username already exists in DB", async () => {
    // Existing user has different email but same userName
    mockSelect([{ id: 99, email: "other@test.com", userName: "alice_test" }]);

    const result = await registerUserAction(validApplicant);
    expect(result.status).toBe("ERROR");
    expect(result.message).toMatch(/username already exists/i);
  });

  it("calls argon2.hash with the plain password when data is valid", async () => {
    // No existing user
    mockSelect([]);
    vi.mocked(argon2.hash).mockResolvedValue("hashed_password" as never);
    vi.mocked(db.transaction).mockImplementation(async (cb: any) => cb(db));
    mockInsert(10);

    await registerUserAction(validApplicant);

    expect(argon2.hash).toHaveBeenCalledWith("SecurePass1");
  });

  it("runs a DB transaction on successful registration", async () => {
    mockSelect([]);
    vi.mocked(argon2.hash).mockResolvedValue("hashed" as never);
    vi.mocked(db.transaction).mockResolvedValue(undefined as any);

    await registerUserAction(validApplicant);

    expect(db.transaction).toHaveBeenCalledOnce();
  });

  it("returns SUCCESS message on successful applicant registration", async () => {
    mockSelect([]);
    vi.mocked(argon2.hash).mockResolvedValue("hashed" as never);
    vi.mocked(db.transaction).mockResolvedValue(undefined as any);

    const result = await registerUserAction(validApplicant);
    expect(result.status).toBe("SUCCESS");
    expect(result.message).toMatch(/registration completed/i);
  });

  it("returns ERROR with generic message when an exception is thrown", async () => {
    mockSelect([]);
    vi.mocked(argon2.hash).mockRejectedValue(new Error("hash failed") as never);

    const result = await registerUserAction(validApplicant);
    expect(result.status).toBe("ERROR");
    expect(result.message).toMatch(/unknown error/i);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// loginUserAction
// ═══════════════════════════════════════════════════════════════════════════════

describe("loginUserAction", () => {
  const validLogin = { email: "user@test.com", password: "Password1" };

  it("returns ERROR for invalid Zod input (short password)", async () => {
    const result = await loginUserAction({ email: "a@b.com", password: "bad" });
    expect(result.status).toBe("ERROR");
  });

  it("returns ERROR when user is not found in DB", async () => {
    mockSelect([]);
    const result = await loginUserAction(validLogin);
    expect(result.status).toBe("ERROR");
    expect(result.message).toMatch(/invalid email or password/i);
  });

  it("returns ERROR when password is incorrect", async () => {
    mockSelect([
      { id: 1, email: "user@test.com", password: "hashed", role: "applicant" },
    ]);
    vi.mocked(argon2.verify).mockResolvedValue(false as never);

    const result = await loginUserAction(validLogin);
    expect(result.status).toBe("ERROR");
    expect(result.message).toMatch(/invalid email or password/i);
  });

  it("calls createSessionAndSetCookies on successful login", async () => {
    mockSelect([
      { id: 5, email: "user@test.com", password: "hashed", role: "applicant" },
    ]);
    vi.mocked(argon2.verify).mockResolvedValue(true as never);
    vi.mocked(createSessionAndSetCookies).mockResolvedValue(undefined as never);

    await loginUserAction(validLogin);
    expect(createSessionAndSetCookies).toHaveBeenCalledWith(5);
  });

  it("returns SUCCESS with correct role on valid credentials", async () => {
    mockSelect([
      { id: 5, email: "user@test.com", password: "hashed", role: "employer" },
    ]);
    vi.mocked(argon2.verify).mockResolvedValue(true as never);
    vi.mocked(createSessionAndSetCookies).mockResolvedValue(undefined as never);

    const result = await loginUserAction(validLogin);
    expect(result.status).toBe("SUCCESS");
    expect((result as any).role).toBe("employer");
  });

  it("returns ERROR with generic message when DB throws", async () => {
    vi.mocked(db.select).mockImplementation(() => {
      throw new Error("DB down");
    });

    const result = await loginUserAction(validLogin);
    expect(result.status).toBe("ERROR");
    expect(result.message).toMatch(/unknown error/i);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// logoutUserAction
// ═══════════════════════════════════════════════════════════════════════════════

describe("logoutUserAction", () => {
  it("redirects to /login when no session cookie is present", async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue(undefined),
      delete: vi.fn(),
    } as any);

    await expect(logoutUserAction()).rejects.toThrow("REDIRECT:/login");
  });

  it("calls invalidateSession with hashed token when session exists", async () => {
    const deleteMock = vi.fn();
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: "raw-session-token" }),
      delete: deleteMock,
    } as any);
    vi.mocked(invalidateSession).mockResolvedValue(undefined);

    await expect(logoutUserAction()).rejects.toThrow("REDIRECT:/login");

    expect(invalidateSession).toHaveBeenCalledOnce();
    // The hash should NOT equal the raw token
    const calledWith = vi.mocked(invalidateSession).mock.calls[0][0];
    expect(calledWith).not.toBe("raw-session-token");
    expect(calledWith).toHaveLength(64); // SHA-256 hex = 64 chars
  });

  it("deletes the session cookie on logout", async () => {
    const deleteMock = vi.fn();
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: "raw-session-token" }),
      delete: deleteMock,
    } as any);
    vi.mocked(invalidateSession).mockResolvedValue(undefined);

    await expect(logoutUserAction()).rejects.toThrow("REDIRECT:/login");
    expect(deleteMock).toHaveBeenCalledWith("session");
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// changePasswordAction
// ═══════════════════════════════════════════════════════════════════════════════

describe("changePasswordAction", () => {
  const validChange = {
    currentPassword: "OldPassword1",
    newPassword: "NewPassword1",
    confirmNewPassword: "NewPassword1",
  };

  it("returns ERROR for invalid Zod data", async () => {
    const result = await changePasswordAction({
      currentPassword: "",
      newPassword: "NewPassword1",
      confirmNewPassword: "NewPassword1",
    });
    expect(result.status).toBe("ERROR");
  });

  it("returns ERROR when user is not authenticated", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null as any);

    const result = await changePasswordAction(validChange);
    expect(result.status).toBe("ERROR");
    expect(result.message).toMatch(/not authenticated/i);
  });

  it("returns ERROR when user is not found in DB", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 1 } as any);
    mockSelect([]);

    const result = await changePasswordAction(validChange);
    expect(result.status).toBe("ERROR");
    expect(result.message).toMatch(/user not found/i);
  });

  it("returns ERROR when current password is incorrect", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 1 } as any);
    mockSelect([{ id: 1, password: "hashed_old" }]);
    vi.mocked(argon2.verify).mockResolvedValue(false as never);

    const result = await changePasswordAction(validChange);
    expect(result.status).toBe("ERROR");
    expect(result.message).toMatch(/current password is incorrect/i);
  });

  it("returns ERROR when new password is same as current password (identical strings)", async () => {
    const samePassChange = {
      currentPassword: "SamePass1",
      newPassword: "SamePass1",
      confirmNewPassword: "SamePass1",
    };
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 1 } as any);
    mockSelect([{ id: 1, password: "hashed" }]);
    vi.mocked(argon2.verify).mockResolvedValue(true as never);
    mockUpdate();

    const result = await changePasswordAction(samePassChange);
    expect(result.status).toBe("ERROR");
    expect(result.message).toMatch(/different/i);
  });

  it("hashes the new password and updates DB on success", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 1 } as any);
    mockSelect([{ id: 1, password: "old_hash" }]);
    vi.mocked(argon2.verify).mockResolvedValue(true as never);
    vi.mocked(argon2.hash).mockResolvedValue("new_hash" as never);
    mockUpdate();

    const result = await changePasswordAction(validChange);
    expect(result.status).toBe("SUCCESS");
    expect(argon2.hash).toHaveBeenCalledWith("NewPassword1");
    expect(db.update).toHaveBeenCalledOnce();
  });
});
