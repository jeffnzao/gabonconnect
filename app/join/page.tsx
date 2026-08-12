import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, UserPlus, MapPin, Globe2, LogIn } from "lucide-react";
import Breadcrumb from "@/components/explore/breadcrumb";

export const metadata: Metadata = {
  title: "Join GabonConnect",
  description:
    "Put yourself on the map. Connect with the Gabonese diaspora around the world.",
};

const STEPS = [
  {
    title: "Create your account",
    description: "Sign up with your email and a password — secured by Supabase Auth.",
    icon: UserPlus,
  },
  {
    title: "Build your profile",
    description:
      "Tell us your name, profession and where you live in the diaspora.",
    icon: MapPin,
  },
  {
    title: "Join the map",
    description:
      "Choose to go public or stay private, and become part of the community.",
    icon: Globe2,
  },
];

export default function JoinPage() {
  return (
    <div className="flex flex-1 flex-col bg-slate-50">
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-10">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Join" }]} />

          <div className="mx-auto mt-10 max-w-xl text-center">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              Join GabonConnect
            </h1>
            <p className="mt-4 text-lg text-slate-500">Put yourself on the map.</p>
            <p className="mt-2 text-base text-slate-500">
              Connect with the Gabonese diaspora around the world.
            </p>
          </div>

          {/* Une seule porte d'entrée, deux chemins clairement séparés — pas
              de second système d'inscription : les deux boutons mènent au
              même flux Supabase Auth déjà en place (signUp / signInWithPassword). */}
          <div className="mx-auto mt-10 grid max-w-xl grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 text-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <UserPlus className="h-5 w-5" aria-hidden />
              </span>
              <h2 className="text-base font-semibold text-slate-900">
                New to GabonConnect?
              </h2>
              <p className="text-sm text-slate-500">
                Create your account and build your profile in a few minutes.
              </p>
              <Link
                href="/join/account"
                className="group mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400"
              >
                Create my account
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
            </div>

            <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 text-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                <LogIn className="h-5 w-5" aria-hidden />
              </span>
              <h2 className="text-base font-semibold text-slate-900">
                Already have an account?
              </h2>
              <p className="text-sm text-slate-500">
                Log in to manage your profile and visibility.
              </p>
              <Link
                href="/login"
                className="mt-2 inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-emerald-200 hover:text-emerald-600"
              >
                Log in
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-3xl px-6 py-16">
        <ol className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-6"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <step.icon className="h-5 w-5" aria-hidden />
              </span>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                Step {index + 1}
              </p>
              <h2 className="text-base font-semibold text-slate-900">{step.title}</h2>
              <p className="text-sm leading-relaxed text-slate-500">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
