import { MessageSquare } from "lucide-react";

export default function MessagesPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-white border rounded-2xl shadow-sm border-gray-100">
      <div className="bg-blue-50 p-6 rounded-full mb-4">
        <MessageSquare className="w-12 h-12 text-blue-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-900">Your Inbox</h3>
      <p className="text-gray-500 mt-2">Select a conversation to start messaging.</p>
    </div>
  );
}
