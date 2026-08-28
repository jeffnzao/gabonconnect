import type { NormalizedFeedItem } from "./normalizer";
import type { OpportunityType, ScholarshipLevel } from "@/app/generated/prisma";

export interface ExtractedOpportunity {
  title: string;
  description: string;
  type: OpportunityType;
  scholarshipLevel?: ScholarshipLevel;
  location: string;
  deadline?: Date;
  applicationUrl: string;
  canonicalUrl: string;
  sourceName: string;
}

const scholarshipKeywords = /bourse|financement|subvention|grant|scholarship/i;
const opportunityKeywords = /recrutement|offre d'emploi|emploi|stage|appel a projets?|appel d'offres|benevolat|candidature/i;
const deadlinePattern = /(date limite|deadline|avant le|jusqu'au|jusqu au)\D{0,20}(\d{1,2}[\s/-]\d{1,2}[\s/-]\d{2,4}|20\d{2}-\d{2}-\d{2})/i;
const urlPattern = /https?:\/\/[^\s<]+/i;

function parseDate(value: string) {
  const iso = value.match(/(20\d{2})-(\d{2})-(\d{2})/);
  if (iso) return new Date(`${iso[1]}-${iso[2]}-${iso[3]}T23:59:59`);
  const numeric = value.match(/(\d{1,2})[\s/-](\d{1,2})[\s/-](\d{2,4})/);
  if (!numeric) return undefined;
  const year = Number(numeric[3].length === 2 ? `20${numeric[3]}` : numeric[3]);
  const date = new Date(year, Number(numeric[2]) - 1, Number(numeric[1]), 23, 59, 59);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function inferType(text: string): OpportunityType {
  if (/stage/i.test(text)) return "INTERNSHIP";
  if (/benevolat|volunteer/i.test(text)) return "VOLUNTEERING";
  if (/appel a projets?|grant|subvention|financement/i.test(text)) return "PROJECT_CALL";
  return "JOB";
}

function inferLevel(text: string): ScholarshipLevel {
  if (/doctorat|phd/i.test(text)) return "DOCTORAT";
  if (/master/i.test(text)) return "MASTER";
  return "LICENCE";
}

export function extractOpportunity(item: NormalizedFeedItem): ExtractedOpportunity | null {
  const text = `${item.title} ${item.excerpt}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (!scholarshipKeywords.test(text) && !opportunityKeywords.test(text)) return null;
  const deadlineMatch = text.match(deadlinePattern);
  const deadline = deadlineMatch ? parseDate(deadlineMatch[2]) : undefined;
  const applicationUrl = text.match(urlPattern)?.[0] ?? item.canonicalUrl;
  return {
    title: item.title,
    description: item.excerpt,
    type: inferType(text),
    scholarshipLevel: scholarshipKeywords.test(text) ? inferLevel(text) : undefined,
    location: /remote|distance|en ligne|online/i.test(text) ? "Remote" : "See official announcement",
    deadline,
    applicationUrl,
    canonicalUrl: item.canonicalUrl,
    sourceName: item.sourceName,
  };
}
