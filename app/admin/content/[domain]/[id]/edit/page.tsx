import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getLocale, getMessages } from "@/lib/i18n";
import { getContentItem, updateContentMetadataFromForm } from "@/lib/actions/content";
import { contentDomains, type ContentDomain } from "@/lib/content-types";

type Props = { params: Promise<{ domain: string; id: string }> };
export const dynamic = "force-dynamic";

export default async function ContentEditPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirectTo=/admin/content");
  const { domain: rawDomain, id } = await params;
  if (!contentDomains.includes(rawDomain as ContentDomain)) notFound();
  const domain = rawDomain as ContentDomain;
  const item = await getContentItem(domain, id);
  if (!item) notFound();
  const messages = getMessages(await getLocale());

  return <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6"><a href="/admin/content" className="text-sm font-semibold text-emerald-700">{messages.adminContent.title}</a><h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-900">{messages.adminContent.editTitle}</h1><form action={updateContentMetadataFromForm.bind(null, domain, id)} className="mt-8 space-y-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"><label className="block text-sm font-semibold text-slate-700">{messages.adminContent.title}<input name="title" required defaultValue={item.title} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal" /></label><label className="block text-sm font-semibold text-slate-700">Description<textarea name="description" required defaultValue={item.excerpt} rows={6} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal" /></label><label className="block text-sm font-semibold text-slate-700">{messages.adminContent.source}<input name="sourceName" defaultValue={item.sourceName ?? ""} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal" /></label><label className="block text-sm font-semibold text-slate-700">{messages.adminContent.canonicalUrl}<input name="canonicalUrl" type="url" defaultValue={item.canonicalUrl ?? ""} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal" /></label><label className="flex items-center gap-3 text-sm font-semibold text-slate-700"><input type="checkbox" name="copyrightFlag" defaultChecked={item.copyrightFlag} className="h-5 w-5 accent-emerald-600" />{messages.adminContent.copyright}</label><button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white">{messages.adminContent.save}</button></form></main>;
}