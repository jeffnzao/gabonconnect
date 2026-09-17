"use client";

import { useEffect } from "react";
import { Loader2, Pause, Play, Radio } from "lucide-react";
import { useAudioPlayer } from "@/components/audio/audio-player-context";
import { AUDIO_GENRE_LABELS, radioStationToTrack } from "@/types/audio";
import type { RadioStation } from "@/types/audio";

interface RadioChannelProps {
  stations: RadioStation[];
  /** Lance automatiquement la première station au chargement (best-effort). */
  autoplay?: boolean;
}

export default function RadioChannel({ stations, autoplay = false }: RadioChannelProps) {
  const player = useAudioPlayer();

  const playStation = (station: RadioStation) => {
    const queue = stations.map(radioStationToTrack);
    player.play(radioStationToTrack(station), queue);
  };

  // Autoplay best-effort : la plupart des navigateurs bloquent la lecture sans
  // interaction. On tente quand même, et le blocage est géré silencieusement
  // (le bouton Lire reste disponible). On ne lance qu'une fois, à vide.
  useEffect(() => {
    if (!autoplay || stations.length === 0) return;
    if (player.currentTrack) return;
    playStation(stations[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay]);

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {stations.map((station) => {
        const isCurrent = player.currentTrack?.id === station.id;
        const isPlaying = isCurrent && player.status === "playing";
        const isLoading = isCurrent && player.status === "loading";

        return (
          <li key={station.id}>
            <article
              className={`flex h-full flex-col gap-4 rounded-2xl border p-5 transition-colors ${
                isCurrent
                  ? "border-emerald-300 bg-emerald-50/60"
                  : "border-slate-200 bg-white hover:border-emerald-200"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-emerald-400">
                    <Radio className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">{station.name}</h2>
                    <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">
                      {AUDIO_GENRE_LABELS[station.genre]}
                      {station.isLive ? " · Direct" : ""}
                    </p>
                  </div>
                </div>
              </div>

              <p className="flex-1 text-sm leading-6 text-slate-600">{station.description}</p>

              <button
                type="button"
                onClick={() => (isPlaying ? player.pause() : playStation(station))}
                aria-label={isPlaying ? `Mettre en pause ${station.name}` : `Écouter ${station.name}`}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    Connexion…
                  </>
                ) : isPlaying ? (
                  <>
                    <Pause className="h-4 w-4" aria-hidden />
                    En lecture
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" aria-hidden />
                    Écouter
                  </>
                )}
              </button>
            </article>
          </li>
        );
      })}
    </ul>
  );
}
