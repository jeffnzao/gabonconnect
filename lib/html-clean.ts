// Nettoyage du HTML brut encode dans les flux RSS : decodage des entites (&lt; -> <, &amp; -> &, ...)
// et suppression de toutes les balises HTML (<a>, <font>, ...) pour ne conserver que du texte propre.

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  copy: "\u00A9",
  reg: "\u00AE",
  trade: "\u2122",
  hellip: "\u2026",
  mdash: "\u2014",
  ndash: "\u2013",
  laquo: "\u00AB",
  raquo: "\u00BB",
  lsquo: "\u2018",
  rsquo: "\u2019",
  ldquo: "\u201C",
  rdquo: "\u201D",
  eacute: "\u00E9",
  egrave: "\u00E8",
  ecirc: "\u00EA",
  agrave: "\u00E0",
  acirc: "\u00E2",
  ccedil: "\u00E7",
  ugrave: "\u00F9",
  ucirc: "\u00FB",
  icirc: "\u00EE",
  ocirc: "\u00F4",
  euro: "\u20AC",
};

function fromCodePointSafe(code: number): string {
  try {
    if (Number.isNaN(code) || code <= 0 || code > 0x10ffff) return "";
    return String.fromCodePoint(code);
  } catch {
    return "";
  }
}

export function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&#x([0-9a-fA-F]+);/g, (_match, hex: string) => fromCodePointSafe(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_match, dec: string) => fromCodePointSafe(Number.parseInt(dec, 10)))
    .replace(/&([a-zA-Z][a-zA-Z0-9]*);/g, (match, name: string) => NAMED_ENTITIES[name] ?? NAMED_ENTITIES[name.toLowerCase()] ?? match);
}

export function stripHtmlTags(input: string): string {
  return input.replace(/<[^>]*>/g, " ");
}

// Decode -> strip -> decode : gere le HTML double-encode (ex: "&lt;a href=...&gt;texte&lt;/a&gt;").
export function cleanHtmlText(input: string | null | undefined): string {
  if (!input) return "";
  let text = String(input);
  text = decodeHtmlEntities(text);
  text = stripHtmlTags(text);
  text = decodeHtmlEntities(text);
  return text.replace(/\s+/g, " ").trim();
}

// Extrait propre genere a partir du titre quand le resume est vide apres nettoyage.
export function excerptFromTitle(title: string | null | undefined, maxLength = 160): string {
  const cleaned = cleanHtmlText(title);
  if (!cleaned) return "";
  if (cleaned.length <= maxLength) return cleaned;
  return `${cleaned.slice(0, maxLength - 1).trimEnd()}\u2026`;
}

// Resume nettoye avec repli sur le titre si le contenu source est vide.
export function cleanExcerpt(summary: string | null | undefined, title: string | null | undefined, maxLength = 500): string {
  const cleaned = cleanHtmlText(summary);
  if (cleaned) return cleaned.slice(0, maxLength);
  return excerptFromTitle(title, Math.min(maxLength, 160));
}
