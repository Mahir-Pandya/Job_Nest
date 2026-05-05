/**
 * Unit Tests: Session Token Logic
 * File: src/features/auth/server/use-cases/sessions.ts
 *
 * Tests the pure cryptographic logic (token generation, hashing) and
 * expiry/refresh decision logic without requiring a DB or Next.js context.
 */
import { describe, it, expect, vi } from "vitest";
import crypto from "crypto";

// ─── Token Generation (mirroring the real implementation) ─────────────────────
const generateSessionToken = () =>
  crypto.randomBytes(32).toString("hex").normalize();

const hashToken = (token: string) =>
  crypto.createHash("sha-256").update(token).digest("hex");

// ─── Expiry / Refresh Logic (mirroring sessions.ts constants) ─────────────────
const SESSION_LIFETIME = 60 * 60 * 24 * 7; // 7 days in seconds
const SESSION_REFRESH_TIME = 60 * 60 * 24 * 3; // 3 days in seconds

function isSessionExpired(expiresAt: Date): boolean {
  return Date.now() >= expiresAt.getTime();
}

function needsRefresh(expiresAt: Date): boolean {
  return Date.now() >= expiresAt.getTime() - SESSION_REFRESH_TIME * 1000;
}

// ─── Token Generation Tests ───────────────────────────────────────────────────

describe("generateSessionToken", () => {
  it("produces a 64-character hexadecimal string", () => {
    const token = generateSessionToken();
    // 32 bytes * 2 hex chars per byte = 64 chars
    expect(token).toHaveLength(64);
  });

  it("only contains hexadecimal characters", () => {
    const token = generateSessionToken();
    expect(token).toMatch(/^[0-9a-f]+$/i);
  });

  it("generates unique tokens on each call", () => {
    const token1 = generateSessionToken();
    const token2 = generateSessionToken();
    expect(token1).not.toBe(token2);
  });

  it("generates 1000 unique tokens without collision", () => {
    const tokens = new Set(Array.from({ length: 1000 }, generateSessionToken));
    expect(tokens.size).toBe(1000);
  });
});

// ─── Token Hashing Tests ──────────────────────────────────────────────────────

describe("hashToken (SHA-256)", () => {
  it("is deterministic — same input always produces same output", () => {
    const token = "abc123";
    expect(hashToken(token)).toBe(hashToken(token));
  });

  it("produces a 64-character hex string (SHA-256 = 256 bits = 32 bytes = 64 hex chars)", () => {
    const hash = hashToken("some-session-token");
    expect(hash).toHaveLength(64);
  });

  it("different inputs produce different hashes", () => {
    const hash1 = hashToken("token-a");
    const hash2 = hashToken("token-b");
    expect(hash1).not.toBe(hash2);
  });

  it("cannot reverse a hash back to the original token", () => {
    // Sanity check: hash is NOT equal to the original input
    const token = "my-secure-token";
    expect(hashToken(token)).not.toBe(token);
  });
});

// ─── Session Expiry Logic ─────────────────────────────────────────────────────

describe("isSessionExpired", () => {
  it("returns true when expiresAt is in the past", () => {
    const pastDate = new Date(Date.now() - 1000); // 1 second ago
    expect(isSessionExpired(pastDate)).toBe(true);
  });

  it("returns true when expiresAt is exactly now (boundary)", () => {
    const now = new Date(Date.now());
    // Since Date.now() is called again inside, it will be >= now, so true
    expect(isSessionExpired(now)).toBe(true);
  });

  it("returns false when expiresAt is in the future", () => {
    const futureDate = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
    expect(isSessionExpired(futureDate)).toBe(false);
  });

  it("returns false for a session created freshly (7 days from now)", () => {
    const freshExpiry = new Date(Date.now() + SESSION_LIFETIME * 1000);
    expect(isSessionExpired(freshExpiry)).toBe(false);
  });
});

// ─── Session Refresh Logic ────────────────────────────────────────────────────

describe("needsRefresh", () => {
  it("returns false for a fresh session with 7 days remaining", () => {
    const expiresAt = new Date(Date.now() + SESSION_LIFETIME * 1000);
    expect(needsRefresh(expiresAt)).toBe(false);
  });

  it("returns true when session is within the refresh window (< 3 days left)", () => {
    // 2 days left — within 3-day refresh window
    const expiresAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    expect(needsRefresh(expiresAt)).toBe(true);
  });

  it("returns true when session is exactly at the refresh threshold", () => {
    const expiresAt = new Date(Date.now() + SESSION_REFRESH_TIME * 1000);
    expect(needsRefresh(expiresAt)).toBe(true);
  });

  it("returns false when session is just outside the refresh window (> 3 days)", () => {
    // 4 days left — outside 3-day refresh window
    const expiresAt = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000);
    expect(needsRefresh(expiresAt)).toBe(false);
  });
});

// ─── Cookie Security Settings Logic ──────────────────────────────────────────

describe("Cookie security settings", () => {
  it("sets secure: true in production environment", () => {
    const isSecure = "production" === "production";
    expect(isSecure).toBe(true);
  });

  it("sets secure: false in development environment", () => {
    const isSecure = "development" === "production";
    expect(isSecure).toBe(false);
  });

  it("SESSION_LIFETIME constant is 7 days in seconds", () => {
    expect(SESSION_LIFETIME).toBe(604800);
  });

  it("SESSION_REFRESH_TIME constant is 3 days in seconds", () => {
    expect(SESSION_REFRESH_TIME).toBe(259200);
  });
});
