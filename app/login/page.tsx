import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb from "@/components/explore/breadcrumb";
import { signInAction } from "./actions";
import { getLocale, getMessages } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Log in | GabonConnect",
};

const ERROR_MESSAGES: Record<string, string> = {
  invalid_email: "Enter a valid email address.",
  missing_password: "Please enter your password.",
  invalid_credentials: "Incorrect email or password.",
  not_confirmed: "Please confirm your email before logging in — check your inbox.",
  temporary_error: "Something went wrong on our end. Please try again in a moment.",
  validation: "Please check the form and try again.",
};

interface LoginPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const messages = getMessages(await getLocale());
  const sp = await searchParams;
  const email = first(sp.email) ?? "";
  const errorCode = first(sp.error);
  const notice = first(sp.notice);

  return (
    <div className="flex flex-1 flex-col bg-slate-50">
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-md px-6 py-10">
          <Breadcrumb items={[{ label: messages.common.home, href: "/" }, { label: messages.navigation.login }]} />

          <h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-900">
            {messages.auth.welcomeBack}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {messages.auth.loginIntro}
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-md px-6 py-12">
        {notice === "account_exists" && (
          <p className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              An account with this email may already exist. Try signing in.
          </p>
        )}

        {errorCode && (
          <p
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.validation}
          </p>
        )}

        <form
          action={signInAction}
          className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6"
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-slate-700">
              {messages.auth.email}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              defaultValue={email}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-slate-700">
              {messages.auth.password}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <button
            type="submit"
            className="mt-2 inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400"
          >
            {messages.auth.loginButton}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          {messages.auth.newMember}{" "}
          <Link
            href="/join/account"
            className="font-medium text-emerald-600 hover:text-emerald-700"
          >
            {messages.auth.accountLink}
          </Link>
        </p>
      </div>
    </div>
  );
}
