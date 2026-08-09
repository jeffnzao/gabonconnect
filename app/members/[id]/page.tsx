import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { UserRound, MapPin, Briefcase, ChevronRight } from "lucide-react";
import Breadcrumb, { type BreadcrumbItem } from "@/components/explore/breadcrumb";
import { getMemberById, type MemberDetail } from "@/lib/members";

export const dynamic = "force-dynamic";

function buildDescription(member: MemberDetail): string {
  if (member.profession && member.city) {
    return `${member.profession} in ${member.city.name}, ${member.city.country.name} — GabonConnect`;
  }
  if (member.profession) {
    return `${member.profession} — GabonConnect`;
  }
  if (member.bio) {
    return member.bio;
  }
  return `${member.firstName} ${member.lastName} sur GabonConnect.`;
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

  if (!member) {
    return { title: "Profil introuvable | GabonConnect" };
  }

  return {
    title: `${member.firstName} ${member.lastName} | GabonConnect`,
    description: buildDescription(member),
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

          {member.city && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Location
              </span>
              <nav aria-label="Location" className="flex items-center gap-1.5 text-sm">
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
            </div>
          )}
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
    </div>
  );
}