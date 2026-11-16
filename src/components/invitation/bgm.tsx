"use client";

import { createContext, use, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";

type Bgm = {
  available: boolean;
  playing: boolean;
  /** play was requested but audio is still buffering */
  loading: boolean;
  currentTime: number;
  duration: number;
  toggle: () => void;
  seekBy: (deltaSeconds: number) => void;
  /** 0–1 */
  seekTo: (ratio: number) => void;
};

const BgmContext = createContext<Bgm | null>(null);

export function useBgm() {
  const ctx = use(BgmContext);
  if (!ctx) throw new Error("useBgm must be used inside <BgmProvider>");
  return ctx;
}

type Props = {
  src?: string;
  /** Shown on the phone's lock screen / control center while playing (Media Session). */
  title: string;
  artist: string;
  /** Third line of the lock-screen card; used to put the couple and the date on the guest's own lock screen. */
  album?: string;
  artwork?: string;
  /** Start playing on load, or on the first tap if the browser blocks unmuted autoplay. */
  autoplay?: boolean;
  children: ReactNode;
};

export function BgmProvider({ src, title, artist, album, artwork, autoplay = false, children }: Props) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  /** The guest paused on purpose — autoplay must not start the music again. */
  const userPaused = useRef(false);

  const play = useCallback(() => {
    const el = audio.current;
    if (!el) return;
    setLoading(true);
    // Must run inside the tap handler: browsers only allow audio to start from a user gesture.
    el.play().catch((err: unknown) => {
      setLoading(false);
      if (err instanceof DOMException && err.name === "AbortError") return;
      toast("음악을 재생하지 못했어요.");
    });
  }, []);

  const toggle = useCallback(() => {
    const el = audio.current;
    if (!el) return;
    userPaused.current = !el.paused;
    if (el.paused) play();
    else el.pause();
  }, [play]);

  const seekTo = useCallback((ratio: number) => {
    const el = audio.current;
    if (!el || !Number.isFinite(el.duration)) return;
    el.currentTime = Math.min(Math.max(ratio, 0), 1) * el.duration;
    setCurrentTime(el.currentTime);
  }, []);

  const seekBy = useCallback((delta: number) => {
    const el = audio.current;
    if (!el || !Number.isFinite(el.duration)) return;
    el.currentTime = Math.min(Math.max(el.currentTime + delta, 0), el.duration);
    setCurrentTime(el.currentTime);
  }, []);

  // Autoplay. Browsers (iOS Safari, KakaoTalk in-app, Chrome) block unmuted playback until the
  // page gets a user gesture, so try right away and otherwise start on the first tap anywhere.
  useEffect(() => {
    const el = audio.current;
    if (!src || !autoplay || !el) return;
    const events = ["pointerdown", "pointerup", "touchend", "keydown", "click"] as const;
    const stop = () => events.forEach((type) => window.removeEventListener(type, onGesture, true));
    const attempt = () =>
      el.play().then(stop, () => {
        /* still blocked — wait for a gesture */
      });
    function onGesture(e: Event) {
      if (userPaused.current || !el!.paused) return stop();
      // Taps on the player itself are handled by its own buttons (otherwise play would toggle straight back off).
      if (e.target instanceof Element && e.target.closest("[data-bgm-control]")) return;
      void attempt();
    }
    events.forEach((type) => window.addEventListener(type, onGesture, true));
    void attempt();
    return stop;
  }, [src, autoplay]);

  // The audio element is server-rendered, so its metadata can finish loading before hydration
  // attaches onLoadedMetadata. Pick the duration up here so the player can show it before play.
  useEffect(() => {
    const el = audio.current;
    if (el && Number.isFinite(el.duration)) setDuration(el.duration);
  }, [src]);

  // Pause while the invitation is in the background (other tab, app switch, KakaoTalk in-app browser
  // minimised) and pick up again when the guest comes back.
  useEffect(() => {
    if (!src) return;
    let resume = false;
    const onVisibility = () => {
      const el = audio.current;
      if (!el) return;
      if (document.hidden) {
        resume = !el.paused;
        el.pause();
      } else if (resume) {
        resume = false;
        void el.play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [src]);

  // Lock-screen "Now playing" card and hardware media keys.
  useEffect(() => {
    if (!src || !("mediaSession" in navigator)) return;
    const ms = navigator.mediaSession;
    ms.metadata = new MediaMetadata({
      title,
      artist,
      album,
      artwork: artwork ? [{ src: artwork, sizes: "1000x1000", type: "image/jpeg" }] : [],
    });
    const handlers: [MediaSessionAction, MediaSessionActionHandler][] = [
      ["play", () => play()],
      [
        "pause",
        () => {
          userPaused.current = true;
          audio.current?.pause();
        },
      ],
      ["seekbackward", (d) => seekBy(-(d.seekOffset ?? 10))],
      ["seekforward", (d) => seekBy(d.seekOffset ?? 10)],
      ["seekto", (d) => d.seekTime != null && audio.current?.duration && seekTo(d.seekTime / audio.current.duration)],
    ];
    for (const [action, handler] of handlers) {
      try {
        ms.setActionHandler(action, handler);
      } catch {
        /* action not supported by this browser */
      }
    }
    return () => {
      for (const [action] of handlers) {
        try {
          ms.setActionHandler(action, null);
        } catch {}
      }
    };
  }, [src, title, artist, album, artwork, play, seekBy, seekTo]);

  return (
    <BgmContext value={{ available: Boolean(src), playing, loading, currentTime, duration, toggle, seekBy, seekTo }}>
      {src ? (
        <audio
          ref={audio}
          src={src}
          loop
          preload={autoplay ? "auto" : "metadata"}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onDurationChange={(e) => setDuration(e.currentTarget.duration)}
          onPlay={(e) => {
            setPlaying(true);
            // metadata can finish loading before hydration, in which case loadedmetadata was missed
            if (Number.isFinite(e.currentTarget.duration)) setDuration(e.currentTarget.duration);
          }}
          onPlaying={() => setLoading(false)}
          onWaiting={() => setLoading(true)}
          onPause={() => {
            setPlaying(false);
            setLoading(false);
          }}
          onTimeUpdate={(e) => {
            setCurrentTime(e.currentTarget.currentTime);
            if (Number.isFinite(e.currentTarget.duration)) setDuration(e.currentTarget.duration);
          }}
          onError={() => {
            setPlaying(false);
            setLoading(false);
            toast("음악 파일을 불러오지 못했어요.");
          }}
        />
      ) : null}
      {children}
    </BgmContext>
  );
}
