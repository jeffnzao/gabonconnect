import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  try {
    const body = await request.json();
    const feedback = feedbackSchema.parse(body);

    if (feedback.website) {
      return NextResponse.json({ success: true });
    }

    console.info(
      "[visitor-feedback]",
      JSON.stringify({
        receivedAt: new Date().toISOString(),
        locale: feedback.locale,
        likes: feedback.likes,
        ideas: feedback.ideas,
        dislikes: feedback.dislikes,
        bugs: feedback.bugs,
      })
    );

    // Insertion directe dans la table Supabase feedbacks
    if (supabaseUrl && supabaseAnonKey) {
      const { error } = await supabase.from("feedbacks").insert({
        likes: feedback.likes || null,
        ideas: feedback.ideas || null,
        dislikes: feedback.dislikes || null,
        bugs: feedback.bugs || null,
        locale: feedback.locale,
      });

      if (error) {
        console.error("[supabase-insert-error]", error);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid feedback." }, { status: 400 });
    }

    return NextResponse.json({ error: "Unable to submit feedback." }, { status: 500 });
  }
}