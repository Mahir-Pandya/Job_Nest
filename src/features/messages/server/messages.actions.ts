"use server";

import { db } from "@/config/db";
import { messages } from "@/drizzle/schema";
import { getCurrentUser } from "@/features/auth/server/auth.queries";
import { revalidatePath } from "next/cache";

export async function sendMessageAction(receiverId: number, content: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  if (!content.trim()) return;

  await db.insert(messages).values({
    senderId: user.id,
    receiverId,
    content,
  });

  revalidatePath("/messages");
}

export async function markAsReadAction(senderId: number) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  // await db.update(messages)
  //   .set({ isRead: true })
  //   .where(and(eq(messages.senderId, senderId), eq(messages.receiverId, user.id)));

  revalidatePath("/messages");
}
