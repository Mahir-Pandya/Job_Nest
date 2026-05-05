"use client";

import { useState, useEffect, useRef } from "react";
import { sendMessageAction } from "../server/messages.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, UserCircle } from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  createdAt: Date;
}

interface ChatWindowProps {
  currentUserId: number;
  receiver: {
    id: number;
    name: string;
    avatarUrl: string | null;
  };
  initialMessages: Message[];
}

export function ChatWindow({ currentUserId, receiver, initialMessages }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [content, setContent] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const newMsg: Message = {
      id: Math.random(), // Temporary ID for optimistic UI
      senderId: currentUserId,
      receiverId: receiver.id,
      content,
      createdAt: new Date(),
    };

    setMessages([...messages, newMsg]);
    setContent("");

    try {
      await sendMessageAction(receiver.id, content);
    } catch (error) {
      console.error("Failed to send message:", error);
      // Optional: Handle error (revert state)
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50 flex items-center gap-3">
        <div className="h-10 w-10 relative rounded-full overflow-hidden border bg-white">
          {receiver.avatarUrl ? (
            <Image src={receiver.avatarUrl} alt={receiver.name} fill className="object-cover" />
          ) : (
            <UserCircle className="w-full h-full text-gray-400" />
          )}
        </div>
        <div>
          <h3 className="font-bold text-gray-900">{receiver.name}</h3>
          <p className="text-xs text-green-500 font-medium">Online</p>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30"
      >
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUserId;
          return (
            <div 
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                isMe 
                  ? "bg-blue-600 text-white rounded-br-none" 
                  : "bg-white text-gray-800 border rounded-bl-none"
              }`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <p className={`text-[10px] mt-1 text-right ${isMe ? "text-blue-100" : "text-gray-400"}`}>
                  {format(new Date(msg.createdAt), "HH:mm")}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-4 border-t bg-white flex gap-2">
        <Input 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a message..."
          className="rounded-xl bg-gray-100 border-none focus-visible:ring-blue-500"
        />
        <Button type="submit" size="icon" className="rounded-xl bg-blue-600 hover:bg-blue-700">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
