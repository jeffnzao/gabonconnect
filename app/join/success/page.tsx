import type { Metadata } from "next";
import Link from "next/link";
import { PartyPopper, ArrowRight } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileVisibility } from "@/app/generated/prisma/client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Welcome to GabonConnect",
};

export default async function JoinSuccessPage() {
  const user = await getCurrentUser();

  const profile = user
    ? await prisma.profile.findUnique({
        where: { userId: user.id },
        select: { id: true, firstName: true, visibility: true },
      })
    : null;

  const isPublic = profile?.visibility === ProfileVisibility.PUBLIC;

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-slate-50 px-6 py-20">
      <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white px-8 py-12 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <PartyPopper className="h-7 w-7" aria-hidden />
        </span>

        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Welcome to GabonConnect 🇬🇦
        </h1>

        {profile ? (
          <>
            <p className="text-sm leading-relaxed text-slate-500">
              Your profile has been created.
              <br />
              You are now part of the Gabonese diaspora map.
            </p>

            <p className="text-sm font-medium text-slate-700">
              {isPublic
                ? "Your profile is now visible to the community."
                : "Your profile is private."}
            </p>
          </>
        ) : (
          <p className="text-sm leading-relaxed text-slate-500">
            You&apos;re signed in, but we couldn&apos;t find a profile for your
            account yet.
          </p>
        )}

        <div className="mt-4 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/explore"
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400"
          >
            Explore the diaspora
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>

          {profile && isPublic && (
            <Link
              href={`/members/${profile.id}`}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-emerald-200 hover:text-emerald-600"
            >
              View my profile
            </Link>
          )}

          {!profile && (
            <Link
              href="/join/profile"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-emerald-200 hover:text-emerald-600"
            >
              Finish my profile
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
