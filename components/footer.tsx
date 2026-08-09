import Link from "next/link";
import { Globe2 } from "lucide-react";
import { SITE_NAME, SITE_VERSION } from "@/config/site";

const LINKS = [
  { label: "About", href: "#" },
  { label: "Privacy", href: "#" },
  { label: "Contact", href: "#" },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-10 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-2 text-white">
          <Globe2 className="h-5 w-5 text-emerald-400" aria-hidden />
          <span className="text-sm font-semibold">{SITE_NAME}</span>
          <span className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
            Version {SITE_VERSION}
          </span>
        </div>

        <nav className="flex items-center gap-6 text-sm text-slate-400">
          {LINKS.map((link) => (
            <Link
                key={link.label}
                href={link.href}
                className="transition-colors hover:text-white"
            >
                {link.label}
            </Link>
            ))}
        </nav>

        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} {SITE_NAME} — La 10ᵉ province du
          Gabon.
        </p>
      </div>
    </footer>
  );
}