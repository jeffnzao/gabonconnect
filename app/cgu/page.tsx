import type { Metadata } from "next";
import { FileText, Gavel, ShieldCheck, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation",
  description: "Les règles d'utilisation de la plateforme GabonConnect360.",
};

const sections = [
  { icon: Users, title: "1. Objet et accès", body: "GabonConnect360 est une plateforme destinée à faciliter les échanges, l'information et la mise en relation de la communauté gabonaise et de sa diaspora. L'accès aux fonctionnalités nécessite la création d'un compte et la fourniture d'informations exactes." },
  { icon: ShieldCheck, title: "2. Compte et sécurité", body: "Chaque membre est responsable de la confidentialité de ses identifiants et des actions réalisées depuis son compte. Il doit signaler sans délai toute utilisation non autorisée et maintenir ses informations à jour." },
  { icon: Gavel, title: "3. Contenus et comportements", body: "Les contenus publiés doivent respecter la loi, les droits des tiers et la dignité des autres membres. Sont interdits les contenus illicites, trompeurs, haineux, discriminatoires, diffamatoires, malveillants ou destinés à solliciter abusivement les utilisateurs." },
  { icon: FileText, title: "4. Propriété intellectuelle", body: "La structure, la marque, le design et les logiciels de GabonConnect360 sont protégés. Le membre conserve ses droits sur ses contributions et accorde à la plateforme une licence non exclusive nécessaire à leur affichage et à leur fonctionnement." },
];

export default function CGUPage() {
  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-5xl px-6 py-16 lg:py-24">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">GabonConnect360</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">Conditions Générales d&apos;Utilisation</h1>
          <p className="mt-6 text-lg leading-8 text-slate-600">Un cadre clair pour une communauté utile, respectueuse et engagée. En utilisant GabonConnect360, vous acceptez les présentes conditions.</p>
          <p className="mt-4 text-sm text-slate-500">Dernière mise à jour : 16 septembre 2026</p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {sections.map(({ icon: Icon, title, body }) => (
            <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><Icon aria-hidden className="size-5" /></div>
              <h2 className="mt-5 text-lg font-semibold text-slate-950">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{body}</p>
            </article>
          ))}
        </div>
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">5. Disponibilité, responsabilité et modifications</h2>
          <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600"><p>Nous mettons en œuvre des moyens raisonnables pour maintenir le service, sans garantir une disponibilité continue ni l&apos;exactitude des contenus publiés par les membres.</p><p>GabonConnect360 peut suspendre un compte ou retirer un contenu en cas de violation des présentes conditions, de la loi ou pour préserver la sécurité de la communauté.</p><p>Les conditions peuvent évoluer pour tenir compte des changements du service ou de la réglementation. La version publiée sur cette page est la version applicable.</p></div>
          <h2 className="mt-8 text-lg font-semibold text-slate-950">6. Contact</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">Pour toute question concernant ces conditions, utilisez notre page <a className="font-medium text-emerald-700 underline underline-offset-4" href="/contact">Contact</a>.</p>
        </div>
      </section>
    </main>
  );
}

export { CGUPage };

export const dynamic = "force-static";

