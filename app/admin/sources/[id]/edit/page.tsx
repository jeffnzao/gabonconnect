import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getLocale, getMessages } from "@/lib/i18n";
import { getSourceRegistry, updateSourceRegistryFromForm } from "@/lib/actions/source-registry";
import SourceForm from "@/components/source-registry/source-form";

type Props = { params: Promise<{ id: string }> };
export const dynamic = "force-dynamic";

export default async function EditSourcePage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirectTo=/admin/sources");
  const { id } = await params;
  const source = await getSourceRegistry(id);
  if (!source) notFound();
  const messages = getMessages(await getLocale());
  return <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6"><Link href="/admin/sources" className="text-sm font-semibold text-emerald-700">{messages.sourceRegistry.title}</Link><h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-900">{messages.sourceRegistry.edit}</h1><SourceForm action={updateSourceRegistryFromForm.bind(null, source.id)} labels={messages.sourceRegistry} submitLabel={messages.sourceRegistry.save} initial={source} /></main>;
}