import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getLocale, getMessages } from "@/lib/i18n";
import { createSourceRegistryFromForm } from "@/lib/actions/source-registry";
import { runAggregationFromForm } from "@/lib/actions/aggregation";
import SourceForm from "@/components/source-registry/source-form";

export const dynamic = "force-dynamic";

export default async function NewSourcePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirectTo=/admin/sources/new");
  const messages = getMessages(await getLocale());
  return <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6"><Link href="/admin/sources" className="text-sm font-semibold text-emerald-700">{messages.sourceRegistry.title}</Link><h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-900">{messages.sourceRegistry.add}</h1><form action={runAggregationFromForm} className="mt-5"><button type="submit" className="rounded-lg border border-emerald-200 px-4 py-2.5 text-sm font-semibold text-emerald-700">{messages.sourceRegistry.runAggregation}</button></form><SourceForm action={createSourceRegistryFromForm} labels={messages.sourceRegistry} submitLabel={messages.sourceRegistry.save} /></main>;
}
