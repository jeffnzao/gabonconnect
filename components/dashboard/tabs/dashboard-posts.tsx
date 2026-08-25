"use client";

import { useState } from "react";
import Link from "next/link";
import type { UserDashboardData } from "@/lib/dashboard";
import { deleteUserPost } from "@/lib/dashboard-actions";
import { updatePost } from "@/lib/feed-actions";

interface DashboardPostsProps {
  posts: UserDashboardData["posts"];
}

export default function DashboardPosts({ posts }: DashboardPostsProps) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState<string | null>(null);

  const handleDelete = async (postId: string) => {
    if (!confirm("Êtes-vous s&apos;ur de vouloir supprimer cette publication ?")) return;
    setDeleting(postId);
    try {
      await deleteUserPost(postId);
      window.location.reload();
    } catch (error) {
      console.error("Failed to delete post:", error);
      setDeleting(null);
    }
  };

  const handleSave = async (postId: string) => {
    const trimmed = draft.trim();
    if (!trimmed || trimmed.length > 5000) return;
    setSaving(postId);
    try {
      await updatePost(postId, { content: trimmed });
      setEditingId(null);
      setDraft("");
      window.location.reload();
    } catch (error) {
      console.error("Failed to update post:", error);
    } finally {
      setSaving(null);
    }
  };

  if (posts.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center">
        <p className="text-slate-600">Vous n&apos;avez pas publi\u00e9 d&apos;article.</p>
        <Link href="/feed" className="mt-4 inline-block text-emerald-600 hover:text-emerald-700 font-medium">
          Aller au feed →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div key={post.id} className="rounded-lg border border-slate-200 bg-white p-4">
          {editingId === post.id ? (
            <div className="space-y-3">
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                rows={5}
                maxLength={5000}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-400"
              />
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500">{draft.length}/5000</span>
                <div className="flex gap-2">
                  <button type="button" onClick={() => { setEditingId(null); setDraft(""); }} className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700">Annuler</button>
                  <button type="button" onClick={() => handleSave(post.id)} disabled={saving === post.id} className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60">{saving === post.id ? "Enregistrement..." : "Enregistrer"}</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="line-clamp-3 text-slate-900">{post.content}</p>
                <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600">
                  <span>📅 {new Date(post.createdAt).toLocaleDateString("fr-FR")}</span>
                  <span>❤️ {post.likeCount} j&apos;aime</span>
                  <span>💬 {post.commentCount} commentaire(s)</span>
                  <span>👁️ {post.visibility}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setEditingId(post.id);
                    setDraft(post.content);
                  }}
                  className="px-3 py-1 text-sm rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200"
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(post.id)}
                  disabled={deleting === post.id}
                  className="px-3 py-1 text-sm rounded-md bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
                >
                  Supprimer
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
