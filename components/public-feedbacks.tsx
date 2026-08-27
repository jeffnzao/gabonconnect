"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useMessages } from "@/components/i18n-provider";
import type { Locale } from "@/lib/i18n-config";

// Client Supabase navigateur direct
interface Feedback {
  id: string;
  created_at: string;
  likes?: string;
  ideas?: string;
  dislikes?: string;
  bugs?: string;
  status?: string;
  is_published?: boolean;
}

export function PublicFeedbacks({ locale }: { locale: Locale }) {
  const messages = useMessages();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchFeedbacks() {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!supabaseUrl || !supabaseAnonKey) {
        if (isMounted) {
          setError(messages.feedback.unavailable);
          setLoading(false);
        }
        return;
      }

      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data, error: fetchError } = await supabase
        .from("feedbacks")
        .select("id, created_at, likes, ideas, dislikes, bugs")
        .eq("is_published", true)
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(10);

      if (!isMounted) return;
      if (fetchError) {
        setError(messages.feedback.unavailable);
      } else {
        setFeedbacks((data ?? []) as Feedback[]);
      }
      setLoading(false);
    }

    fetchFeedbacks();
    return () => {
      isMounted = false;
    };
  }, [messages.feedback.unavailable]);

  if (loading) {
    return (
      <div className="text-center text-muted-foreground py-8 animate-pulse">
        {messages.feedback.loading}
      </div>
    );
  }

  if (error) {
    return (
      <div role="status" className="rounded-lg border border-slate-200 bg-slate-50 px-6 py-8 text-center text-sm text-slate-500">
        {error}
      </div>
    );
  }

  if (feedbacks.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8 border rounded-lg bg-card/50">
        {messages.feedback.empty}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 my-6">
      {feedbacks.map((item) => (
        <div key={item.id} className="rounded-lg border bg-card p-4 shadow-sm text-card-foreground">
          <span className="text-xs text-muted-foreground block mb-2">
            {new Date(item.created_at).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US")}
          </span>
          {item.likes && (
            <p className="text-sm mb-2">
              <strong className="text-emerald-600">{messages.feedback.likesLabel}:</strong> {item.likes}
            </p>
          )}
          {item.ideas && (
            <p className="text-sm mb-2">
              <strong className="text-blue-600">{messages.feedback.ideasLabel}:</strong> {item.ideas}
            </p>
          )}
          {item.dislikes && (
            <p className="text-sm mb-2">
              <strong className="text-amber-600">{messages.feedback.dislikesLabel}:</strong> {item.dislikes}
            </p>
          )}
          {item.bugs && (
            <p className="text-sm">
              <strong className="text-red-600">{messages.feedback.bugsLabel}:</strong> {item.bugs}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}