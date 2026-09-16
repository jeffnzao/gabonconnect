import { NextResponse } from "next/server";
import { z } from "zod";
import { ensureUser } from "@/lib/auth";
import { getUserNotifications, markAsReadAction } from "@/app/actions/notifications";

const readSchema = z.object({ notificationId: z.string().trim().min(1) });

export async function GET() {
  try {
    const user = await ensureUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    return NextResponse.json({ notifications: await getUserNotifications(user.id) });
  } catch { return NextResponse.json({ error: "Unable to load notifications." }, { status: 500 }); }
}

export async function PATCH(request: Request) {
  try {
    const user = await ensureUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const { notificationId } = readSchema.parse(await request.json());
    const notifications = await getUserNotifications(user.id);
    if (!notifications.some((notification) => notification.id === notificationId)) return NextResponse.json({ error: "Notification not found." }, { status: 404 });
    await markAsReadAction(notificationId);
    return NextResponse.json({ success: true });
  } catch (error) { return NextResponse.json({ error: error instanceof z.ZodError ? "Invalid notification payload." : "Unable to update notification." }, { status: error instanceof z.ZodError ? 400 : 500 }); }
}
