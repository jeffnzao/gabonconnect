import { NextResponse } from "next/server";
import { z } from "zod";
import { getUserPreferences, updateUserPreferences } from "@/lib/actions/preferences";

function errorStatus(error: unknown): number {
  if (error instanceof z.ZodError) return 400;
  if (error instanceof Error && error.message === "Authentication required.") return 401;
  if (error instanceof Error && (error.message === "Invalid city." || error.message === "Invalid country." || error.message.includes("does not belong"))) return 400;
  return 500;
}

export async function GET() {
  try {
    const preferences = await getUserPreferences();
    return NextResponse.json({ preferences });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to load preferences." }, { status: errorStatus(error) });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const preferences = await updateUserPreferences(body);
    return NextResponse.json({ preferences });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to update preferences." }, { status: errorStatus(error) });
  }
}
