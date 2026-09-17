/**
 * GabonConnect Audio — types du domaine (Task 075.1)
 *
 * Modèle de droits musicaux inspiré des standards de l'industrie :
 * - Artist         : l'auteur / interprète (personne ou groupe).
 * - AudioWork      : l'œuvre (composition) — l'entité protégée par le droit d'auteur.
 * - Recording      : un enregistrement (master) rattaché à une œuvre.
 * - RightsAgreement: l'accord de droits qui autorise la diffusion sur la plateforme.
 * - PlayEvent      : un événement d'écoute journalisé (mesure, redevances, anti-fraude).
 *
 * Ces types sont volontairement découplés du schéma Prisma : ils décrivent le
 * contrat public utilisé par l'UI (lecteur global, page Radio) et les API audio.
 */

export type AudioGenre =
  | "AFROBEAT"
  | "NDOMBOLO"
  | "TRADITIONNEL"
  | "GOSPEL"
  | "RAP_HIP_HOP"
  | "RNB_SOUL"
  | "ZOUK"
  | "SLAM_SPOKEN_WORD"
  | "PODCAST"
  | "ACTUALITE"
  | "AUTRE";

export const AUDIO_GENRE_LABELS: Record<AudioGenre, string> = {
  AFROBEAT: "Afrobeat",
  NDOMBOLO: "Ndombolo",
  TRADITIONNEL: "Traditionnel",
  GOSPEL: "Gospel",
  RAP_HIP_HOP: "Rap / Hip-Hop",
  RNB_SOUL: "R&B / Soul",
  ZOUK: "Zouk",
  SLAM_SPOKEN_WORD: "Slam / Spoken word",
  PODCAST: "Podcast",
  ACTUALITE: "Actualité",
  AUTRE: "Autre",
};

/** Statut de validation des droits pour une diffusion sur la plateforme. */
export type RightsStatus = "PENDING" | "CLEARED" | "RESTRICTED" | "REJECTED" | "EXPIRED";

/** Type de contrepartie financière rattachée à un accord de droits. */
export type RoyaltyModel = "FREE" | "REVENUE_SHARE" | "FLAT_FEE" | "PER_STREAM";

/**
 * Artist — auteur ou interprète.
 */
export interface Artist {
  id: string;
  slug: string;
  displayName: string;
  /** Pays d'attache principal (ISO 3166-1 alpha-2), utile pour la diaspora. */
  countryCode?: string;
  city?: string;
  bio?: string;
  avatarUrl?: string;
  verified: boolean;
  createdAt: string;
}

/**
 * AudioWork — l'œuvre (composition). Entité de référence pour les droits.
 */
export interface AudioWork {
  id: string;
  slug: string;
  title: string;
  artistId: string;
  artist?: Artist;
  genre: AudioGenre;
  /** Code ISWC de l'œuvre lorsqu'il est connu. */
  iswc?: string;
  releaseYear?: number;
  language?: string;
  explicit: boolean;
  coverUrl?: string;
  createdAt: string;
}

/**
 * Recording — un master audio concret rattaché à une œuvre.
 */
export interface Recording {
  id: string;
  workId: string;
  work?: AudioWork;
  /** Code ISRC de l'enregistrement lorsqu'il est connu. */
  isrc?: string;
  /** URL de diffusion (HLS, MP3 progressif, ou flux radio). */
  streamUrl: string;
  /** Durée en secondes. `null` pour un flux radio en continu. */
  durationSec: number | null;
  bitrateKbps?: number;
  /** Vrai pour un flux radio/live sans durée finie. */
  isLiveStream: boolean;
  rights?: RightsAgreement;
  createdAt: string;
}

/**
 * RightsAgreement — accord de droits autorisant la diffusion d'un enregistrement.
 */
export interface RightsAgreement {
  id: string;
  recordingId: string;
  status: RightsStatus;
  royaltyModel: RoyaltyModel;
  /** Part reversée à l'ayant droit (0..1) pour un modèle REVENUE_SHARE. */
  revenueSharePct?: number;
  /** Territoires autorisés (ISO 3166-1 alpha-2). `["*"]` = monde entier. */
  territories: string[];
  rightsHolder: string;
  validFrom: string;
  validUntil?: string;
  documentUrl?: string;
}

/**
 * PlayEvent — événement d'écoute journalisé.
 *
 * Base des redevances et des mesures anti-fraude : chaque lecture significative
 * est enregistrée avec des signaux permettant de détecter les écoutes
 * frauduleuses (bots, boucles, fermes de streaming).
 */
export interface PlayEvent {
  id: string;
  recordingId: string;
  /** Utilisateur authentifié, ou `null` pour une écoute anonyme. */
  userId: string | null;
  /** Session anonyme (cookie/localStorage) pour le dédoublonnage. */
  sessionId: string;
  startedAt: string;
  /** Secondes réellement écoutées (pour le seuil de comptabilisation). */
  playedSec: number;
  /** Vrai lorsque le seuil de redevance est atteint (>= 30s par convention). */
  countedForRoyalty: boolean;
  /** Score de risque anti-fraude (0 = sûr, 1 = très suspect). */
  fraudScore: number;
  source: PlaybackSource;
  countryCode?: string;
}

export type PlaybackSource = "RADIO" | "LIBRARY" | "PLAYLIST" | "SHARE" | "EMBED";

/* ------------------------------------------------------------------ */
/* Types côté lecteur (UI)                                             */
/* ------------------------------------------------------------------ */

/**
 * AudioTrack — projection allégée d'un enregistrement, prête pour le lecteur.
 * C'est le contrat que consomme le lecteur global et la page Radio.
 */
export interface AudioTrack {
  id: string;
  title: string;
  artistName: string;
  streamUrl: string;
  coverUrl?: string;
  durationSec: number | null;
  isLiveStream: boolean;
  genre?: AudioGenre;
  source: PlaybackSource;
}

/** État de lecture exposé par le contexte du lecteur global. */
export type PlaybackStatus = "idle" | "loading" | "playing" | "paused" | "error";

export interface PlayerState {
  status: PlaybackStatus;
  currentTrack: AudioTrack | null;
  queue: AudioTrack[];
  currentIndex: number;
  positionSec: number;
  durationSec: number;
  volume: number;
  muted: boolean;
}

/** Station de la chaîne GabonConnect Radio. */
export interface RadioStation {
  id: string;
  slug: string;
  name: string;
  description: string;
  streamUrl: string;
  coverUrl?: string;
  /** Genre dominant de la station, à titre indicatif. */
  genre: AudioGenre;
  /** Vrai si la station diffuse un direct (autoplay au clic). */
  isLive: boolean;
}

/** Convertit une station radio en piste lisible par le lecteur global. */
export function radioStationToTrack(station: RadioStation): AudioTrack {
  return {
    id: station.id,
    title: station.name,
    artistName: "GabonConnect Radio",
    streamUrl: station.streamUrl,
    coverUrl: station.coverUrl,
    durationSec: null,
    isLiveStream: true,
    genre: station.genre,
    source: "RADIO",
  };
}
