import { Search, Users2, Megaphone, Network } from "lucide-react";
import { getLocale, getMessages } from "@/lib/i18n";

export default async function Features() {
  const messages = getMessages(await getLocale());
  const features = [
    { title: messages.home.exploreContinents, description: messages.directories.membersIntro, icon: Search },
    { title: messages.directories.associations, description: messages.directories.associationsIntro, icon: Users2 },
    { title: messages.dashboard.opportunities, description: messages.directories.opportunitiesIntro, icon: Megaphone },
    { title: messages.profile.title, description: messages.profile.publicDescription, icon: Network },
  ];
  return (
    <section className="bg-slate-950 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {messages.home.featuresTitle}
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            {messages.home.featuresIntro}
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ title, description, icon: Icon }) => (
            <div
              key={title}
              className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-emerald-400/30 hover:bg-white/[0.06]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="text-base font-semibold text-white">{title}</h3>
              <p className="text-sm leading-relaxed text-slate-400">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}