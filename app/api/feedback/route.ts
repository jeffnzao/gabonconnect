import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { getMessages, isLocale, type Locale } from "@/lib/i18n";

const feedbackSchema = z
  .object({
    likes: z.string().trim().max(2000).optional().default(""),
    ideas: z.string().trim().max(2000).optional().default(""),
    dislikes: z.string().trim().max(2000).optional().default(""),
    bugs: z.string().trim().max(2000).optional().default(""),
    locale: z.enum(["fr", "en"]).default("fr"),
    website: z.string().max(0).optional().default(""),
  })
  .refine(
    (feedback) =>
      Boolean(feedback.likes || feedback.ideas || feedback.dislikes || feedback.bugs),
    { message: "At least one feedback field is required." }
  );

export async function POST(request: Request) {
  let locale: Locale = "fr";
  try {
    const body = await request.json().catch(() => ({}));
    locale = isLocale(body?.locale) ? body.locale : "fr";
    const messages = getMessages(locale);
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: messages.feedback.storageUnavailable }, { status: 503 });
    }

    const feedback = feedbackSchema.parse(body);

    if (feedback.website) {
      return NextResponse.json({ success: true });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { error } = await supabase.from("feedbacks").insert({
      likes: feedback.likes || null,
      ideas: feedback.ideas || null,
      dislikes: feedback.dislikes || null,
      bugs: feedback.bugs || null,
      locale: feedback.locale,
    });

    if (error) {
      console.error("[supabase-insert-error]", error.message);
      return NextResponse.json({ error: messages.feedback.storeFailed }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: getMessages(locale).feedback.invalid }, { status: 400 });
    }

    return NextResponse.json({ error: getMessages(locale).feedback.submitFailed }, { status: 500 });
  }
}