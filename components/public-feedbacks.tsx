"use client";

import { useEffect, useState } from "react";

// Client Supabase navigateur direct
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
//const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Feedback {
  id: string;
  created_at: string;
  likes?: string;
  ideas?: string;
  dislikes?: string;
  bugs?: string;
}

export function PublicFeedbacks() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeedbacks() {
      if (!supabaseUrl || !supabaseAnonKey) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("feedbacks")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (data) {
        setFeedbacks(data as Feedback[]);
      }
      setLoading(false);
    }

    fetchFeedbacks();
  }, []);

  if (loading) {
    return (
      <div className="text-center text-muted-foreground py-8 animate-pulse">
        Chargement des avis...
      </div>
    );
  }

  if (feedbacks.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8 border rounded-lg bg-card/50">
        Aucun avis publié pour le moment. Soyez le premier à donner le vôtre !
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 my-6">
      {feedbacks.map((item) => (
        <div key={item.id} className="rounded-lg border bg-card p-4 shadow-sm text-card-foreground">
          <span className="text-xs text-muted-foreground block mb-2">
            {new Date(item.created_at).toLocaleDateString("fr-FR")}
          </span>
          {item.likes && (
            <p className="text-sm mb-2">
              <strong className="text-emerald-600">Ce qu'il a aimé :</strong> {item.likes}
            </p>
          )}
          {item.ideas && (
            <p className="text-sm mb-2">
              <strong className="text-blue-600">Idée :</strong> {item.ideas}
            </p>
          )}
          {item.dislikes && (
            <p className="text-sm mb-2">
              <strong className="text-amber-600">À améliorer :</strong> {item.dislikes}
            </p>
          )}
          {item.bugs && (
            <p className="text-sm">
              <strong className="text-red-600">Bug signalé :</strong> {item.bugs}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}