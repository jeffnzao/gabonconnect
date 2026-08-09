import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { UserRound, MapPin, Briefcase } from "lucide-react";
import { getMemberById } from "@/lib/members";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: PageProps<"/members/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const member = await getMemberById(id);

  if (!member) {
    return { title: "Profil introuvable | GabonConnect" };
  }

  return {
    title: `${member.firstName} ${member.lastName} | GabonConnect`,
    description: member.bio ?? `${member.firstName} ${member.lastName} sur GabonConnect.`,
  };
}

export default async function MemberProfilePage(props: PageProps<"/members/[id]">) {
  const { id } = await props.params;
  const member = await getMemberById(id);

  if (!member) {
    notFound();
  }

  const fullName = `${member.firstName} ${member.lastName}`;

  return (
    <div className="flex flex-1 flex-col bg-slate-50">
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-14">
          <Link href="/members" className="text-sm font-medium text-slate-500 transition-colors hover:text-emerald-600">
            ← Back to directory
          </Link>

          <div className="mt-8 flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
            {member.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={member.photo} alt={fullName} className="h-24 w-24 rounded-full object-cover" />
            ) : (
              <span className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <UserRound className="h-10 w-10" aria-hidden />
              </span>
            )}

            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{fullName}</h1>

              {member.profession && (
                <p className="mt-1 flex items-center justify-center gap-1.5 text-slate-500 sm:justify-start">
                  <Briefcase className="h-4 w-4" aria-hidden />
                  {member.profession}
                </p>
              )}

              {member.city && (
                <p className="mt-1 flex items-center justify-center gap-1.5 text-slate-500 sm:justify-start">
                  <MapPin className="h-4 w-4" aria-hidden />
                  {member.city.name}, {member.city.country.name}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {member.bio && (
        <section className="mx-auto w-full max-w-3xl px-6 py-12">
          <h2 className="text-lg font-semibold text-slate-900">About</h2>
          <p className="mt-3 whitespace-pre-line leading-relaxed text-slate-600">{member.bio}</p>
        </section>
      )}
    </div>
  );
}