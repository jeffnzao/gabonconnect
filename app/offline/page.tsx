import { getLocale, getMessages } from "@/lib/i18n";
import OfflinePageContent from "@/components/offline-page-content";

export const dynamic = "force-static";

export default async function OfflinePage() {
  const messages = getMessages(await getLocale());
  return <main className="flex min-h-[70vh] flex-1 items-center justify-center px-6 py-16"><OfflinePageContent labels={messages.offline} /></main>;
}