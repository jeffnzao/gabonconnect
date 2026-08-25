import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ConversationList from "@/components/messages/conversation-list";
import ConversationThread from "@/components/messages/conversation-thread";
import { getCurrentUser } from "@/lib/auth";
import { getConversationMessages, getUserConversations } from "@/lib/messaging";
import { markConversationAsRead } from "@/lib/messaging-actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Messages | GabonConnect" };

interface MessagesPageProps { searchParams: Promise<Record<string, string | string[] | undefined>> }
function first(value: string | string[] | undefined): string | undefined { return Array.isArray(value) ? value[0] : value; }

export default async function MessagesPage({ searchParams }: MessagesPageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirectTo=/messages");
  const conversations = await getUserConversations(user.id);
  const requestedId = first((await searchParams).conversationId);
  const active = conversations.find((conversation) => conversation.id === requestedId) ?? conversations[0];
  let thread = null;
  if (active) {
    thread = await getConversationMessages(active.id, user.id);
    await markConversationAsRead(active.id);
  }
  const otherName = active?.otherUser.profile ? `${active.otherUser.profile.firstName} ${active.otherUser.profile.lastName}` : "Member";

  return <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-10"><h1 className="text-3xl font-semibold tracking-tight text-slate-900">Messages</h1><div className="mt-8 grid flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white md:grid-cols-[280px_1fr]"> <ConversationList conversations={conversations} activeId={active?.id} />{thread ? <ConversationThread conversationId={active.id} otherName={otherName} messages={thread.messages} currentUserId={user.id} /> : <div className="flex min-h-[520px] items-center justify-center bg-slate-50 text-sm text-slate-500">Select a conversation to start messaging.</div>}</div></div>;
}