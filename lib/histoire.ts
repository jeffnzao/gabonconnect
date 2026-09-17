/**
 * Task 076 — Phase 5 : Mémoire & Histoire du Gabon.
 *
 * Module de données autonome (aucune dépendance base de données) fournissant :
 *  - la taxonomie des périodes historiques (P1 → P7) ;
 *  - la taxonomie des niveaux de preuve / confiance (LEVEL_A → LEVEL_D) ;
 *  - un jeu de données de démonstration complet en français (événements, figures,
 *    archives, récits de la diaspora).
 */

/** Périodes historiques structurantes (P1 → P7). */
export type PeriodId = "P1" | "P2" | "P3" | "P4" | "P5" | "P6" | "P7";

export interface HistoricalPeriod {
  id: PeriodId;
  label: string;
  timespan: string;
  summary: string;
}

export const HISTORICAL_PERIODS: readonly HistoricalPeriod[] = [
  {
    id: "P1",
    label: "Préhistoire & migrations",
    timespan: "Avant le XVe siècle",
    summary:
      "Peuplement ancien du bassin de l'Ogooué, migrations bantoues et implantation des premiers peuples (Pygmées Baka, groupes bantous).",
  },
  {
    id: "P2",
    label: "Royaumes & premiers contacts",
    timespan: "XVe – XVIIe siècle",
    summary:
      "Organisation en clans et royaumes côtiers, arrivée des navigateurs portugais et débuts des échanges atlantiques.",
  },
  {
    id: "P3",
    label: "Commerce atlantique & traite",
    timespan: "XVIIe – XIXe siècle",
    summary:
      "Intensification du commerce côtier, période de la traite négrière et recompositions des sociétés du littoral.",
  },
  {
    id: "P4",
    label: "Colonisation française",
    timespan: "1839 – 1910",
    summary:
      "Traité avec le roi Denis, fondation de Libreville par des esclaves affranchis, mise en place de l'administration coloniale.",
  },
  {
    id: "P5",
    label: "Afrique-Équatoriale française",
    timespan: "1910 – 1958",
    summary:
      "Intégration à l'AEF, économie de concession, montée des élites et des premiers mouvements politiques gabonais.",
  },
  {
    id: "P6",
    label: "Indépendance & République",
    timespan: "1960 – 1990",
    summary:
      "Accession à l'indépendance le 17 août 1960, construction de l'État, présidences de Léon Mba puis Omar Bongo Ondimba.",
  },
  {
    id: "P7",
    label: "Époque contemporaine & transition",
    timespan: "1990 – aujourd'hui",
    summary:
      "Ouverture démocratique, alternances, transition institutionnelle et essor de la diaspora connectée.",
  },
] as const;

/** Niveaux de preuve / confiance (LEVEL_A → LEVEL_D). */
export type SourceLevel = "LEVEL_A" | "LEVEL_B" | "LEVEL_C" | "LEVEL_D";

export interface SourceLevelMeta {
  id: SourceLevel;
  label: string;
  description: string;
  /** Classe Tailwind utilisée pour le badge de niveau. */
  badgeClass: string;
}

export const SOURCE_LEVELS: readonly SourceLevelMeta[] = [
  {
    id: "LEVEL_A",
    label: "Niveau A — Archives / Académique",
    description: "Source primaire, archive officielle ou publication académique vérifiée.",
    badgeClass: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
  },
  {
    id: "LEVEL_B",
    label: "Niveau B — Institutionnel",
    description: "Publication institutionnelle, presse de référence ou ouvrage documenté.",
    badgeClass: "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-600/20",
  },
  {
    id: "LEVEL_C",
    label: "Niveau C — Secondaire",
    description: "Source secondaire, encyclopédique ou journalistique à recouper.",
    badgeClass: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
  },
  {
    id: "LEVEL_D",
    label: "Niveau D — Tradition orale",
    description: "Histoire orale, témoignage ou tradition transmise, à documenter.",
    badgeClass: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20",
  },
] as const;

export const SOURCE_LEVEL_MAP: Record<SourceLevel, SourceLevelMeta> = Object.fromEntries(
  SOURCE_LEVELS.map((level) => [level.id, level]),
) as Record<SourceLevel, SourceLevelMeta>;

export const PERIOD_MAP: Record<PeriodId, HistoricalPeriod> = Object.fromEntries(
  HISTORICAL_PERIODS.map((period) => [period.id, period]),
) as Record<PeriodId, HistoricalPeriod>;

export function isPeriodId(value: string | undefined): value is PeriodId {
  return Boolean(value) && value! in PERIOD_MAP;
}

/** Événement de la frise chronologique. */
export interface HistoricalEvent {
  id: string;
  year: string;
  title: string;
  period: PeriodId;
  sourceLevel: SourceLevel;
  description: string;
}

/** Figure emblématique. */
export interface HistoricalFigure {
  id: string;
  fullName: string;
  role: string;
  lifespan: string;
  period: PeriodId;
  sourceLevel: SourceLevel;
  biography: string;
  legacy: string;
}

/** Archive / document historique. */
export interface HistoricalArchive {
  id: string;
  title: string;
  reference: string;
  period: PeriodId;
  sourceLevel: SourceLevel;
  nature: string;
  description: string;
}

/** Récit contribué par la diaspora. */
export interface DiasporaStory {
  id: string;
  author: string;
  location: string;
  period: PeriodId;
  sourceLevel: SourceLevel;
  title: string;
  excerpt: string;
}

export const HISTORICAL_EVENTS: readonly HistoricalEvent[] = [
  {
    id: "evt-migrations",
    year: "≈ 1000",
    title: "Migrations bantoues dans le bassin de l'Ogooué",
    period: "P1",
    sourceLevel: "LEVEL_C",
    description:
      "Des populations bantoues s'installent progressivement dans les forêts de l'Ogooué, aux côtés des peuples pygmées déjà présents.",
  },
  {
    id: "evt-portugais",
    year: "1472",
    title: "Arrivée des navigateurs portugais",
    period: "P2",
    sourceLevel: "LEVEL_B",
    description:
      "Les Portugais atteignent l'estuaire du Komo. Le nom « Gabon » dériverait de « gabão », le manteau à capuche évoquant la forme de l'estuaire.",
  },
  {
    id: "evt-traite",
    year: "XVIIIe s.",
    title: "Apogée du commerce atlantique côtier",
    period: "P3",
    sourceLevel: "LEVEL_C",
    description:
      "Les comptoirs du littoral participent aux échanges atlantiques, dont la traite négrière, recomposant les sociétés côtières.",
  },
  {
    id: "evt-traite-denis",
    year: "1839",
    title: "Traité avec le roi Denis (Antchouwé Kowe Rapontchombo)",
    period: "P4",
    sourceLevel: "LEVEL_A",
    description:
      "Le roi Denis signe un traité avec la France, ouvrant la voie à l'implantation française sur les rives du Gabon.",
  },
  {
    id: "evt-libreville",
    year: "1849",
    title: "Fondation de Libreville",
    period: "P4",
    sourceLevel: "LEVEL_A",
    description:
      "Des captifs libérés du navire négrier L'Élizia fondent l'établissement qui deviendra Libreville, la « ville libre ».",
  },
  {
    id: "evt-aef",
    year: "1910",
    title: "Création de l'Afrique-Équatoriale française",
    period: "P5",
    sourceLevel: "LEVEL_A",
    description:
      "Le Gabon est intégré à l'AEF aux côtés du Moyen-Congo, de l'Oubangui-Chari et du Tchad, sous administration coloniale.",
  },
  {
    id: "evt-independance",
    year: "1960",
    title: "Indépendance du Gabon",
    period: "P6",
    sourceLevel: "LEVEL_A",
    description:
      "Le 17 août 1960, le Gabon accède à l'indépendance. Léon Mba devient le premier président de la République gabonaise.",
  },
  {
    id: "evt-bongo",
    year: "1967",
    title: "Accession d'Omar Bongo à la présidence",
    period: "P6",
    sourceLevel: "LEVEL_A",
    description:
      "À la mort de Léon Mba, Albert-Bernard (Omar) Bongo devient président et dirigera le pays pendant plus de quatre décennies.",
  },
  {
    id: "evt-multipartisme",
    year: "1990",
    title: "Conférence nationale et retour au multipartisme",
    period: "P7",
    sourceLevel: "LEVEL_A",
    description:
      "La Conférence nationale de 1990 ouvre une période de pluralisme politique et de réformes institutionnelles.",
  },
  {
    id: "evt-rogombe",
    year: "2009",
    title: "Rose Francine Rogombé, présidente par intérim",
    period: "P7",
    sourceLevel: "LEVEL_A",
    description:
      "Présidente du Sénat, Rose Francine Rogombé assure l'intérim de la présidence, une première pour une femme au Gabon.",
  },
  {
    id: "evt-transition",
    year: "2023",
    title: "Transition institutionnelle",
    period: "P7",
    sourceLevel: "LEVEL_B",
    description:
      "Un changement de gouvernance ouvre une période de transition et de réformes constitutionnelles.",
  },
] as const;

export const HISTORICAL_FIGURES: readonly HistoricalFigure[] = [
  {
    id: "fig-denis",
    fullName: "Roi Denis (Antchouwé Kowe Rapontchombo)",
    role: "Souverain Mpongwè",
    lifespan: "≈ 1780 – 1876",
    period: "P4",
    sourceLevel: "LEVEL_B",
    biography:
      "Chef influent du peuple Mpongwè sur la rive sud de l'estuaire, diplomate et commerçant, signataire du traité de 1839 avec la France.",
    legacy:
      "Figure fondatrice des relations franco-gabonaises ; la pointe Denis porte son nom.",
  },
  {
    id: "fig-leon-mba",
    fullName: "Léon Mba",
    role: "Premier président de la République",
    lifespan: "1902 – 1967",
    period: "P6",
    sourceLevel: "LEVEL_A",
    biography:
      "Homme politique originaire de Libreville, maire puis premier chef de l'État gabonais à l'indépendance de 1960.",
    legacy:
      "Père fondateur de l'État gabonais moderne ; l'aéroport international de Libreville porte son nom.",
  },
  {
    id: "fig-omar-bongo",
    fullName: "Omar Bongo Ondimba",
    role: "Président de la République",
    lifespan: "1935 – 2009",
    period: "P6",
    sourceLevel: "LEVEL_A",
    biography:
      "Président du Gabon de 1967 à 2009, l'un des plus longs mandats de l'histoire africaine contemporaine.",
    legacy:
      "Acteur majeur de la diplomatie régionale et de la construction institutionnelle du pays.",
  },
  {
    id: "fig-rogombe",
    fullName: "Rose Francine Rogombé",
    role: "Présidente de la République par intérim",
    lifespan: "1942 – 2015",
    period: "P7",
    sourceLevel: "LEVEL_A",
    biography:
      "Magistrate et femme d'État, présidente du Sénat, elle assure l'intérim de la présidence en 2009.",
    legacy:
      "Première femme à exercer la fonction présidentielle au Gabon, symbole de l'engagement des femmes en politique.",
  },
  {
    id: "fig-pierre-akendengue",
    fullName: "Pierre Akendengué",
    role: "Auteur-compositeur, poète",
    lifespan: "Né en 1943",
    period: "P7",
    sourceLevel: "LEVEL_B",
    biography:
      "Musicien et poète majeur, il mêle traditions gabonaises et engagement, portant la culture du pays à l'international.",
    legacy:
      "Ambassadeur culturel du Gabon et voix de la mémoire collective à travers ses œuvres.",
  },
  {
    id: "fig-anguile",
    fullName: "André Gustave Anguilé",
    role: "Économiste et homme d'État",
    lifespan: "1927 – 2006",
    period: "P6",
    sourceLevel: "LEVEL_B",
    biography:
      "Ministre de l'économie des premières années de l'indépendance, artisan des institutions économiques du jeune État.",
    legacy:
      "Contributeur clé de la structuration économique du Gabon post-indépendance.",
  },
] as const;

export const HISTORICAL_ARCHIVES: readonly HistoricalArchive[] = [
  {
    id: "arc-traite-1839",
    title: "Traité franco-gabonais de 1839",
    reference: "Archives nationales d'outre-mer",
    period: "P4",
    sourceLevel: "LEVEL_A",
    nature: "Traité diplomatique",
    description:
      "Document actant l'accord entre le roi Denis et la France, pièce fondatrice de la présence française au Gabon.",
  },
  {
    id: "arc-libreville-1849",
    title: "Acte de fondation de Libreville",
    reference: "Archives coloniales, 1849",
    period: "P4",
    sourceLevel: "LEVEL_A",
    nature: "Acte administratif",
    description:
      "Documents relatifs à l'installation des captifs affranchis et à la naissance de la « ville libre ».",
  },
  {
    id: "arc-aef-1910",
    title: "Décret de création de l'AEF",
    reference: "Journal officiel, 1910",
    period: "P5",
    sourceLevel: "LEVEL_A",
    nature: "Décret",
    description:
      "Texte organisant l'Afrique-Équatoriale française et le statut administratif du Gabon.",
  },
  {
    id: "arc-independance-1960",
    title: "Proclamation d'indépendance du 17 août 1960",
    reference: "Archives nationales du Gabon",
    period: "P6",
    sourceLevel: "LEVEL_A",
    nature: "Acte constitutionnel",
    description:
      "Document officiel proclamant l'accession du Gabon à la souveraineté internationale.",
  },
  {
    id: "arc-conference-1990",
    title: "Actes de la Conférence nationale de 1990",
    reference: "Documentation nationale, 1990",
    period: "P7",
    sourceLevel: "LEVEL_B",
    nature: "Compte rendu",
    description:
      "Ensemble des résolutions ayant ouvert le retour au multipartisme et aux réformes politiques.",
  },
] as const;

export const DIASPORA_STORIES: readonly DiasporaStory[] = [
  {
    id: "dsp-paris",
    author: "Nadège M.",
    location: "Paris, France",
    period: "P7",
    sourceLevel: "LEVEL_D",
    title: "Grandir entre l'Ogooué et la Seine",
    excerpt:
      "Ma grand-mère me racontait Lambaréné pendant que nous vivions à Paris. Ces récits sont devenus mon lien vivant avec le Gabon.",
  },
  {
    id: "dsp-montreal",
    author: "Serge O.",
    location: "Montréal, Canada",
    period: "P7",
    sourceLevel: "LEVEL_D",
    title: "La radio de la diaspora",
    excerpt:
      "Chaque dimanche, nous nous retrouvions autour d'une émission gabonaise. La musique d'Akendengué nous ramenait au pays.",
  },
  {
    id: "dsp-bruxelles",
    author: "Aïcha B.",
    location: "Bruxelles, Belgique",
    period: "P7",
    sourceLevel: "LEVEL_D",
    title: "Transmettre le fang aux enfants",
    excerpt:
      "Loin de Libreville, j'enseigne les proverbes fang à mes enfants pour que la langue et la mémoire ne s'éteignent pas.",
  },
  {
    id: "dsp-dakar",
    author: "Christian N.",
    location: "Dakar, Sénégal",
    period: "P7",
    sourceLevel: "LEVEL_D",
    title: "Étudiant gabonais en Afrique de l'Ouest",
    excerpt:
      "Notre association d'étudiants gabonais à Dakar organise chaque année la commémoration du 17 août, loin mais fiers.",
  },
] as const;
