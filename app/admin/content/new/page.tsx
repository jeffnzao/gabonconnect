import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getLocale, getMessages } from "@/lib/i18n";
import { createContentDraftFromForm } from "@/lib/actions/content";
import { contentDomains } from "@/lib/content-types";

export const dynamic = "force-dynamic";

export default async function NewContentPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirectTo=/admin/content/new");
  const messages = getMessages(await getLocale());

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6">
      <Link href="/admin/content" className="text-sm font-semibold text-emerald-700">{messages.adminContent.title}</Link>
      <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-900">{messages.adminContent.newContent}</h1>
      <form action={createContentDraftFromForm} className="mt-8 space-y-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <label className="block text-sm font-semibold text-slate-700">{messages.adminContent.domain}
          <select name="domain" className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-normal">
            {contentDomains.map((domain) => <option key={domain} value={domain}>{messages.adminContent[domain]}</option>)}
          </select>
        </label>
        <label className="block text-sm font-semibold text-slate-700">{messages.adminContent.title}
          <input name="title" required className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal" />
        </label>
        <label className="block text-sm font-semibold text-slate-700">{messages.adminContent.description}
          <textarea name="description" required rows={7} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal" />
        </label>
        <label className="block text-sm font-semibold text-slate-700">{messages.adminContent.source}
          <input name="sourceName" className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal" />
        </label>
        <label className="block text-sm font-semibold text-slate-700">{messages.adminContent.canonicalUrl}
          <input name="canonicalUrl" type="url" className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal" />
        </label>
        <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
          <input type="checkbox" name="copyrightFlag" className="h-5 w-5 accent-emerald-600" />
          {messages.adminContent.copyright}
        </label>
        <p className="text-xs text-slate-500">{messages.adminContent.pending}</p>
        <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white">{messages.adminContent.createDraft}</button>
      </form>
    </main>
  );
}
