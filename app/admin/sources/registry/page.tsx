import { LegacySourcesPage } from "@/app/admin/sources/page";

type Props = { searchParams: Promise<{ q?: string; type?: string; active?: string; page?: string }> };

export default function SourceRegistryPage({ searchParams }: Props) {
  return <LegacySourcesPage searchParams={searchParams} />;
}