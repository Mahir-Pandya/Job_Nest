/**
 * Integration Tests: Message Server Actions
 * File: src/features/messages/server/messages.actions.ts
 *
 * Tests sendMessageAction and markAsReadAction using vi.mock() to isolate
 * from the real DB and Next.js APIs.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mock dependencies ───────────────────────────────────────────────────────
vi.mock("@/config/db", () => ({
  db: {
    insert: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("@/features/auth/server/auth.queries", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/drizzle/schema", () => ({
  messages: "messages",
}));

// ── Import under test ───────────────────────────────────────────────────────
import { db } from "@/config/db";
import { getCurrentUser } from "@/features/auth/server/auth.queries";
import { revalidatePath } from "next/cache";
import {
  sendMessageAction,
  markAsReadAction,
} from "@/features/messages/server/messages.actions";

// ─── Helpers ────────────────────────────────────────────────────────────────
function makeInsertChain() {
  const chain: any = {
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockResolvedValue([{ insertId: 1 }]),
  };
  vi.mocked(db.insert).mockReturnValue(chain);
  return chain;
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ═══════════════════════════════════════════════════════════════════════════
// sendMessageAction
// ═══════════════════════════════════════════════════════════════════════════

describe("sendMessageAction", () => {
  it("throws 'Unauthorized' when user is not logged in", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null as any);
    await expect(sendMessageAction(2, "Hello!")).rejects.toThrow("Unauthorized");
  });

  it("does nothing when content is empty whitespace", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 1 } as any);
    makeInsertChain();

    await sendMessageAction(2, "   ");
    expect(db.insert).not.toHaveBeenCalled();
  });

  it("does nothing when content is an empty string", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 1 } as any);
    makeInsertChain();

    await sendMessageAction(2, "");
    expect(db.insert).not.toHaveBeenCalled();
  });

  it("inserts message into DB when content is valid", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 1 } as any);
    const chain = makeInsertChain();

    await sendMessageAction(2, "Hello there!");

    expect(db.insert).toHaveBeenCalledOnce();
    expect(chain.values).toHaveBeenCalledWith({
      senderId: 1,
      receiverId: 2,
      content: "Hello there!",
    });
  });

  it("stores the correct senderId (current user's ID)", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 99 } as any);
    const chain = makeInsertChain();

    await sendMessageAction(5, "Test message");

    expect(chain.values).toHaveBeenCalledWith(
      expect.objectContaining({ senderId: 99 })
    );
  });

  it("stores the correct receiverId passed as argument", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 1 } as any);
    const chain = makeInsertChain();

    await sendMessageAction(77, "Hey!");

    expect(chain.values).toHaveBeenCalledWith(
      expect.objectContaining({ receiverId: 77 })
    );
  });

  it("calls revalidatePath('/messages') after inserting", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 1 } as any);
    makeInsertChain();

    await sendMessageAction(2, "Valid message");
    expect(revalidatePath).toHaveBeenCalledWith("/messages");
  });

  it("does NOT call revalidatePath when content is empty", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 1 } as any);
    makeInsertChain();

    await sendMessageAction(2, "   ");
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("sends a message with content that has leading/trailing spaces (non-empty after trim check)", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 1 } as any);
    const chain = makeInsertChain();

    // "  Hi  " — trim() is non-empty so should be inserted as-is
    await sendMessageAction(2, "  Hi  ");
    expect(db.insert).toHaveBeenCalledOnce();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// markAsReadAction
// ═══════════════════════════════════════════════════════════════════════════

describe("markAsReadAction", () => {
  it("throws 'Unauthorized' when user is not logged in", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null as any);
    await expect(markAsReadAction(3)).rejects.toThrow("Unauthorized");
  });

  it("calls revalidatePath('/messages') when user is authenticated", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 1 } as any);

    await markAsReadAction(3);
    expect(revalidatePath).toHaveBeenCalledWith("/messages");
  });

  it("does not call db.update (marked as commented out in implementation)", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 1 } as any);

    await markAsReadAction(3);
    // The DB update logic is commented out in messages.actions.ts
    expect(db.update).not.toHaveBeenCalled();
  });
});
