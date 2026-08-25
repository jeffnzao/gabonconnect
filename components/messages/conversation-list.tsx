import Link from "next/link";
import { getPublicStatus } from "@/lib/messaging";

interface ConversationListProps {
  conversations: Array<{
    id: string;
    otherUser: { profile: { firstName: string; lastName: string; status: "ONLINE" | "AWAY" | "BUSY" | "OFFLINE" | "INCOGNITO"; showStatus: boolean; visibility: "PUBLIC" | "PRIVATE" } | null };
    latestMessage: { content: string; senderId: string; isRead: boolean } | null;
    unreadCount: number;
  }>;
  activeId?: string;
}

export default function ConversationList({ conversations, activeId }: ConversationListProps) {
  return (
    <aside className="border-b border-slate-200 bg-white md:border-b-0 md:border-r">
      <div className="border-b border-slate-200 px-5 py-4"><h2 className="font-semibold text-slate-900">Conversations</h2></div>
      {conversations.length === 0 ? <p className="p-5 text-sm text-slate-500">No conversations yet.</p> : <nav>{conversations.map((conversation) => { const profile = conversation.otherUser.profile; const name = profile ? `${profile.firstName} ${profile.lastName}` : "Member"; const status = profile ? getPublicStatus(profile) : null; return <Link key={conversation.id} href={`/messages?conversationId=${conversation.id}`} className={`block border-b border-slate-100 px-5 py-4 hover:bg-slate-50 ${activeId === conversation.id ? "bg-emerald-50" : ""}`}><p className="flex items-center gap-2 text-sm font-semibold text-slate-900"><span className={`h-2 w-2 rounded-full ${status === "ONLINE" ? "bg-emerald-500" : "bg-slate-300"}`} aria-hidden />{name}{conversation.unreadCount > 0 && <span className="ml-auto rounded-full bg-emerald-600 px-2 py-0.5 text-[11px] text-white">{conversation.unreadCount}</span>}</p><p className="mt-1 truncate text-xs text-slate-500">{conversation.latestMessage?.content ?? "No messages yet."}</p></Link>; })}</nav>}
    </aside>
  );
}