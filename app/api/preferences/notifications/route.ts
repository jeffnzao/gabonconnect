import { NextResponse } from "next/server";
import { z } from "zod";
import { getUserNotificationPreferences, updateUserNotificationPreferences } from "@/lib/actions/notifications";

const updateSchema = z.object({
  inApp: z.boolean(),
  email: z.boolean(),
  push: z.boolean(),
});

function errorStatus(error: unknown): number {
  if (error instanceof z.ZodError) return 400;
  if (error instanceof Error && error.message === "Authentication required.") return 401;
  if (error instanceof Error && error.message === "Invalid notification preferences.") return 400;
  return 500;
}

export async function GET() {
  try {
    const preferences = await getUserNotificationPreferences();
    return NextResponse.json({ preferences });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to load notification preferences." }, { status: errorStatus(error) });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const input = updateSchema.parse(body);
    const preferences = await updateUserNotificationPreferences(input);
    return NextResponse.json({ preferences });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to update notification preferences." }, { status: errorStatus(error) });
  }
}
