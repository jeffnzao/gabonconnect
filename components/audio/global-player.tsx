"use client";

import Image from "next/image";
import {
  Loader2,
  Pause,
  Play,
  Radio,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useAudioPlayer } from "@/components/audio/audio-player-context";

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Lecteur audio global persistant, ancré en bas de l'écran.
 * Monté une seule fois dans le layout : il reste actif pendant la navigation.
 */
export default function GlobalPlayer() {
  const player = useAudioPlayer();
  const {
    currentTrack,
    status,
    positionSec,
    durationSec,
    volume,
    muted,
    currentIndex,
    queue,
    isLiveStream,
  } = { ...player, isLiveStream: player.currentTrack?.isLiveStream ?? false };

  if (!currentTrack) return null;

  const isPlaying = status === "playing";
  const isLoading = status === "loading";
  const isError = status === "error";
  const canSeek = !isLiveStream && durationSec > 0;
  const hasPrevious = currentIndex > 0 || positionSec > 3;
  const hasNext = currentIndex >= 0 && currentIndex < queue.length - 1;

  return (
    <div
      role="region"
      aria-label="Lecteur audio GabonConnect"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-slate-200 bg-white/95 backdrop-blur"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-2.5 sm:px-6">
        {/* Barre de progression / indicateur direct */}
        {canSeek ? (
          <div className="flex items-center gap-3 text-[11px] tabular-nums text-slate-500">
            <span className="w-9 text-right">{formatTime(positionSec)}</span>
            <input
              type="range"
              min={0}
              max={durationSec}
              step={1}
              value={Math.min(positionSec, durationSec)}
              onChange={(event) => player.seek(Number(event.target.value))}
              aria-label="Position de lecture"
              className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-slate-200 accent-emerald-500"
            />
            <span className="w-9">{formatTime(durationSec)}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-emerald-600">
            <Radio className="h-3.5 w-3.5" aria-hidden />
            <span>{isError ? "Flux indisponible" : "Direct"}</span>
          </div>
        )}

        <div className="flex items-center gap-3">
          {/* Visuel + métadonnées */}
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-slate-100">
              {currentTrack.coverUrl ? (
                <Image
                  src={currentTrack.coverUrl}
                  alt=""
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-slate-400">
                  <Radio className="h-5 w-5" aria-hidden />
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{currentTrack.title}</p>
              <p className="truncate text-xs text-slate-500">{currentTrack.artistName}</p>
            </div>
          </div>

          {/* Commandes de transport */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={player.previous}
              disabled={!hasPrevious}
              aria-label="Piste précédente"
              className="rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <SkipBack className="h-4 w-4" aria-hidden />
            </button>

            <button
              type="button"
              onClick={player.toggle}
              aria-label={isPlaying ? "Mettre en pause" : "Lire"}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-slate-950 transition-colors hover:bg-emerald-400"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              ) : isPlaying ? (
                <Pause className="h-5 w-5" aria-hidden />
              ) : (
                <Play className="h-5 w-5 translate-x-px" aria-hidden />
              )}
            </button>

            <button
              type="button"
              onClick={player.next}
              disabled={!hasNext}
              aria-label="Piste suivante"
              className="rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <SkipForward className="h-4 w-4" aria-hidden />
            </button>
          </div>

          {/* Volume + fermeture */}
          <div className="ml-1 hidden items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={player.toggleMute}
              aria-label={muted ? "Réactiver le son" : "Couper le son"}
              className="rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-100"
            >
              {muted || volume === 0 ? (
                <VolumeX className="h-4 w-4" aria-hidden />
              ) : (
                <Volume2 className="h-4 w-4" aria-hidden />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={(event) => player.setVolume(Number(event.target.value))}
              aria-label="Volume"
              className="h-1 w-20 cursor-pointer appearance-none rounded-full bg-slate-200 accent-emerald-500"
            />
          </div>

          <button
            type="button"
            onClick={player.stop}
            aria-label="Fermer le lecteur"
            className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
