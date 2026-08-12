import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Breadcrumb from "@/components/explore/breadcrumb";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createProfileAction } from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Build your profile | GabonConnect",
};

const ERROR_MESSAGES: Record<string, string> = {
  missing_name: "Please enter your first and last name.",
  missing_location: "Please select your country and city.",
  missing_visibility: "Please choose a visibility.",
  invalid_location: "That city doesn't belong to the selected country — please pick again.",
  save_failed: "We couldn't save your profile. Please try again.",
  validation: "Please check the form and try again.",
};

interface JoinProfilePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function JoinProfilePage({ searchParams }: JoinProfilePageProps) {
  // Route protégée : pas de session Supabase → retour à la création de compte.
  const user = await getCurrentUser();

  if (!user) {
    redirect("/join/account");
  }

  // Un profil existe déjà pour cet utilisateur : pas de double création,
  // on le renvoie directement vers l'écran de confirmation.
  const existingProfile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  if (existingProfile) {
    redirect("/profile");
  }

  const countries = await prisma.country.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      cities: {
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      },
    },
  });

  const sp = await searchParams;
  const errorCode = first(sp.error);

  return (
    <div className="flex flex-1 flex-col bg-slate-50">
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-xl px-6 py-10">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Join", href: "/join" },
              { label: "Profile" },
            ]}
          />

          <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-emerald-600">
            Step 2 of 2
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
            Build your profile
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            This is what other members of the diaspora will see about you.
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-xl px-6 py-12">
        {errorCode && (
          <p
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.validation}
          </p>
        )}

        <form
          action={createProfileAction}
          className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6"
        >
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
                autoComplete="given-name"
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
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
                autoComplete="family-name"
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="profession" className="text-sm font-medium text-slate-700">
              Profession <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <input
              id="profession"
              name="profession"
              type="text"
              maxLength={160}
              placeholder="e.g. Software Engineer"
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="countryId" className="text-sm font-medium text-slate-700">
                Country
              </label>
              <select
                id="countryId"
                name="countryId"
                required
                defaultValue=""
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              >
                <option value="" disabled>
                  Select your country
                </option>
                {countries.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="cityId" className="text-sm font-medium text-slate-700">
                City
              </label>
              <select
                id="cityId"
                name="cityId"
                required
                defaultValue=""
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              >
                <option value="" disabled>
                  Select your city
                </option>
                {countries.map((country) => (
                  <optgroup key={country.id} label={country.name}>
                    {country.cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <p className="text-xs text-slate-400">
                Make sure the city matches the country you selected above.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="bio" className="text-sm font-medium text-slate-700">
              Bio <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={4}
              maxLength={1000}
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
                defaultChecked
                className="mt-1 h-4 w-4 accent-emerald-500"
              />
              <span>
                <span className="block text-sm font-medium text-slate-900">Public</span>
                <span className="block text-xs text-slate-500">
                  Your profile can appear in the public GabonConnect directory.
                </span>
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 has-[:checked]:border-emerald-300 has-[:checked]:bg-emerald-50">
              <input
                type="radio"
                name="visibility"
                value="PRIVATE"
                className="mt-1 h-4 w-4 accent-emerald-500"
              />
              <span>
                <span className="block text-sm font-medium text-slate-900">Private</span>
                <span className="block text-xs text-slate-500">
                  Your profile will not be visible publicly.
                </span>
              </span>
            </label>
          </fieldset>

          <button
            type="submit"
            className="mt-2 inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400"
          >
            Save my profile
          </button>
        </form>
      </div>
    </div>
  );
}
