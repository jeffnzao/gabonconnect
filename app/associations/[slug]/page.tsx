import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  HeartHandshake,
  MapPin,
  Globe2,
  CalendarDays,
  Link as LinkIcon,
  Mail,
  Phone,
  Users,
  CheckCircle2,
} from "lucide-react";
import Breadcrumb from "@/components/explore/breadcrumb";
import MemberCard from "@/components/members/member-card";
import { getCurrentUser } from "@/lib/auth";
import { getAssociationBySlug, type AssociationProfileDetail } from "@/lib/association-profile";
import { getLocale, getMessages } from "@/lib/i18n";

export const dynamic = "force-dynamic";

interface AssociationProfilePageProps {
  params: Promise<{ slug: string }>;
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

function buildDescription(association: AssociationProfileDetail): string | undefined {
  if (association.description) {
    return association.description.length > 160
      ? `${association.description.slice(0, 157)}...`
      : association.description;
  }
  if (association.city) {
    return `${association.name} — ${association.city.name}, ${association.city.country.name}.`;
  }
  // Aucune donnée réelle disponible pour composer une description honnête.
  return undefined;
}

export async function generateMetadata({
  params,
}: AssociationProfilePageProps): Promise<Metadata> {
  const { slug } = await params;
  const association = await getAssociationBySlug(slug);

  if (!association) {
    return { title: "Association not found | GabonConnect" };
  }

  const description = buildDescription(association);

  return {
    title: `${association.name} · GabonConnect`,
    ...(description ? { description } : {}),
  };
}

export default async function AssociationProfilePage({
  params,
}: AssociationProfilePageProps) {
  const messages = getMessages(await getLocale());
  const { slug } = await params;
  const association = await getAssociationBySlug(slug);

  if (!association) {
    notFound();
  }

  const user = await getCurrentUser();
  const foundedLabel = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
  }).format(association.createdAt);

  return (
    <div className="flex flex-1 flex-col bg-slate-50">
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-10">
          <Breadcrumb
            items={[
              { label: messages.common.home, href: "/" },
              { label: messages.navigation.members, href: "/associations" },
              { label: association.name },
            ]}
          />

          <div className="mt-8 flex flex-col items-center gap-4 text-center">
            {association.logo ? (
              // Logos hébergés sur Supabase Storage : domaines non connus à
              // l'avance, on reste sur <img> plutôt que next/image.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={association.logo}
                alt={association.name}
                className="h-24 w-24 rounded-full border border-slate-100 object-cover"
              />
            ) : (
              <span className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50 text-2xl font-semibold text-emerald-600">
                {initialsOf(association.name) || (
                  <HeartHandshake className="h-10 w-10" aria-hidden />
                )}
              </span>
            )}

            <div className="flex items-center justify-center gap-2">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                {association.name}
              </h1>
              {association.isVerified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                  {messages.directories.verified}
                </span>
              )}
            </div>

            {association.city && (
              <p className="flex items-center gap-1.5 text-sm text-slate-500">
                <MapPin className="h-4 w-4 text-emerald-600" aria-hidden />
                {association.city.name}, {association.city.country.name}
                <span className="mx-1 text-slate-300">·</span>
                <Globe2 className="h-4 w-4 text-emerald-600" aria-hidden />
                {association.city.country.continent.name}
              </p>
            )}

            <p className="flex items-center gap-1.5 text-xs text-slate-400">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden />
              {messages.directories.foundedIn} {foundedLabel}
            </p>

            {user ? (
              <button
                type="button"
                disabled
                aria-disabled="true"
                title={messages.home.comingSoon}
                className="mt-2 inline-flex cursor-not-allowed items-center rounded-full bg-slate-100 px-6 py-2.5 text-sm font-semibold text-slate-400"
              >
                {messages.directories.joinAssociation} - {messages.home.comingSoon}
              </button>
            ) : (
              <Link
                href={`/login?next=/associations/${association.slug}`}
                className="mt-2 inline-flex items-center rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400"
              >
                {messages.directories.joinAssociation}
              </Link>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-3xl px-6 py-12">
        {association.description && (
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-slate-900">{messages.directories.aboutAssociation}</h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-slate-600">
              {association.description}
            </p>
          </section>
        )}

        {(association.website || association.email || association.phone) && (
          <section className="mb-10 border-t border-slate-100 pt-10">
            <h2 className="text-lg font-semibold text-slate-900">{messages.directories.contact}</h2>
            <dl className="mt-3 flex flex-col gap-2 text-sm">
              {association.website && (
                <div className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                  <a
                    href={association.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:text-emerald-700"
                  >
                    {association.website}
                  </a>
                </div>
              )}
              {association.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                  <a
                    href={`mailto:${association.email}`}
                    className="text-emerald-600 hover:text-emerald-700"
                  >
                    {association.email}
                  </a>
                </div>
              )}
              {association.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                  <a
                    href={`tel:${association.phone}`}
                    className="text-emerald-600 hover:text-emerald-700"
                  >
                    {association.phone}
                  </a>
                </div>
              )}
            </dl>
          </section>
        )}

        {association.memberPreview.length > 0 && (
          <section className="border-t border-slate-100 pt-10">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <Users className="h-5 w-5 text-emerald-600" aria-hidden />
              {messages.directories.communityIn} {association.city?.name}
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Public GabonConnect members based in the same city.
            </p>
            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {association.memberPreview.map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
