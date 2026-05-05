"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { MessageSquare, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

interface Conversation {
  contact: {
    id: number;
    name: string;
    avatarUrl: string | null;
  };
  lastMessage: {
    content: string;
    createdAt: Date;
    senderId: number;
  };
}

interface ConversationListProps {
  conversations: Conversation[];
  activeContactId?: number;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string) {
  const colors = [
    "bg-blue-500",
    "bg-violet-500",
    "bg-emerald-500",
    "bg-rose-500",
    "bg-amber-500",
    "bg-cyan-500",
    "bg-pink-500",
    "bg-indigo-500",
  ];
  const index =
    name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length;
  return colors[index];
}

export function ConversationList({
  conversations,
  activeContactId,
}: ConversationListProps) {
  const pathname = usePathname();
  const [search, setSearch] = useState("");

  const filtered = conversations.filter((c) =>
    c.contact.name.toLowerCase().includes(search.toLowerCase())
  );

  // Derive active contact from URL if not passed as prop
  const activeId =
    activeContactId ??
    (pathname.startsWith("/messages/")
      ? parseInt(pathname.split("/messages/")[1])
      : undefined);

  return (
    <div className="flex flex-col h-full bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-blue-50 rounded-lg">
            <MessageSquare className="w-4 h-4 text-blue-600" />
          </div>
          <h2 className="font-bold text-gray-900 text-base">Messages</h2>
          {conversations.length > 0 && (
            <span className="ml-auto bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {conversations.length}
            </span>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-3">
              <MessageSquare className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">
              {search ? "No results found" : "No conversations yet"}
            </p>
            {!search && (
              <p className="text-xs text-gray-400 mt-1">
                Start chatting to see messages here
              </p>
            )}
          </div>
        ) : (
          <ul>
            {filtered.map((conv) => {
              const isActive = conv.contact.id === activeId;
              const avatarColor = getAvatarColor(conv.contact.name);
              const initials = getInitials(conv.contact.name);

              return (
                <li key={conv.contact.id}>
                  <Link
                    href={`/messages/${conv.contact.id}`}
                    className={`flex items-center gap-3 px-4 py-3.5 transition-all border-b border-gray-50 last:border-0 relative group ${
                      isActive
                        ? "bg-blue-50"
                        : "hover:bg-gray-50/80"
                    }`}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <span className="absolute left-0 top-3 bottom-3 w-0.5 bg-blue-600 rounded-r-full" />
                    )}

                    {/* Avatar */}
                    <div
                      className={`h-11 w-11 relative rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-sm ${
                        conv.contact.avatarUrl ? "bg-gray-100" : avatarColor
                      }`}
                    >
                      {conv.contact.avatarUrl ? (
                        <Image
                          src={conv.contact.avatarUrl}
                          alt={conv.contact.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        initials
                      )}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h4
                          className={`text-sm font-semibold truncate ${
                            isActive ? "text-blue-700" : "text-gray-900"
                          }`}
                        >
                          {conv.contact.name}
                        </h4>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2 shrink-0">
                          {formatDistanceToNow(
                            new Date(conv.lastMessage.createdAt),
                            { addSuffix: false }
                          )}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {conv.lastMessage.senderId !== conv.contact.id && (
                          <span className="text-gray-400">You: </span>
                        )}
                        {conv.lastMessage.content}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
