import { Globe, Landmark, Building2, Users, HeartHandshake } from "lucide-react";
import type { GlobalStats } from "@/lib/dashboard";
import { getLocale, getMessages } from "@/lib/i18n";

interface StatsProps {
  stats: GlobalStats;
}

const numberFormatter = new Intl.NumberFormat("en-US");

export default async function Stats({ stats }: StatsProps) {
  const messages = getMessages(await getLocale());
  const items = [
    { label: messages.home.statsContinents, value: stats.continents, icon: Globe },
    { label: messages.home.statsCountries, value: stats.countries, icon: Landmark },
    { label: messages.home.statsCities, value: stats.cities, icon: Building2 },
    { label: messages.home.statsProfiles, value: stats.publicProfiles, icon: Users },
    {
      label: messages.home.statsAssociations,
      value: stats.approvedAssociations,
      icon: HeartHandshake,
    },
  ];

  return (
    <section className="border-b border-slate-100 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {items.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-6 text-center transition-colors hover:bg-slate-50"
            >
              <Icon className="h-5 w-5 text-emerald-600" aria-hidden />
              <span className="text-2xl font-semibold tabular-nums text-slate-900 sm:text-3xl">
                {numberFormatter.format(value)}
              </span>
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500 sm:text-sm">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}