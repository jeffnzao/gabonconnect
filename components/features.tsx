import { Search, Users2, Megaphone, Network } from "lucide-react";

const FEATURES = [
  {
    title: "Find Gabonese abroad",
    description:
      "Retrouvez des compatriotes par ville, par pays ou par continent, où que vous soyez dans le monde.",
    icon: Search,
  },
  {
    title: "Discover associations",
    description:
      "Explorez les associations gabonaises approuvées près de chez vous et rejoignez leurs actions.",
    icon: Users2,
  },
  {
    title: "Share opportunities",
    description:
      "Emplois, bourses, événements communautaires : partagez ce qui peut aider la diaspora à avancer.",
    icon: Megaphone,
  },
  {
    title: "Build your network",
    description:
      "Créez votre profil public et connectez-vous à un réseau gabonais mondial en pleine croissance.",
    icon: Network,
  },
];

export default function Features() {
  return (
    <section className="bg-slate-950 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            What you can do
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            Une seule plateforme pour rester connecté à Gamba, à toutes les
            provinces du Gabon — et à sa 10e province.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ title, description, icon: Icon }) => (
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