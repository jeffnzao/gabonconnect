import MessageComposer from "@/components/messages/message-composer";

interface ConversationThreadProps {
  conversationId: string;
  otherName: string;
  messages: Array<{ id: string; content: string; senderId: string; createdAt: Date }>;
  currentUserId: string;
}

export default function ConversationThread({ conversationId, otherName, messages, currentUserId }: ConversationThreadProps) {
  return (
    <section className="flex min-h-[520px] flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-5 py-4"><h2 className="font-semibold text-slate-900">{otherName}</h2></header>
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-5">{messages.length === 0 ? <p className="m-auto text-sm text-slate-500">Start the conversation.</p> : messages.map((message) => <div key={message.id} className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${message.senderId === currentUserId ? "self-end bg-emerald-500 text-slate-950" : "self-start bg-white text-slate-700"}`}><p className="whitespace-pre-wrap">{message.content}</p><time className="mt-1 block text-[10px] opacity-60">{message.createdAt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</time></div>)}</div>
      <MessageComposer conversationId={conversationId} />
    </section>
  );
}