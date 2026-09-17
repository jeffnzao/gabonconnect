"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { AudioTrack, PlaybackStatus, PlayerState } from "@/types/audio";

interface AudioPlayerContextValue extends PlayerState {
  /** Charge une piste (et une file éventuelle) puis lance la lecture. */
  play: (track: AudioTrack, queue?: AudioTrack[]) => void;
  toggle: () => void;
  pause: () => void;
  resume: () => void;
  next: () => void;
  previous: () => void;
  seek: (positionSec: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  stop: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextValue | null>(null);

const INITIAL_STATE: PlayerState = {
  status: "idle",
  currentTrack: null,
  queue: [],
  currentIndex: -1,
  positionSec: 0,
  durationSec: 0,
  volume: 1,
  muted: false,
};

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<PlayerState>(INITIAL_STATE);

  // Instancie l'élément audio une seule fois côté client, hors du DOM React,
  // pour garantir la persistance de la lecture entre les navigations.
  if (typeof window !== "undefined" && audioRef.current === null) {
    audioRef.current = new Audio();
    audioRef.current.preload = "auto";
  }

  const patch = useCallback((partial: Partial<PlayerState>) => {
    setState((prev) => ({ ...prev, ...partial }));
  }, []);

  const loadAndPlay = useCallback(
    (track: AudioTrack, queue: AudioTrack[], index: number) => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.src = track.streamUrl;
      audio.load();
      patch({
        status: "loading",
        currentTrack: track,
        queue,
        currentIndex: index,
        positionSec: 0,
        durationSec: track.durationSec ?? 0,
      });
      void audio
        .play()
        .catch(() => patch({ status: "error" }));
    },
    [patch],
  );

  const play = useCallback(
    (track: AudioTrack, queue?: AudioTrack[]) => {
      const list = queue && queue.length > 0 ? queue : [track];
      const index = Math.max(
        0,
        list.findIndex((item) => item.id === track.id),
      );
      loadAndPlay(track, list, index);
    },
    [loadAndPlay],
  );

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const resume = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !state.currentTrack) return;
    void audio.play().catch(() => patch({ status: "error" }));
  }, [patch, state.currentTrack]);

  const toggle = useCallback(() => {
    if (state.status === "playing") {
      pause();
    } else {
      resume();
    }
  }, [pause, resume, state.status]);

  const next = useCallback(() => {
    if (state.queue.length === 0) return;
    const nextIndex = state.currentIndex + 1;
    if (nextIndex >= state.queue.length) return;
    loadAndPlay(state.queue[nextIndex], state.queue, nextIndex);
  }, [loadAndPlay, state.currentIndex, state.queue]);

  const previous = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    // Comportement classique : revient au début si > 3s de lecture.
    if (audio.currentTime > 3 || state.currentIndex <= 0) {
      audio.currentTime = 0;
      return;
    }
    const prevIndex = state.currentIndex - 1;
    loadAndPlay(state.queue[prevIndex], state.queue, prevIndex);
  }, [loadAndPlay, state.currentIndex, state.queue]);

  const seek = useCallback((positionSec: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration)) return;
    audio.currentTime = positionSec;
  }, []);

  const setVolume = useCallback(
    (volume: number) => {
      const audio = audioRef.current;
      if (!audio) return;
      const clamped = Math.min(1, Math.max(0, volume));
      audio.volume = clamped;
      audio.muted = clamped === 0;
      patch({ volume: clamped, muted: clamped === 0 });
    },
    [patch],
  );

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const nextMuted = !audio.muted;
    audio.muted = nextMuted;
    patch({ muted: nextMuted });
  }, [patch]);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    setState(INITIAL_STATE);
  }, []);

  // Abonnement aux événements natifs de l'élément audio.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlaying = () => patch({ status: "playing" });
    const onPause = () => {
      // Ignore la pause émise juste avant la fin/le changement de source.
      if (!audio.ended) patch({ status: "paused" });
    };
    const onWaiting = () => patch({ status: "loading" });
    const onError = () => patch({ status: "error" });
    const onLoaded = () =>
      patch({
        durationSec: Number.isFinite(audio.duration) ? audio.duration : 0,
      });
    const onTime = () => patch({ positionSec: audio.currentTime });
    const onEnded = () => {
      setState((prev) => {
        const nextIndex = prev.currentIndex + 1;
        const hasNext = nextIndex < prev.queue.length;
        if (hasNext) {
          const track = prev.queue[nextIndex];
          audio.src = track.streamUrl;
          audio.load();
          void audio.play().catch(() => undefined);
          return {
            ...prev,
            status: "loading",
            currentTrack: track,
            currentIndex: nextIndex,
            positionSec: 0,
            durationSec: track.durationSec ?? 0,
          };
        }
        return { ...prev, status: "paused", positionSec: 0 };
      });
    };

    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("error", onError);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnded);
    };
  }, [patch]);

  const value = useMemo<AudioPlayerContextValue>(
    () => ({
      ...state,
      play,
      toggle,
      pause,
      resume,
      next,
      previous,
      seek,
      setVolume,
      toggleMute,
      stop,
    }),
    [state, play, toggle, pause, resume, next, previous, seek, setVolume, toggleMute, stop],
  );

  return <AudioPlayerContext.Provider value={value}>{children}</AudioPlayerContext.Provider>;
}

export function useAudioPlayer(): AudioPlayerContextValue {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) {
    throw new Error("useAudioPlayer doit être utilisé à l'intérieur de <AudioPlayerProvider>.");
  }
  return ctx;
}

export function isActiveStatus(status: PlaybackStatus): boolean {
  return status === "playing" || status === "loading";
}
