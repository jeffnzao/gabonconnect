import type { ArticleCategory } from "@/app/generated/prisma";

const rules: Array<[ArticleCategory, string[]]> = [
  ["ADMINISTRATIVE", ["consulat", "passeport", "visa", "etat civil", "ambassade", "inscription"]],
  ["CAMPUS", ["campus", "universit", "bourse", "etudiant", "ecole", "inscription"]],
  ["OPPORTUNITIES", ["emploi", "recrut", "stage", "opportunit", "appel a projet"]],
  ["CULTURE", ["culture", "musique", "art", "festival", "patrimoine"]],
  ["SPORT", ["sport", "football", "athlet", "competition"]],
  ["DIASPORA", ["diaspora", "communaute", "gabonais de", "expatr", "amicale"]],
  ["INTERNATIONAL", ["international", "monde", "afrique", "etranger"]],
];

export function classifyArticle(title: string, excerpt: string): ArticleCategory {
  const text = `${title} ${excerpt}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  return rules.find(([, keywords]) => keywords.some((keyword) => text.includes(keyword)))?.[0] ?? "GABON";
}