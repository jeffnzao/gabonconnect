import type { ArticleCategory } from "@/app/generated/prisma";

const rules: Array<[ArticleCategory, string[]]> = [
  ["ADMINISTRATIVE", ["consulat", "passeport", "visa", "etat civil", "ambassade"]],
  ["CAMPUS", ["campus", "universit", "bourse", "etudiant", "ecole"]],
  ["OPPORTUNITIES", ["emploi", "recrut", "stage", "opportunit", "appel a projet"]],
  ["CULTURE", ["culture", "musique", "art", "festival", "patrimoine"]],
  ["SPORT", ["sport", "football", "athlet", "competition"]],
  ["DIASPORA", ["diaspora", "communaute", "gabonais de", "expatr"]],
  ["INTERNATIONAL", ["international", "monde", "afrique", "etranger"]],
];

export function classifyArticle(title: string, excerpt: string): ArticleCategory {
  const text = `${title} ${excerpt}`.toLowerCase();
  return rules.find(([, keywords]) => keywords.some((keyword) => text.includes(keyword)))?.[0] ?? "GABON";
}