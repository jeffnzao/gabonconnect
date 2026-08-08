"use client";

import { useState } from "react";
import Link from "next/link";
import { Globe2, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Explore", href: "/explore" },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-slate-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/join"
          className="hidden items-center rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400 sm:inline-flex"
        >
          Join GabonConnect
        </Link>

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
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/join"
            onClick={() => setIsMenuOpen(false)}
            className="mt-2 inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-slate-950"
          >
            Join GabonConnect
          </Link>
        </nav>
      )}
    </header>
  );
}