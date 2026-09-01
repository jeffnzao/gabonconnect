"use client";

import MessageComposer from "@/components/messages/message-composer";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMessages } from "@/components/i18n-provider";
import Image from "next/image";
import gabonConnectLogo from "@/app/gabonconnect360.svg";

interface ConversationThreadProps {
  conversationId: string;
  otherName: string;
  messages: Array<{ id: string; content: string; senderId: string; createdAt: Date }>;
  currentUserId: string;
}

export default function ConversationThread({ conversationId, otherName, messages, currentUserId }: ConversationThreadProps) {
  const labels = useMessages();
  const router = useRouter();

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    const intervalId = window.setInterval(refresh, 5000);
    return () => window.clearInterval(intervalId);
  }, [router]);

  return (
    <section className="flex min-h-130 flex-col bg-slate-50">
      <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-5 py-4"><Image src={gabonConnectLogo} alt="" width={28} height={28} className="h-7 w-7" /><h2 className="font-semibold text-slate-900">{otherName}</h2></header>
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-5">{messages.length === 0 ? <p className="m-auto text-sm text-slate-500">{labels.messaging.startConversation}</p> : messages.map((message) => <div key={message.id} className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${message.senderId === currentUserId ? "self-end bg-emerald-500 text-slate-950" : "self-start bg-white text-slate-700"}`}><p className="whitespace-pre-wrap">{message.content}</p><time className="mt-1 block text-[10px] opacity-60">{message.createdAt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</time></div>)}</div>
      <MessageComposer conversationId={conversationId} />
    </section>
  );
}