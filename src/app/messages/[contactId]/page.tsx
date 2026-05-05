import { getCurrentUser } from "@/features/auth/server/auth.queries";
import { getConversation } from "@/features/messages/server/messages.queries";
import { ChatWindow } from "@/features/messages/components/ChatWindow";
import { db } from "@/config/db";
import { users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";

interface ChatPageProps {
  params: Promise<{ contactId: string }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const user = await getCurrentUser();
  if (!user) return redirect("/login");

  const { contactId: rawContactId } = await params;
  const contactId = parseInt(rawContactId);
  if (isNaN(contactId)) return notFound();

  // Fetch contact info
  const [contactUser] = await db
    .select({
      id: users.id,
      name: users.name,
      avatarUrl: users.avatarUrl,
    })
    .from(users)
    .where(eq(users.id, contactId));

  if (!contactUser) return notFound();

  const initialMessages = await getConversation(user.id, contactId);

  return (
    <ChatWindow 
      currentUserId={user.id}
      receiver={contactUser}
      initialMessages={initialMessages}
    />
  );
}
