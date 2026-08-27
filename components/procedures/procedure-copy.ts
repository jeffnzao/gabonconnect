import type { Messages } from "@/lib/i18n";

const copy = {
  "passeport-renouvellement": { title: "passportTitle", description: "passportDescription", stepPrefix: "passportStep" },
  "immatriculation-consulaire": { title: "consularTitle", description: "consularDescription", stepPrefix: "consularStep" },
  "acte-naissance": { title: "birthTitle", description: "birthDescription", stepPrefix: "birthStep" },
  "attestation-non-boursier": { title: "studentTitle", description: "studentDescription", stepPrefix: "studentStep" },
} as const;

type ProcedureCopyKey = keyof Messages["procedures"];

export function getProcedureTitle(messages: Messages, slug: string, fallback: string) {
  const key = copy[slug as keyof typeof copy]?.title as ProcedureCopyKey | undefined;
  return key ? messages.procedures[key] : fallback;
}

export function getProcedureDescription(messages: Messages, slug: string, fallback: string) {
  const key = copy[slug as keyof typeof copy]?.description as ProcedureCopyKey | undefined;
  return key ? messages.procedures[key] : fallback;
}

export function getStepTitle(messages: Messages, slug: string, order: number, fallback: string) {
  const prefix = copy[slug as keyof typeof copy]?.stepPrefix;
  if (!prefix) return fallback;
  const key = `${prefix}${order}` as ProcedureCopyKey;
  return messages.procedures[key] ?? fallback;
}

export function getStepDescription(messages: Messages, slug: string, order: number, fallback: string) {
  const prefix = copy[slug as keyof typeof copy]?.stepPrefix;
  if (!prefix) return fallback;
  const key = `${prefix.replace("Step", "Description")}${order}` as ProcedureCopyKey;
  return messages.procedures[key] ?? fallback;
}
