import type { Metadata } from "next";
import { Database, Eye, LockKeyhole, UserRoundCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Politique de confidentialité et RGPD",
  description: "Comment GabonConnect360 traite et protège vos données personnelles.",
};

const sections = [
  { icon: Database, title: "Données collectées", body: "Nous collectons les informations nécessaires au compte, au profil, aux échanges, aux événements et aux préférences. Les données sont limitées à ce qui est utile au fonctionnement et à l'amélioration du service." },
  { icon: LockKeyhole, title: "Hébergement et sécurité", body: "Les données applicatives sont stockées dans un environnement Supabase/PostgreSQL sécurisé. Nous appliquons des contrôles d'accès, le chiffrement en transit et des règles de sécurité adaptées, sans pouvoir garantir un risque nul." },
  { icon: Eye, title: "Utilisation et conservation", body: "Vos données servent à fournir les fonctionnalités demandées, sécuriser les comptes, répondre aux demandes et mesurer l'amélioration du service. Elles sont conservées pendant la durée nécessaire à ces finalités ou aux obligations légales." },
  { icon: UserRoundCheck, title: "Vos droits", body: "Vous pouvez demander l'accès, la rectification, la portabilité, la limitation ou la suppression de vos données, ainsi que vous opposer à certains traitements. Nous pouvons vérifier votre identité avant de traiter une demande." },
];

export default function RGPDPage() {
  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-5xl px-6 py-16 lg:py-24">
        <div className="max-w-3xl"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Vie privée</p><h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">Politique de confidentialité</h1><p className="mt-6 text-lg leading-8 text-slate-600">Cette politique explique comment GabonConnect360 traite vos données personnelles et comment exercer vos droits.</p><p className="mt-4 text-sm text-slate-500">Dernière mise à jour : 16 septembre 2026</p></div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2">{sections.map(({ icon: Icon, title, body }) => <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><Icon aria-hidden className="size-5" /></div><h2 className="mt-5 text-lg font-semibold text-slate-950">{title}</h2><p className="mt-3 text-sm leading-7 text-slate-600">{body}</p></article>)}</div>
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-semibold text-slate-950">Supabase et sous-traitants</h2><p className="mt-3 text-sm leading-7 text-slate-600">Nous utilisons Supabase pour l&apos;authentification, la base de données et, lorsque nécessaire, les services associés. Les accès sont limités aux besoins du service et les règles de sécurité par ligne sont utilisées lorsque le modèle de données le requiert. Aucun mot de passe n&apos;est stocké en clair.</p><h2 className="mt-8 text-lg font-semibold text-slate-950">Gérer votre compte</h2><p className="mt-3 text-sm leading-7 text-slate-600">Vous pouvez consulter et modifier les informations de votre profil depuis <a className="font-medium text-emerald-700 underline underline-offset-4" href="/profile">votre profil</a>. Pour demander une suppression, un export ou poser une question, contactez-nous via <a className="font-medium text-emerald-700 underline underline-offset-4" href="/contact">la page Contact</a>.</p><p className="mt-4 text-sm leading-7 text-slate-600">Si vous estimez que votre demande n&apos;a pas été traitée correctement, vous pouvez contacter l&apos;autorité de protection des données compétente dans votre pays de résidence.</p></div>
      </section>
    </main>
  );
}
