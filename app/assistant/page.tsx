import AssistantChat from "@/components/ai/assistant-chat";
import { getLocale } from "@/lib/i18n";

export default async function AssistantPage() {
  const locale = await getLocale();
  return <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 sm:py-12"><header className="border-b border-slate-200 pb-7"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">Assistant GabonConnect</p><h1 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">Une question, des sources verifiees</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Interrogez les bourses, demarches, evenements, opportunites, actualites et le Centre de Memoire.</p></header><section className="mt-7"><AssistantChat locale={locale} embedded /></section></main>;
}