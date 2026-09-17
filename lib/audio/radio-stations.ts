import type { RadioStation } from "@/types/audio";

/**
 * Chaînes de la radio GabonConnect (MVP — Task 075.1).
 *
 * Les URLs de flux sont configurables via variables d'environnement afin de
 * pointer vers les vrais flux de production sans modifier le code. En preview,
 * une valeur de démonstration reste utilisée pour valider le lecteur.
 */
const DEMO_STREAM =
  process.env.NEXT_PUBLIC_RADIO_DEMO_STREAM ??
  "https://stream.radioparadise.com/mp3-128";

export const RADIO_STATIONS: RadioStation[] = [
  {
    id: "gc-radio-main",
    slug: "gabonconnect",
    name: "GabonConnect Radio",
    description:
      "La chaîne principale : musique gabonaise, sons de la diaspora et actualités de la communauté, 24h/24.",
    streamUrl: process.env.NEXT_PUBLIC_RADIO_MAIN_STREAM ?? DEMO_STREAM,
    genre: "AFROBEAT",
    isLive: true,
  },
  {
    id: "gc-radio-tradition",
    slug: "heritage",
    name: "Héritage",
    description:
      "Rythmes traditionnels et patrimoine musical du Gabon : Fang, Punu, Nzébi et bien plus.",
    streamUrl: process.env.NEXT_PUBLIC_RADIO_HERITAGE_STREAM ?? DEMO_STREAM,
    genre: "TRADITIONNEL",
    isLive: true,
  },
  {
    id: "gc-radio-urban",
    slug: "urban",
    name: "Urban 241",
    description:
      "La nouvelle scène urbaine gabonaise : rap, afrobeat et R&B des talents d'ici et d'ailleurs.",
    streamUrl: process.env.NEXT_PUBLIC_RADIO_URBAN_STREAM ?? DEMO_STREAM,
    genre: "RAP_HIP_HOP",
    isLive: true,
  },
  {
    id: "gc-radio-talk",
    slug: "voix-diaspora",
    name: "Voix de la Diaspora",
    description:
      "Podcasts, débats et récits de la communauté gabonaise à travers le monde.",
    streamUrl: process.env.NEXT_PUBLIC_RADIO_TALK_STREAM ?? DEMO_STREAM,
    genre: "PODCAST",
    isLive: true,
  },
];

export function getRadioStations(): RadioStation[] {
  return RADIO_STATIONS;
}

export function getRadioStationBySlug(slug: string): RadioStation | undefined {
  return RADIO_STATIONS.find((station) => station.slug === slug);
}
