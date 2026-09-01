import { NextResponse } from "next/server";
import { z } from "zod";
import { isLocale, type Locale } from "@/lib/i18n";
import { answerFromRAG } from "@/lib/ai/assistant";

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().trim().min(1).max(2000),
});

const bodySchema = z
  .object({
    prompt: z.string().trim().min(1).max(2000).optional(),
    messages: z.array(chatMessageSchema).max(50).optional(),
    locale: z.string().optional(),
  })
  .refine((data) => Boolean(data.prompt?.trim()) || (data.messages?.some((message) => message.role === "user") ?? false), {
    message: "A prompt or a user message is required.",
  });

function extractPrompt(data: z.infer<typeof bodySchema>): string {
  if (data.prompt?.trim()) return data.prompt.trim();
  const lastUserMessage = [...(data.messages ?? [])].reverse().find((message) => message.role === "user");
  return lastUserMessage?.content.trim() ?? "";
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const parsed = bodySchema.parse(body);
    const locale: Locale = isLocale(parsed.locale) ? parsed.locale : "fr";
    const prompt = extractPrompt(parsed);
    if (!prompt) {
      return NextResponse.json({ error: "A prompt or a user message is required." }, { status: 400 });
    }

    const result = await answerFromRAG(prompt, locale);
    return NextResponse.json({ answer: result.answer, sources: result.sources, grounded: result.grounded });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    console.error("[api/ai/chat] failed:", error);
    return NextResponse.json({ error: "The assistant is unavailable right now." }, { status: 500 });
  }
}
