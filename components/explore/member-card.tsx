import Link from "next/link";
import { UserRound } from "lucide-react";
import type { CityProfile } from "@/lib/explore";

interface MemberCardProps {
  profile: CityProfile;
}

export default function MemberCard({ profile }: MemberCardProps) {
  const fullName = `${profile.firstName} ${profile.lastName}`;

  return (
    <Link
      href={`/members/${profile.id}`}
      className="group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        {profile.photo ? (
          // Photos utilisateurs : hébergées sur Supabase Storage, domaines
          // non connus à l'avance, on reste sur <img> plutôt que next/image.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.photo}
            alt={fullName}
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <UserRound className="h-5 w-5" aria-hidden />
          </span>
        )}

        <div>
          <p className="text-sm font-semibold text-slate-900">{fullName}</p>
          {profile.profession && (
            <p className="text-xs text-slate-500">{profile.profession}</p>
          )}
        </div>
      </div>

      {profile.bio && (
        <p className="line-clamp-2 text-sm leading-relaxed text-slate-500">
          {profile.bio}
        </p>
      )}
    </Link>
  );
}