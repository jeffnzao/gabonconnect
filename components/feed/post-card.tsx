"use client";

import { useActionState, useState } from "react";
import { MessageCircle, Share2, ThumbsUp } from "lucide-react";
import { addPostComment, togglePostLike } from "@/lib/feed-actions";

interface PostCardProps {
  post: {
    id: string;
    content: string;
    type: string;
    createdAt: Date;
    hasLiked: boolean;
    _count: { likes: number; comments: number };
    author: { profile: { firstName: string; lastName: string; photo: string | null } | null };
    association: { name: string } | null;
    comments: Array<{ id: string; content: string; createdAt: Date; author: { profile: { firstName: string; lastName: string } | null } }>;
  };
}

export default function PostCard({ post }: PostCardProps) {
  const [liked, likeAction, likePending] = useActionState(async () => {
    const result = await togglePostLike(post.id);
    return result.liked;
  }, post.hasLiked);
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentMessage, commentAction, commentPending] = useActionState(async (_previous: string | null, formData: FormData) => {
    try {
      await addPostComment(post.id, String(formData.get("content") ?? ""));
      return "Comment added.";
    } catch (error) {
      return error instanceof Error ? error.message : "Could not add comment.";
    }
  }, null);
  const author = post.association?.name ?? `${post.author.profile?.firstName ?? "GabonConnect"} ${post.author.profile?.lastName ?? "member"}`;

  async function sharePost() {
    await navigator.clipboard.writeText(`${window.location.origin}/feed#post-${post.id}`);
  }

  return (
    <article id={`post-${post.id}`} className="rounded-2xl border border-slate-200 bg-white p-5">
      <header className="flex items-center justify-between gap-4">
        <div><p className="font-semibold text-slate-900">{author}</p><p className="text-xs text-slate-500">{post.type.replace("_", " ")} · {post.createdAt.toLocaleDateString("en-US")}</p></div>
      </header>
      <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-slate-700">{post.content}</p>
      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
        <form action={likeAction}><button type="submit" disabled={likePending} className={liked ? "inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700" : "inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"}><ThumbsUp className="h-4 w-4" aria-hidden />{liked ? post._count.likes + 1 : post._count.likes}</button></form>
        <button type="button" onClick={() => setCommentOpen((open) => !open)} className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"><MessageCircle className="h-4 w-4" aria-hidden />{post._count.comments} Comment</button>
        <button type="button" onClick={sharePost} className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"><Share2 className="h-4 w-4" aria-hidden />Share</button>
      </div>
      {commentOpen && <div className="mt-4 space-y-3">{post.comments.map((comment) => <p key={comment.id} className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700"><span className="font-semibold">{comment.author.profile ? `${comment.author.profile.firstName} ${comment.author.profile.lastName}` : "Member"}</span>{" "}{comment.content}</p>)}<form action={commentAction} className="flex gap-2"><input name="content" required maxLength={2000} placeholder="Write a comment" className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm" /><button type="submit" disabled={commentPending} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">Comment</button>{commentMessage && <span className="sr-only">{commentMessage}</span>}</form></div>}
    </article>
  );
}