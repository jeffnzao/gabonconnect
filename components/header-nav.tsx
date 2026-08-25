"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Globe2, Menu, Search, X } from "lucide-react";
import { signOutAction } from "@/lib/auth-actions";

export interface HeaderNavLink {
  label: string;
  href: string;
}

interface HeaderNavProps {
  isAuthenticated: boolean;
  navLinks: HeaderNavLink[];
}

export default function HeaderNav({ isAuthenticated, navLinks }: HeaderNavProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-slate-900"
          onClick={() => setIsMenuOpen(false)}
        >
          <Globe2 className="h-5 w-5 text-emerald-600" aria-hidden />
          <span className="text-sm font-semibold">GabonConnect</span>
        </Link>

        <form onSubmit={handleSearchSubmit} className="hidden flex-1 max-w-md items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 md:flex">
          <Search className="h-4 w-4 text-slate-400" aria-hidden />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search people, associations, events..."
            className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
            aria-label="Global search"
          />
        </form>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 lg:flex">
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
        <div className="border-t border-slate-100 bg-white px-6 py-4 sm:hidden">
          <form onSubmit={handleSearchSubmit} className="mb-3 flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
            <Search className="h-4 w-4 text-slate-400" aria-hidden />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search..."
              className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
              aria-label="Global search"
            />
          </form>

          <nav className="flex flex-col gap-1">
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
        </div>
      )}
    </header>
  );
}
