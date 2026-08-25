import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MapPin, Globe2, LogOut, Pencil } from "lucide-react";
import Breadcrumb from "@/components/explore/breadcrumb";
import MemberCard from "@/components/members/member-card";
import { getCurrentUser } from "@/lib/auth";
import { signOutAction } from "@/lib/auth-actions";
import { prisma } from "@/lib/prisma";
import { ProfileVisibility } from "@/app/generated/prisma";
import { LOCATION_SELECT, type MemberListItem } from "@/lib/members";
import { updateProfileAction } from "./actions";
import { getLocale, getMessages } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My profile | GabonConnect",
};

const ERROR_MESSAGES: Record<string, string> = {
  validation: "Please check the form and try again.",
  save_failed: "We couldn't save your changes. Please try again.",
};

const VISIBILITY_COPY: Record<ProfileVisibility, string> = {
  PUBLIC: "Your profile can appear in the GabonConnect member directory.",
  PRIVATE: "Your profile is hidden from the public member directory.",
};

interface MyProfilePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function initialsOf(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export default async function MyProfilePage({ searchParams }: MyProfilePageProps) {
  const messages = getMessages(await getLocale());
  // Route protégée : pas de session Supabase → connexion.
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      profession: true,
      bio: true,
      photo: true,
      isVerified: true,
      visibility: true,
      city: { select: LOCATION_SELECT },
    },
  });

  // Compte authentifié, mais pas encore de profil (inscription interrompue
  // en cours de route) : on l'envoie finir /join/profile plutôt que de
  // montrer une page vide.
  if (!profile) {
    redirect("/join/profile");
  }

  const sp = await searchParams;
  const errorCode = first(sp.error);
  const saved = first(sp.saved) === "1";

  const fullName = `${profile.firstName} ${profile.lastName}`;
  const isPublic = profile.visibility === ProfileVisibility.PUBLIC;

  // Réutilise le composant existant de l'annuaire pour "How others see
  // you" — MemberCard attend exactement la forme MemberListItem, donc
  // aucune duplication de composant n'est nécessaire ici.
  const previewMember: MemberListItem = {
    id: profile.id,
    firstName: profile.firstName,
    lastName: profile.lastName,
    profession: profile.profession,
    photo: profile.photo,
    isVerified: profile.isVerified,
    city: profile.city,
  };

  return (
    <div className="flex flex-1 flex-col bg-slate-50">
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <Breadcrumb items={[{ label: messages.common.home, href: "/" }, { label: messages.profile.title }]} />

          <div className="mt-6 flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
            {profile.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.photo}
                alt={fullName}
                className="h-20 w-20 shrink-0 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xl font-semibold text-emerald-600">
                {initialsOf(profile.firstName, profile.lastName)}
              </span>
            )}

            <div className="flex-1">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                {fullName}
              </h1>
              <p className="mt-1 text-sm text-slate-500">{user.email}</p>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                <a
                  href="#edit-profile"
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400"
                >
                  <Pencil className="h-3.5 w-3.5" aria-hidden />
                  {messages.profile.edit}
                </a>

                {isPublic && (
                  <Link
                    href={`/members/${profile.id}`}
                    className="inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-emerald-200 hover:text-emerald-600"
                  >
                    {messages.profile.viewPublic}
                  </Link>
                )}

                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-900"
                  >
                    <LogOut className="h-3.5 w-3.5" aria-hidden />
                    {messages.navigation.logout}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-8 px-6 py-12 lg:grid-cols-2">
        {/* Colonne gauche : lecture seule */}
        <div className="flex flex-col gap-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-base font-semibold text-slate-900">
              {messages.profile.personalInfo}
            </h2>
            <dl className="mt-4 flex flex-col gap-3 text-sm">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  {messages.auth.firstName}
                </dt>
                <dd className="mt-0.5 text-slate-700">{profile.firstName}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  {messages.auth.lastName}
                </dt>
                <dd className="mt-0.5 text-slate-700">{profile.lastName}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Email
                </dt>
                <dd className="mt-0.5 text-slate-700">{user.email}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  {messages.auth.profession}
                </dt>
                <dd className="mt-0.5 text-slate-700">
                  {profile.profession || <span className="text-slate-400">{messages.profile.notSet}</span>}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Bio
                </dt>
                <dd className="mt-0.5 whitespace-pre-line text-slate-700">
                  {profile.bio || <span className="text-slate-400">{messages.profile.notSet}</span>}
                </dd>
              </div>
            </dl>
          </section>

          {profile.city && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-base font-semibold text-slate-900">Location</h2>
              <p className="mt-1 text-xs text-slate-400">
                {messages.profile.notEditable}
              </p>
              <dl className="mt-4 flex flex-col gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-emerald-600" aria-hidden />
                  <dd className="text-slate-700">
                    {profile.city.name}, {profile.city.country.name}
                  </dd>
                </div>
                <div className="flex items-center gap-2">
                  <Globe2 className="h-4 w-4 text-emerald-600" aria-hidden />
                  <dd className="text-slate-700">{profile.city.country.continent.name}</dd>
                </div>
              </dl>
            </section>
          )}

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-base font-semibold text-slate-900">{messages.auth.visibility}</h2>
            <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium">
              <span
                className={
                  isPublic
                    ? "rounded-full bg-emerald-50 px-2.5 py-0.5 text-emerald-700"
                    : "rounded-full bg-slate-100 px-2.5 py-0.5 text-slate-600"
                }
              >
                {isPublic ? messages.profile.public : messages.profile.private}
              </span>
            </p>
            <p className="mt-2 text-sm text-slate-500">
              {VISIBILITY_COPY[profile.visibility]}
            </p>
          </section>
        </div>

        {/* Colonne droite : édition + aperçu */}
        <div className="flex flex-col gap-6">
          <section
            id="edit-profile"
            className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6"
          >
            <h2 className="text-base font-semibold text-slate-900">{messages.profile.edit}</h2>

            {saved && (
              <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {messages.profile.updated}
              </p>
            )}

            {errorCode && (
              <p
                role="alert"
                className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.validation}
              </p>
            )}

            <form action={updateProfileAction} className="mt-4 flex flex-col gap-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="firstName" className="text-sm font-medium text-slate-700">
                    First name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    maxLength={80}
                    defaultValue={profile.firstName}
                    autoComplete="given-name"
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="lastName" className="text-sm font-medium text-slate-700">
                    Last name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    maxLength={80}
                    defaultValue={profile.lastName}
                    autoComplete="family-name"
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="profession" className="text-sm font-medium text-slate-700">
                  Profession
                </label>
                <input
                  id="profession"
                  name="profession"
                  type="text"
                  maxLength={160}
                  defaultValue={profile.profession ?? ""}
                  placeholder="e.g. Software Engineer"
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="bio" className="text-sm font-medium text-slate-700">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  maxLength={1000}
                  defaultValue={profile.bio ?? ""}
                  placeholder="A few words about you…"
                  className="w-full resize-none rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <fieldset className="flex flex-col gap-3">
                <legend className="text-sm font-medium text-slate-700">Visibility</legend>

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 has-[:checked]:border-emerald-300 has-[:checked]:bg-emerald-50">
                  <input
                    type="radio"
                    name="visibility"
                    value="PUBLIC"
                    defaultChecked={isPublic}
                    className="mt-1 h-4 w-4 accent-emerald-500"
                  />
                  <span>
                    <span className="block text-sm font-medium text-slate-900">Public</span>
                    <span className="block text-xs text-slate-500">
                      {VISIBILITY_COPY.PUBLIC}
                    </span>
                  </span>
                </label>

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 has-[:checked]:border-emerald-300 has-[:checked]:bg-emerald-50">
                  <input
                    type="radio"
                    name="visibility"
                    value="PRIVATE"
                    defaultChecked={!isPublic}
                    className="mt-1 h-4 w-4 accent-emerald-500"
                  />
                  <span>
                    <span className="block text-sm font-medium text-slate-900">Private</span>
                    <span className="block text-xs text-slate-500">
                      {VISIBILITY_COPY.PRIVATE}
                    </span>
                  </span>
                </label>
              </fieldset>

              <button
                type="submit"
                className="mt-1 inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400"
              >
                Save changes
              </button>
            </form>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-base font-semibold text-slate-900">How others see you</h2>
            <p className="mt-1 text-xs text-slate-400">
              {isPublic
                ? "This is how your card appears in the member directory."
                : "Your profile is private — this preview isn't shown to other visitors."}
            </p>
            <div className="mt-4 max-w-sm">
              <MemberCard member={previewMember} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
