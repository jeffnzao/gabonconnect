import type { Metadata } from "next";
import Breadcrumb from "@/components/explore/breadcrumb";
import CreatePostForm from "@/components/feed/create-post-form";
import PostCard from "@/components/feed/post-card";
import { getCurrentUser } from "@/lib/auth";
import { getFeedPosts, type FeedViewer } from "@/lib/feed";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Community Feed | GabonConnect" };

export default async function FeedPage() {
  const user = await getCurrentUser();
  let viewer: FeedViewer | null = null;
  let associations: Array<{ id: string; name: string }> = [];

  if (user) {
    const profile = await prisma.profile.findUnique({ where: { userId: user.id }, select: { id: true } });
    const memberships = profile
      ? await prisma.associationMember.findMany({ where: { profileId: profile.id, association: { status: "APPROVED" } }, select: { association: { select: { id: true, name: true } } }, orderBy: { association: { name: "asc" } } })
      : [];
    viewer = { id: user.id, isMember: memberships.length > 0 };
    associations = memberships.map((membership) => membership.association);
  }

  const posts = await getFeedPosts({}, viewer);

  return (
    <div className="flex flex-1 flex-col bg-slate-50">
      <section className="border-b border-slate-100 bg-white"><div className="mx-auto w-full max-w-3xl px-6 py-10"><Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Community Feed" }]} /><h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-900">Community Feed</h1><p className="mt-2 text-sm text-slate-500">Updates from members and associations.</p></div></section>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-5 px-6 py-10">
        {user ? <CreatePostForm associations={associations} /> : <p className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">Log in to share an update.</p>}
        {posts.length === 0 ? <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500">No posts yet.</p> : posts.map((post) => <PostCard key={post.id} post={post} viewerId={user?.id} />)}
      </main>
    </div>
  );
}