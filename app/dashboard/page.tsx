import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Globe2,
  Pencil,
  Users,
  HeartHandshake,
  Compass,
  ArrowUpRight,
} from "lucide-react";
import Breadcrumb from "@/components/explore/breadcrumb";
import AssociationCard from "@/components/associations/association-card";
import { getCurrentUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/user-dashboard";
import { ProfileVisibility } from "@/app/generated/prisma/client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard | GabonConnect",
};

const VISIBILITY_COPY: Record<ProfileVisibility, string> = {
  PUBLIC: "Your profile can appear in the Gabonese members directory.",
  PRIVATE: "Your profile is hidden from the public members directory.",
};

function initialsOf(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export default async function DashboardPage() {
  // Route protégée : même contrat que /profile — session Supabase requise.
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // getDashboardData() ne prend qu'un userId déjà vérifié côté serveur —
  // jamais un id venant de params/searchParams/formData/composant client.
  const data = await getDashboardData(user.id);

  // Compte authentifié, mais pas encore de profil (inscription interrompue) :
  // même redirection que /profile, pas de page vide.
  if (!data) {
    redirect("/join/profile");
  }

  const { profile, associations } = data;
  const isPublic = profile.visibility === ProfileVisibility.PUBLIC;
  const fullName = `${profile.firstName} ${profile.lastName}`;
  const memberSince = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
  }).format(profile.createdAt);

  return (
    <div className="flex flex-1 flex-col bg-slate-50">
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Dashboard" }]} />

          <div className="mt-6 flex flex-col gap-1">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              Welcome back, {profile.firstName}
            </h1>
            <p className="text-sm text-slate-500">
              Manage your GabonConnect profile and community activity.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12">
        {/* My Profile + Profile Status */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-base font-semibold text-slate-900">My profile</h2>

            <div className="mt-4 flex items-center gap-4">
              {profile.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.photo}
                  alt={fullName}
                  className="h-14 w-14 shrink-0 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-lg font-semibold text-emerald-600">
                  {initialsOf(profile.firstName, profile.lastName)}
                </span>
              )}
              <div>
                <p className="text-sm font-semibold text-slate-900">{fullName}</p>
                <p className="text-xs text-slate-500">
                  {profile.profession || (
                    <span className="text-slate-400">Profession not specified</span>
                  )}
                </p>
              </div>
            </div>

            {profile.city && (
              <div className="mt-4 flex flex-col gap-1.5 text-sm text-slate-600">
                <p className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-emerald-600" aria-hidden />
                  {profile.city.name}, {profile.city.country.name}
                </p>
                <p className="flex items-center gap-1.5">
                  <Globe2 className="h-4 w-4 text-emerald-600" aria-hidden />
                  {profile.city.country.continent.name}
                </p>
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/profile"
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400"
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden />
                Edit profile
              </Link>

              {isPublic && (
                <Link
                  href={`/members/${profile.id}`}
                  className="inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-emerald-200 hover:text-emerald-600"
                >
                  View my public profile
                </Link>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-base font-semibold text-slate-900">Profile visibility</h2>

            <p className="mt-3 inline-flex items-center gap-2 text-sm font-medium">
              <span
                className={
                  isPublic
                    ? "rounded-full bg-emerald-50 px-2.5 py-0.5 text-emerald-700"
                    : "rounded-full bg-slate-100 px-2.5 py-0.5 text-slate-600"
                }
              >
                {isPublic ? "Public" : "Private"}
              </span>
            </p>
            <p className="mt-2 text-sm text-slate-500">{VISIBILITY_COPY[profile.visibility]}</p>

            {/* Statistiques personnelles — uniquement des valeurs réelles,
                calculées depuis les données déjà chargées ci-dessus. */}
            <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-6 text-sm">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Associations joined
                </dt>
                <dd className="mt-0.5 text-lg font-semibold text-slate-900">
                  {associations.length}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Member since
                </dt>
                <dd className="mt-0.5 text-lg font-semibold text-slate-900">{memberSince}</dd>
              </div>
            </dl>
          </section>
        </div>

        {/* My Associations */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
              <HeartHandshake className="h-5 w-5 text-emerald-600" aria-hidden />
              My associations
            </h2>
            <Link
              href="/associations"
              className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
            >
              Explore associations
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>

          {associations.length > 0 ? (
            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {associations.map((association) => (
                <AssociationCard key={association.id} association={association} />
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              You&apos;re not a member of any association yet.
            </p>
          )}
        </section>

        {/* Quick actions */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-base font-semibold text-slate-900">Quick actions</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/profile"
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-emerald-200 hover:text-emerald-600"
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden />
              Edit my profile
            </Link>
            <Link
              href="/members"
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-emerald-200 hover:text-emerald-600"
            >
              <Users className="h-3.5 w-3.5" aria-hidden />
              Explore members
            </Link>
            <Link
              href="/associations"
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-emerald-200 hover:text-emerald-600"
            >
              <Compass className="h-3.5 w-3.5" aria-hidden />
              Explore associations
            </Link>
            {isPublic && (
              <Link
                href={`/members/${profile.id}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-emerald-200 hover:text-emerald-600"
              >
                View my public profile
              </Link>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
