import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ConversationList from "@/components/messages/conversation-list";
import ConversationThread from "@/components/messages/conversation-thread";
import { getCurrentUser } from "@/lib/auth";
import { getConversationMessages, getUserConversations } from "@/lib/messaging";
import { markConversationAsRead, getOrCreateConversationForUser } from "@/lib/messaging-actions";
import { getLocale, getMessages } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Messages | GabonConnect" };

interface MessagesPageProps { 
  searchParams: Promise<Record<string, string | string[] | undefined>> 
}

function first(value: string | string[] | undefined): string | undefined { 
  return Array.isArray(value) ? value[0] : value; 
}

export default async function MessagesPage({ searchParams }: MessagesPageProps) {
  const messages = getMessages(await getLocale());
  const user = await getCurrentUser().catch(() => null);

  if (!user) {
    return <EmptyMessages message={messages.messaging.loginToMessage} />;
  }

  const params = await searchParams;
  const requestedId = first(params.conversationId);
  const targetUserId = first(params.userId) ?? first(params.recipientId);

  // Redirection propre si un targetUserId est passé dans la query string
  if (!requestedId && targetUserId) {
    try {
      const newConversation = await getOrCreateConversationForUser(targetUserId);
      if (newConversation?.id) {
        redirect(`/messages?conversationId=${newConversation.id}`);
      }
    } catch {
      // Évite le crash Server Component si la création échoue
    }
  }

  let conversations: Awaited<ReturnType<typeof getUserConversations>> = [];
  try {
    conversations = await getUserConversations(user.id);
  } catch {
    conversations = [];
  }

  const active = conversations.find((conversation) => conversation.id === requestedId) ?? conversations[0];
  let thread = null;

  if (active) {
    try {
      thread = await getConversationMessages(active.id, user.id);
      if (thread) await markConversationAsRead(active.id);
    } catch {
      thread = null;
    }
  }

  const otherName = active?.otherUser.profile 
    ? `${active.otherUser.profile.firstName} ${active.otherUser.profile.lastName}` 
    : messages.messaging.member;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
        {messages.messaging.messages}
      </h1>
      <div className="mt-8 grid flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white md:grid-cols-[280px_1fr]">
        <ConversationList conversations={conversations} activeId={active?.id} />
        {thread && active ? (
          <ConversationThread 
            conversationId={active.id} 
            otherName={otherName} 
            messages={thread.messages} 
            currentUserId={user.id} 
          />
        ) : (
          <div className="flex min-h-130 items-center justify-center bg-slate-50 px-6 text-center text-sm text-slate-500">
            {messages.messaging.noConversations}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyMessages({ message }: { message: string }) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 items-center justify-center px-6 py-16">
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-8 py-12 text-center text-sm text-slate-600">
        {message}
      </div>
    </main>
  );
}