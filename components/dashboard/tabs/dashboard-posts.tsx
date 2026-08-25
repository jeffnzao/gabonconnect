"use client";

import { useState } from "react";
import Link from "next/link";
import type { UserDashboardData } from "@/lib/dashboard";
import { deleteUserPost } from "@/lib/dashboard-actions";
import { useMessages } from "@/components/i18n-provider";

interface DashboardPostsProps {
  posts: UserDashboardData["posts"];
}

export default function DashboardPosts({ posts }: DashboardPostsProps) {
  const messages = useMessages();
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (postId: string) => {
    if (!confirm(messages.dashboard.deletePost + "?")) return;
    setDeleting(postId);
    try {
      await deleteUserPost(postId);
      window.location.reload();
    } catch (error) {
      console.error("Failed to delete post:", error);
      setDeleting(null);
    }
  };

  if (posts.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center">
        <p className="text-slate-600">{messages.dashboard.noPosts}</p>
        <Link href="/feed" className="mt-4 inline-block text-emerald-600 hover:text-emerald-700 font-medium">
          {messages.dashboard.goToFeed} →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div key={post.id} className="flex items-start justify-between rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex-1">
            <p className="line-clamp-3 text-slate-900">{post.content}</p>
            <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600">
              <span>📅 {new Date(post.createdAt).toLocaleDateString("fr-FR")}</span>
              <span>❤️ {post.likeCount} j&apos;aime</span>
              <span>💬 {post.commentCount} commentaire(s)</span>
              <span>👁️ {post.visibility}</span>
            </div>
          </div>
          <button
            onClick={() => handleDelete(post.id)}
            disabled={deleting === post.id}
            className="ml-4 flex-shrink-0 px-3 py-1 text-sm rounded-md bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
          >
            {messages.dashboard.deletePost}
          </button>
        </div>
      ))}
    </div>
  );
}
