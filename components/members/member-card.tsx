import Link from "next/link";
import { CheckCircle2, UserRound, MapPin, Globe2 } from "lucide-react";
import type { MemberListItem } from "@/lib/members";

interface MemberCardProps {
  member: MemberListItem;
}

export default function MemberCard({ member }: MemberCardProps) {
  const fullName = `${member.firstName} ${member.lastName}`;

  return (
    <Link
      href={`/members/${member.id}`}
      className="group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        {member.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={member.photo}
            alt={fullName}
            className="h-14 w-14 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <UserRound className="h-6 w-6" aria-hidden />
          </span>
        )}

        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-slate-900">{fullName}</p>
            {member.isVerified && (
              <span title="Verified profile" className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                <CheckCircle2 className="h-3 w-3" aria-hidden />
                Verified
              </span>
            )}
          </div>
          {member.profession && (
            <p className="text-xs text-slate-500">{member.profession}</p>
          )}
        </div>
      </div>

      {member.city && (
        <p className="flex items-center gap-1.5 text-xs text-slate-500">
          <MapPin className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
          {member.city.name}, {member.city.country.name}
        </p>
      )}
      {member.city && (
        <p className="flex items-center gap-1.5 text-xs text-slate-400">
          <Globe2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
          {member.city.country.continent.name}
        </p>
      )}
    </Link>
  );
}