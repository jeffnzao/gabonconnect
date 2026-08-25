import type { Metadata } from "next";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import Breadcrumb from "@/components/explore/breadcrumb";
import { signUpAction } from "./actions";
import { getLocale, getMessages } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create your account | GabonConnect",
};

const ERROR_MESSAGES: Record<string, string> = {
  invalid_email: "Enter a valid email address.",
  weak_password: "Password must be at least 8 characters.",
  password_mismatch: "Passwords do not match.",
  signup_failed:
    "We couldn't create your account. The email may already be in use, or something went wrong — please try again.",
  validation: "Please check the form and try again.",
};

interface JoinAccountPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function JoinAccountPage({ searchParams }: JoinAccountPageProps) {
  const messages = getMessages(await getLocale());
  const sp = await searchParams;
  const email = first(sp.email) ?? "";
  const errorCode = first(sp.error);
  const sent = first(sp.sent) === "1";

  return (
    <div className="flex flex-1 flex-col bg-slate-50">
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-md px-6 py-10">
          <Breadcrumb
            items={[
              { label: messages.common.home, href: "/" },
              { label: messages.navigation.join, href: "/join" },
              { label: messages.auth.account },
            ]}
          />

          <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-emerald-600">
            {messages.auth.stepOne}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
            {messages.auth.createAccount}
          </h1>
        </div>
      </section>

      <div className="mx-auto w-full max-w-md px-6 py-12">
        {sent ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <MailCheck className="h-6 w-6" aria-hidden />
            </span>
            <h2 className="text-lg font-semibold text-slate-900">{messages.auth.checkEmail}</h2>
            <p className="text-sm leading-relaxed text-slate-500">
              {messages.auth.confirmationSent}{" "}
              <span className="font-medium text-slate-700">{email}</span>. Click it
              to confirm your account and continue building your profile.
            </p>
            <p className="text-xs text-slate-400">
              Didn&apos;t get it? Check your spam folder, or{" "}
              <Link href="/join/account" className="text-emerald-600 hover:text-emerald-700">
                {messages.auth.tryAgain}
              </Link>
              .
            </p>
          </div>
        ) : (
          <>
            {errorCode && (
              <p
                role="alert"
                className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.validation}
              </p>
            )}

            <form
              action={signUpAction}
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
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-slate-700"
                >
                  {messages.auth.confirmPassword}
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder={messages.auth.confirmPasswordPlaceholder}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <button
                type="submit"
                className="mt-2 inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400"
              >
                {messages.auth.createAccountButton}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
