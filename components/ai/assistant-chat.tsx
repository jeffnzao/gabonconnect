"use client";

import { useState, type ReactNode } from "react";
import { Bot, Send, X } from "lucide-react";
import { useMessages } from "@/components/i18n-provider";
import type { Locale } from "@/lib/i18n-config";
import type { AssistantSource } from "@/lib/ai/assistant";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: AssistantSource[];
}

/** Rendu Markdown minimal (gras, listes a puces, liens) sans dependance externe ni HTML brut. */
function renderMarkdownLite(text: string): ReactNode[] {
  return text.split("\n").map((line, lineIndex) => {
    const isListItem = line.trim().startsWith("- ");
    const content = isListItem ? line.trim().slice(2) : line;
    const tokens = content.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\(https?:\/\/[^\s)]+\))/g).filter(Boolean);
    const nodes = tokens.map((token, tokenIndex) => {
      const boldMatch = token.match(/^\*\*([^*]+)\*\*$/);
      if (boldMatch) return <strong key={tokenIndex}>{boldMatch[1]}</strong>;
      const linkMatch = token.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
      if (linkMatch) {
        return (
          <a key={tokenIndex} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline">
            {linkMatch[1]}
          </a>
        );
      }
      return <span key={tokenIndex}>{token}</span>;
    });
    return isListItem ? (
      <li key={lineIndex} className="ml-4 list-disc">{nodes}</li>
    ) : (
      <p key={lineIndex}>{nodes}</p>
    );
  });
}

function SourceBadge({ source }: { source: AssistantSource }) {
  const label = source.sourceName ?? source.canonicalUrl ?? "GabonConnect";
  const isLink = Boolean(source.canonicalUrl && /^https?:\/\//i.test(source.canonicalUrl));
  const className = "inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700";
  return isLink ? (
    <a href={source.canonicalUrl!} target="_blank" rel="noopener noreferrer" className={`${className} hover:bg-emerald-100`}>
      {label}
    </a>
  ) : (
    <span className={className}>{label}</span>
  );
}

export default function AssistantChat({ locale, embedded = false }: { locale: Locale; embedded?: boolean }) {
  const messages = useMessages();
  const [isOpen, setIsOpen] = useState(embedded);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function ask(prompt: string) {
    const question = prompt.trim();
    if (!question || isSending) return;
    setError(null);
    setChat((current) => [...current, { role: "user", content: question }]);
    setInput("");
    setIsSending(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt: question, locale }),
      });
      if (!response.ok) throw new Error("assistant_request_failed");
      const data = (await response.json()) as { answer: string; sources: AssistantSource[] };
      setChat((current) => [...current, { role: "assistant", content: data.answer, sources: data.sources }]);
    } catch {
      setError(messages.assistant.error);
    }
    setIsSending(false);
  }

  function close() {
    setIsOpen(false);
    setError(null);
  }

  return (
    <>
      {!embedded && <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={messages.assistant.launcherLabel}
        className="fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-slate-950 shadow-lg shadow-slate-900/20 hover:bg-emerald-400"
      >
        <Bot className="h-6 w-6" aria-hidden />
      </button>}

      {isOpen && (
        <div
          className={embedded ? "w-full" : "fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-4 sm:items-center"}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <section role="dialog" aria-modal={!embedded} aria-labelledby="assistant-title" className={`flex w-full flex-col overflow-hidden rounded-2xl bg-white ${embedded ? "min-h-130 border border-slate-200 shadow-sm" : "max-h-[85vh] max-w-lg shadow-2xl"}`}>
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5">
              <div>
                <h2 id="assistant-title" className="text-lg font-semibold text-slate-900">{messages.assistant.title}</h2>
                <p className="mt-1 text-xs text-slate-500">{messages.assistant.subtitle}</p>
              </div>
              {!embedded && <button type="button" onClick={close} aria-label={messages.assistant.close} className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900">
                <X className="h-5 w-5" aria-hidden />
              </button>}
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              {chat.length === 0 && (
                <div className="space-y-3">
                  <p className="text-sm text-slate-600">{messages.assistant.empty}</p>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{messages.assistant.suggestionsTitle}</p>
                    {[messages.assistant.suggestion1, messages.assistant.suggestion2, messages.assistant.suggestion3].map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => ask(suggestion)}
                        className="block w-full rounded-xl border border-slate-200 px-4 py-2 text-left text-sm text-slate-700 hover:border-emerald-300 hover:bg-emerald-50"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {chat.map((message, index) => (
                <div key={index} className={message.role === "user" ? "flex justify-end" : "flex justify-start"}>
                  <div className={message.role === "user" ? "max-w-[85%] rounded-2xl bg-emerald-500 px-4 py-2 text-sm text-slate-950" : "max-w-[85%] space-y-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-800"}>
                    <div className="space-y-1">{renderMarkdownLite(message.content)}</div>
                    {message.sources && message.sources.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        <span className="text-xs font-semibold text-slate-500">{messages.assistant.sourcesLabel} :</span>
                        {message.sources.map((source, sourceIndex) => (
                          <SourceBadge key={sourceIndex} source={source} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
              {isSending && <p className="text-xs text-slate-400">{messages.assistant.sending}</p>}
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                ask(input);
              }}
              className="flex items-center gap-2 border-t border-slate-100 p-4"
            >
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={messages.assistant.placeholder}
                maxLength={2000}
                className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-sm outline-none focus:border-emerald-400"
              />
              <button
                type="submit"
                disabled={isSending || !input.trim()}
                aria-label={messages.assistant.send}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-slate-950 disabled:opacity-50"
              >
                <Send className="h-4 w-4" aria-hidden />
              </button>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
