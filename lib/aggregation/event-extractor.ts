import type { NormalizedFeedItem } from "./normalizer";

export interface ExtractedEvent {
  title: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  location: string;
  isOnline: boolean;
  registrationUrl: string;
  sourceName: string;
  canonicalUrl: string;
}

const eventKeywords = /conf[ée]rence|rassemblement|gala|webinaire|webinar|rencontre|c[ée]l[ée]bration|s[ée]minaire|meetup/i;
const datePattern = /(\d{1,2})[\s/-](\d{1,2})[\s/-](\d{2,4})/;
const isoDatePattern = /(20\d{2})-(\d{2})-(\d{2})/;
const onlinePattern = /en ligne|online|webinaire|webinar|zoom|teams|meet/i;

function parseDate(text: string): Date | null {
  const iso = text.match(isoDatePattern);
  if (iso) return new Date(`${iso[1]}-${iso[2]}-${iso[3]}T09:00:00`);
  const match = text.match(datePattern);
  if (!match) return null;
  const year = Number(match[3].length === 2 ? `20${match[3]}` : match[3]);
  const date = new Date(year, Number(match[2]) - 1, Number(match[1]), 9);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function extractEvent(item: NormalizedFeedItem): ExtractedEvent | null {
  const text = `${item.title} ${item.excerpt}`;
  if (!eventKeywords.test(text)) return null;
  const startDate = parseDate(text);
  if (!startDate) return null;
  const urlMatch = text.match(/https?:\/\/[^\s<]+/i);
  return {
    title: item.title,
    description: item.excerpt,
    startDate,
    location: onlinePattern.test(text) ? "Online" : "See official announcement",
    isOnline: onlinePattern.test(text),
    registrationUrl: urlMatch?.[0] ?? item.canonicalUrl,
    sourceName: item.sourceName,
    canonicalUrl: item.canonicalUrl,
  };
}