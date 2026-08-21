"use client";

import { useState } from "react";
import Link from "next/link";
import { Globe2, Menu, X } from "lucide-react";
import { signOutAction } from "@/lib/auth-actions";

const BASE_LINKS = [
  { label: "Explore", href: "/explore" },
  { label: "Members", href: "/members" },
];

interface HeaderNavProps {
  isAuthenticated: boolean;
}

export default function HeaderNav({ isAuthenticated }: HeaderNavProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = isAuthenticated
    ? [...BASE_LINKS, { label: "Dashboard", href: "/dashboard" }, { label: "My profile", href: "/profile" }]
    : [...BASE_LINKS, { label: "Join", href: "/join" }, { label: "Login", href: "/login" }];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-slate-900"
          onClick={() => setIsMenuOpen(false)}
        >
          <Globe2 className="h-5 w-5 text-emerald-600" aria-hidden />
          <span className="text-sm font-semibold">GabonConnect</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 sm:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-slate-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden sm:block">
          {isAuthenticated ? (
            <form action={signOutAction}>
              <button
                type="submit"
                className="inline-flex items-center rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-900"
              >
                Logout
              </button>
            </form>
          ) : (
            <Link
              href="/join"
              className="inline-flex items-center rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400"
            >
              Join GabonConnect
            </Link>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          className="inline-flex items-center justify-center rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-100 sm:hidden"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? (
            <X className="h-5 w-5" aria-hidden />
          ) : (
            <Menu className="h-5 w-5" aria-hidden />
          )}
        </button>
      </div>

      {isMenuOpen && (
        <nav className="flex flex-col gap-1 border-t border-slate-100 bg-white px-6 py-4 sm:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              {link.label}
            </Link>
          ))}

          {isAuthenticated ? (
            <form action={signOutAction}>
              <button
                type="submit"
                onClick={() => setIsMenuOpen(false)}
                className="mt-2 inline-flex w-full items-center justify-center rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700"
              >
                Logout
              </button>
            </form>
          ) : (
            <Link
              href="/join"
              onClick={() => setIsMenuOpen(false)}
              className="mt-2 inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-slate-950"
            >
              Join GabonConnect
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
