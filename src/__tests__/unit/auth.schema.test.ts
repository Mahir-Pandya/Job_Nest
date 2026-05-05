/**
 * Unit Tests: Auth Validation Schemas
 * File: src/features/auth/auth.schema.ts
 *
 * Tests all Zod validation rules for register, login, and changePassword schemas.
 * No DB or mocking required — pure function tests.
 */
import { describe, it, expect } from "vitest";
import {
  registerUserSchema,
  registerUserWithConfirmSchema,
  loginUserSchema,
  changePasswordSchema,
} from "@/features/auth/auth.schema";

// ─── registerUserSchema ────────────────────────────────────────────────────────

describe("registerUserSchema", () => {
  const validData = {
    name: "John Doe",
    userName: "john_doe",
    email: "john@example.com",
    password: "Password1",
    role: "applicant" as const,
  };

  it("accepts valid registration data", () => {
    const result = registerUserSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("defaults role to 'applicant' when not provided", () => {
    const { role, ...withoutRole } = validData;
    const result = registerUserSchema.safeParse(withoutRole);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.role).toBe("applicant");
  });

  // ── name ────────────────────────────────────────────────────────────────────
  it("rejects name shorter than 2 characters", () => {
    const result = registerUserSchema.safeParse({ ...validData, name: "A" });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues[0].message).toContain("2");
  });

  it("rejects name longer than 255 characters", () => {
    const result = registerUserSchema.safeParse({
      ...validData,
      name: "A".repeat(256),
    });
    expect(result.success).toBe(false);
  });

  // ── userName ────────────────────────────────────────────────────────────────
  it("rejects userName shorter than 3 characters", () => {
    const result = registerUserSchema.safeParse({ ...validData, userName: "ab" });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues[0].message).toMatch(/3/);
  });

  it("rejects userName with spaces", () => {
    const result = registerUserSchema.safeParse({
      ...validData,
      userName: "john doe",
    });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues[0].message).toMatch(/letters|characters/i);
  });

  it("rejects userName with special chars like @", () => {
    const result = registerUserSchema.safeParse({
      ...validData,
      userName: "john@doe",
    });
    expect(result.success).toBe(false);
  });

  it("accepts userName with underscores and hyphens", () => {
    const result = registerUserSchema.safeParse({
      ...validData,
      userName: "john_doe-123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects userName longer than 255 characters", () => {
    const result = registerUserSchema.safeParse({
      ...validData,
      userName: "a".repeat(256),
    });
    expect(result.success).toBe(false);
  });

  // ── email ───────────────────────────────────────────────────────────────────
  it("rejects invalid email format", () => {
    const result = registerUserSchema.safeParse({
      ...validData,
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("normalises email to lowercase", () => {
    const result = registerUserSchema.safeParse({
      ...validData,
      email: "JOHN@EXAMPLE.COM",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe("john@example.com");
  });

  // ── password ────────────────────────────────────────────────────────────────
  it("rejects password shorter than 8 characters", () => {
    const result = registerUserSchema.safeParse({
      ...validData,
      password: "P1a",
    });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues[0].message).toMatch(/8/);
  });

  it("rejects password with no uppercase letter", () => {
    const result = registerUserSchema.safeParse({
      ...validData,
      password: "password1",
    });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues[0].message).toMatch(/uppercase/i);
  });

  it("rejects password with no lowercase letter", () => {
    const result = registerUserSchema.safeParse({
      ...validData,
      password: "PASSWORD1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password with no digit", () => {
    const result = registerUserSchema.safeParse({
      ...validData,
      password: "PasswordOnly",
    });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues[0].message).toMatch(/number/i);
  });

  // ── role ────────────────────────────────────────────────────────────────────
  it("accepts role 'employer'", () => {
    const result = registerUserSchema.safeParse({
      ...validData,
      role: "employer",
    });
    expect(result.success).toBe(true);
  });

  it("rejects role 'admin'", () => {
    const result = registerUserSchema.safeParse({ ...validData, role: "admin" });
    expect(result.success).toBe(false);
  });
});

// ─── registerUserWithConfirmSchema ─────────────────────────────────────────────

describe("registerUserWithConfirmSchema", () => {
  const validData = {
    name: "Jane Smith",
    userName: "jane_smith",
    email: "jane@example.com",
    password: "SecurePass1",
    confirmPassword: "SecurePass1",
    role: "applicant" as const,
  };

  it("accepts matching passwords", () => {
    const result = registerUserWithConfirmSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("rejects when confirmPassword does not match password", () => {
    const result = registerUserWithConfirmSchema.safeParse({
      ...validData,
      confirmPassword: "WrongPass1",
    });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues[0].message).toMatch(/don't match|match/i);
  });

  it("error path is on confirmPassword field", () => {
    const result = registerUserWithConfirmSchema.safeParse({
      ...validData,
      confirmPassword: "Different1",
    });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues[0].path).toContain("confirmPassword");
  });
});

// ─── loginUserSchema ───────────────────────────────────────────────────────────

describe("loginUserSchema", () => {
  const validLogin = {
    email: "user@example.com",
    password: "MyPassword1",
  };

  it("accepts valid login credentials", () => {
    expect(loginUserSchema.safeParse(validLogin).success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginUserSchema.safeParse({ ...validLogin, email: "bad" });
    expect(result.success).toBe(false);
  });

  it("normalises email to lowercase", () => {
    const result = loginUserSchema.safeParse({
      ...validLogin,
      email: "USER@EXAMPLE.COM",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe("user@example.com");
  });

  it("rejects password shorter than 8 characters", () => {
    const result = loginUserSchema.safeParse({ ...validLogin, password: "short" });
    expect(result.success).toBe(false);
  });
});

// ─── changePasswordSchema ──────────────────────────────────────────────────────

describe("changePasswordSchema", () => {
  const validChange = {
    currentPassword: "OldPassword1",
    newPassword: "NewPassword1",
    confirmNewPassword: "NewPassword1",
  };

  it("accepts valid change password data", () => {
    expect(changePasswordSchema.safeParse(validChange).success).toBe(true);
  });

  it("rejects empty currentPassword", () => {
    const result = changePasswordSchema.safeParse({
      ...validChange,
      currentPassword: "",
    });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues[0].message).toMatch(/required/i);
  });

  it("rejects newPassword shorter than 8 characters", () => {
    const result = changePasswordSchema.safeParse({
      ...validChange,
      newPassword: "Sh0rt",
      confirmNewPassword: "Sh0rt",
    });
    expect(result.success).toBe(false);
  });

  it("rejects newPassword without uppercase letter", () => {
    const result = changePasswordSchema.safeParse({
      ...validChange,
      newPassword: "newpassword1",
      confirmNewPassword: "newpassword1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects newPassword without a digit", () => {
    const result = changePasswordSchema.safeParse({
      ...validChange,
      newPassword: "NewPassword",
      confirmNewPassword: "NewPassword",
    });
    expect(result.success).toBe(false);
  });

  it("rejects when confirmNewPassword does not match newPassword", () => {
    const result = changePasswordSchema.safeParse({
      ...validChange,
      confirmNewPassword: "DifferentPass1",
    });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues[0].path).toContain("confirmNewPassword");
  });
});
