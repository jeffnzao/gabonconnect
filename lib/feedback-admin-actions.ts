"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ensureUser } from "@/lib/auth";
import { isAdminRole } from "@/lib/imports";

const statuses = ["pending", "published", "hidden", "processed", "archived"] as const;
type FeedbackStatus = (typeof statuses)[number];

export interface AdminFeedback {
  id: string;
  created_at: string;
  likes: string | null;
  ideas: string | null;
  dislikes: string | null;
  bugs: string | null;
  locale: "fr" | "en";
  status: FeedbackStatus;
  is_published: boolean;
}

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("Supabase admin configuration is missing.");
  }
  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function requireAdmin() {
  const user = await ensureUser();
  if (!user || !isAdminRole(user.role)) {
    throw new Error("Admin access required.");
  }
}

function getStatus(value: FormDataEntryValue | null): FeedbackStatus {
  if (typeof value === "string" && statuses.includes(value as FeedbackStatus)) {
    return value as FeedbackStatus;
  }
  throw new Error("Invalid feedback status.");
}

function feedbackRedirect(message: "updated" | "deleted" | "error"): never {
  revalidatePath("/admin/feedbacks");
  redirect(`/admin/feedbacks?message=${message}`);
}

export async function listFeedbacksForAdmin({ status, page }: { status?: string; page: number }) {
  await requireAdmin();
  const client = getAdminClient();
  const pageSize = 10;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  let query = client
    .from("feedbacks")
    .select("id, created_at, likes, ideas, dislikes, bugs, locale, status, is_published", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (status && statuses.includes(status as FeedbackStatus)) {
    query = query.eq("status", status);
  }

  const { data, count, error } = await query;
  if (error) throw error;
  return { feedbacks: (data ?? []) as AdminFeedback[], total: count ?? 0, pageSize };
}

export async function moderateFeedback(formData: FormData) {
  try {
    await requireAdmin();
    const id = formData.get("id");
    const status = getStatus(formData.get("status"));
    if (typeof id !== "string" || !id) throw new Error("Invalid feedback id.");

    const { error } = await getAdminClient()
      .from("feedbacks")
      .update({ status, is_published: status === "published" })
      .eq("id", id);
    if (error) throw error;
    feedbackRedirect("updated");
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error;
    feedbackRedirect("error");
  }
}

export async function deleteFeedback(formData: FormData) {
  try {
    await requireAdmin();
    const id = formData.get("id");
    if (typeof id !== "string" || !id) throw new Error("Invalid feedback id.");

    const { error } = await getAdminClient().from("feedbacks").delete().eq("id", id);
    if (error) throw error;
    feedbackRedirect("deleted");
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error;
    feedbackRedirect("error");
  }
}
