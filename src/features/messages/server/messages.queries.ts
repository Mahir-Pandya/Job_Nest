import { db } from "@/config/db";
import { cache } from "react";
import { messages, users } from "@/drizzle/schema";
import { and, eq, or, desc, sql } from "drizzle-orm";

/**
 * Get all messages between two users
 */
export async function getConversation(user1Id: number, user2Id: number) {
  const conversation = await db
    .select({
      id: messages.id,
      senderId: messages.senderId,
      receiverId: messages.receiverId,
      content: messages.content,
      createdAt: messages.createdAt,
      isRead: messages.isRead,
    })
    .from(messages)
    .where(
      or(
        and(eq(messages.senderId, user1Id), eq(messages.receiverId, user2Id)),
        and(eq(messages.senderId, user2Id), eq(messages.receiverId, user1Id))
      )
    )
    .orderBy(messages.createdAt);

  return conversation;
}

/**
 * Get a list of all conversations for a user
 * Returns the latest message and the other user's info for each unique contact
 */
export async function getUserConversations(userId: number) {
  // Find all unique contact IDs for the user using a type-safe Drizzle query
  const contactsResult = await db
    .selectDistinct({
      contactId: sql<number>`CASE WHEN ${messages.senderId} = ${userId} THEN ${messages.receiverId} ELSE ${messages.senderId} END`,
    })
    .from(messages)
    .where(
      or(eq(messages.senderId, userId), eq(messages.receiverId, userId))
    );

  const contacts = contactsResult.map((c) => c.contactId);

  if (contacts.length === 0) return [];

  const conversations = await Promise.all(
    contacts.map(async (contactId) => {
      const [lastMessage] = await db
        .select()
        .from(messages)
        .where(
          or(
            and(eq(messages.senderId, userId), eq(messages.receiverId, contactId)),
            and(eq(messages.senderId, contactId), eq(messages.receiverId, userId))
          )
        )
        .orderBy(desc(messages.createdAt))
        .limit(1);

      const [contactUser] = await db
        .select({
          id: users.id,
          name: users.name,
          avatarUrl: users.avatarUrl,
        })
        .from(users)
        .where(eq(users.id, contactId));

      return {
        contact: contactUser,
        lastMessage,
      };
    })
  );

  // Sort by latest message
  return conversations.sort((a, b) => 
    new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
  );
}

/**
 * Get total unread message count for a user
 */
export const getUnreadMessageCount = cache(async (userId: number) => {
  try {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(messages)
      .where(and(eq(messages.receiverId, userId), eq(messages.isRead, false)));

    return result.count ?? 0;
  } catch (error) {
    console.error("Error fetching unread message count:", error);
    return 0;
  }
});
