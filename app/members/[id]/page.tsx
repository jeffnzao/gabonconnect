import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { UserRound, MapPin, Briefcase, ChevronRight } from "lucide-react";
import Breadcrumb, { type BreadcrumbItem } from "@/components/explore/breadcrumb";
import { getMemberById, type MemberDetail } from "@/lib/members";

export const dynamic = "force-dynamic";

function buildDescription(member: MemberDetail): string | undefined {
  if (member.profession && member.city) {
    return `${member.firstName} ${member.lastName} — ${member.profession} in ${member.city.name}, ${member.city.country.name}.`;
  }
  if (member.profession) {
    return `${member.firstName} ${member.lastName} — ${member.profession}.`;
  }
  if (member.bio) {
    return member.bio;
  }
  // Aucune donnée réelle disponible pour composer une description honnête
  // (pas de profession, pas de ville, pas de bio) : on n'en invente pas.
  return undefined;
}

function buildBreadcrumbItems(member: MemberDetail): BreadcrumbItem[] {
  const fullName = `${member.firstName} ${member.lastName}`;

  if (!member.city) {
    return [
      { label: "Home", href: "/" },
      { label: "Members", href: "/members" },
      { label: fullName },
    ];
  }

  const { city } = member;
  const { country } = city;
  const { continent } = country;

  return [
    { label: "Home", href: "/" },
    { label: "Explore", href: "/explore" },
    { label: continent.name, href: `/explore/${continent.slug}` },
    { label: country.name, href: `/explore/${continent.slug}/${country.slug}` },
    { label: city.name, href: `/explore/${continent.slug}/${country.slug}/${city.slug}` },
    { label: fullName },
  ];
}

export async function generateMetadata(
  props: PageProps<"/members/[id]">,
): Promise<Metadata> {
  const { id } = await props.params;
  const member = await getMemberById(id);

  // Profil inexistant OU privé : même metadata générique dans les deux cas
  // — ne jamais laisser transparaître qu'un profil PRIVATE existe à cet id.
  if (!member) {
    return { title: "Member not found | GabonConnect" };
  }

  const description = buildDescription(member);

  return {
    title: `${member.firstName} ${member.lastName} · GabonConnect`,
    ...(description ? { description } : {}),
  };
}

export default async function MemberProfilePage(props: PageProps<"/members/[id]">) {
  const { id } = await props.params;
  const member = await getMemberById(id);

  if (!member) {
    notFound();
  }

  const fullName = `${member.firstName} ${member.lastName}`;

  return (
    <div className="flex flex-1 flex-col bg-slate-50">
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-3xl px-6 pt-6">
          <Breadcrumb items={buildBreadcrumbItems(member)} />
        </div>

        <div className="mt-6 h-28 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-300 sm:h-36" />

        <div className="mx-auto max-w-3xl px-6 pb-10">
          <div className="-mt-12 flex flex-col items-center gap-4 text-center sm:-mt-16 sm:flex-row sm:items-end sm:text-left">
            {member.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={member.photo}
                alt={fullName}
                className="h-28 w-28 shrink-0 rounded-full object-cover ring-4 ring-white shadow-lg sm:h-32 sm:w-32"
              />
            ) : (
              <span className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-4 ring-white shadow-lg sm:h-32 sm:w-32">
                <UserRound className="h-12 w-12" aria-hidden />
              </span>
            )}

            <div className="pb-1">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                {fullName}
              </h1>

              {member.profession && (
                <p className="mt-1 flex items-center justify-center gap-1.5 text-slate-500 sm:justify-start">
                  <Briefcase className="h-4 w-4" aria-hidden />
                  {member.profession}
                </p>
              )}

              {member.city && (
                <p className="mt-1 flex items-center justify-center gap-1.5 text-slate-500 sm:justify-start">
                  <MapPin className="h-4 w-4" aria-hidden />
                  {member.city.name}, {member.city.country.name}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {member.bio && (
        <section className="mx-auto w-full max-w-3xl px-6 py-12">
          <h2 className="text-lg font-semibold text-slate-900">About</h2>
          <p className="mt-3 whitespace-pre-line leading-relaxed text-slate-600">
            {member.bio}
          </p>
        </section>
      )}

      {member.city && (
        <section className="mx-auto w-full max-w-3xl border-t border-slate-100 px-6 py-12">
          <h2 className="text-lg font-semibold text-slate-900">Location</h2>
          <nav aria-label="Location" className="mt-3 flex flex-wrap items-center gap-1.5 text-sm">
            <Link
              href={`/explore/${member.city.country.continent.slug}/${member.city.country.slug}/${member.city.slug}`}
              className="rounded-full border border-slate-200 bg-white px-3 py-1 font-medium text-slate-700 transition-colors hover:border-emerald-200 hover:text-emerald-700"
            >
              {member.city.name}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" aria-hidden />
            <Link
              href={`/explore/${member.city.country.continent.slug}/${member.city.country.slug}`}
              className="rounded-full border border-slate-200 bg-white px-3 py-1 font-medium text-slate-700 transition-colors hover:border-emerald-200 hover:text-emerald-700"
            >
              {member.city.country.name}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" aria-hidden />
            <Link
              href={`/explore/${member.city.country.continent.slug}`}
              className="rounded-full border border-slate-200 bg-white px-3 py-1 font-medium text-slate-700 transition-colors hover:border-emerald-200 hover:text-emerald-700"
            >
              {member.city.country.continent.name}
            </Link>
          </nav>
        </section>
      )}

      {member.profession && (
        <section className="mx-auto w-full max-w-3xl border-t border-slate-100 px-6 py-12">
          <h2 className="text-lg font-semibold text-slate-900">Professional</h2>
          <p className="mt-3 flex items-center gap-1.5 leading-relaxed text-slate-600">
            <Briefcase className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
            {member.profession}
          </p>
        </section>
      )}

      {/* Association : aucune relation Profile → Association n'existe dans le
          schéma Prisma actuel (Association n'a qu'une relation vers City).
          Conformément à la Task 006 §9/§15, rien n'est affiché ici — une
          section ne doit pas être inventée. */}
    </div>
  );
}