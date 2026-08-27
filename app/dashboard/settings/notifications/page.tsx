import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getLocale, getMessages } from "@/lib/i18n";
import { getUserNotificationPreferences } from "@/lib/actions/notifications";
import NotificationSettingsForm from "@/components/notifications/notification-settings-form";

export const dynamic = "force-dynamic";

export default async function NotificationSettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirectTo=/dashboard/settings/notifications");

  const [preferences, locale] = await Promise.all([getUserNotificationPreferences(), getLocale()]);
  const messages = getMessages(locale);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">{messages.notifications.title}</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{messages.notifications.preferences}</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">{messages.notifications.preferences}</p>
      <div className="mt-8">
        <NotificationSettingsForm
          initial={preferences}
          labels={messages.notifications}
          statusLabels={{ save: messages.actions.save, saved: messages.status.success, error: messages.status.error, loading: messages.status.loading }}
        />
      </div>
    </main>
  );
}
