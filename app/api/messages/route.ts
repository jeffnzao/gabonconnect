import { NextResponse } from "next/server";
import { z } from "zod";
import { ensureUser } from "@/lib/auth";
import { getConversationMessages, getUserConversations } from "@/lib/messaging";
import { markConversationAsRead, sendMessage } from "@/lib/messaging-actions";

const messageSchema = z.object({ conversationId: z.string().trim().min(1), content: z.string().trim().min(1).max(5000) });
const conversationSchema = z.object({ conversationId: z.string().trim().min(1) });

export async function GET(request: Request) {
  const user = await ensureUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const conversationId = new URL(request.url).searchParams.get("conversationId");
  if (!conversationId) return NextResponse.json({ conversations: await getUserConversations(user.id) });
  const thread = await getConversationMessages(conversationId, user.id);
  if (!thread) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  return NextResponse.json({ thread });
}

export async function POST(request: Request) {
  const user = await ensureUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const parsed = messageSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid message payload." }, { status: 400 });
  const result = await sendMessage(parsed.data.conversationId, parsed.data.content);
  return result.success ? NextResponse.json(result, { status: 201 }) : NextResponse.json(result, { status: 400 });
}

export async function PATCH(request: Request) {
  const user = await ensureUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const parsed = conversationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid conversation payload." }, { status: 400 });
  try { await markConversationAsRead(parsed.data.conversationId); return NextResponse.json({ success: true }); }
  catch { return NextResponse.json({ error: "Conversation not found." }, { status: 404 }); }
}
