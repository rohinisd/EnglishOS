"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { RotateCcw } from "lucide-react";

type Props = {
  videoId: string;
  youtubeVideoId: string;
  resumeFromSec: number;
  watermarkLabel: string;
};

const WATERMARK_POSITIONS = [
  "top-4 left-4",
  "top-4 right-4",
  "bottom-4 left-4",
  "bottom-4 right-4",
  "top-1/2 left-4 -translate-y-1/2",
  "top-1/2 right-4 -translate-y-1/2",
];

export function WatchPlayer({ videoId, youtubeVideoId, resumeFromSec, watermarkLabel }: Props) {
  const [hasResumed, setHasResumed] = useState(false);
  const [watermarkTick, setWatermarkTick] = useState(0);
  const lastSyncRef = useRef(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const syncProgress = useCallback(async (position: number) => {
    if (position < 2) return;
    try {
      await fetch(`/api/videos/${videoId}/progress`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ position: Math.floor(position) }),
      });
    } catch {
      // ignore
    }
  }, [videoId]);

  useEffect(() => {
    const interval = setInterval(() => {
      setWatermarkTick(tick => tick + 1);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Load YouTube IFrame API
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }

    const startSec = resumeFromSec > 5 ? resumeFromSec : 0;

    function createPlayer() {
      if (!containerRef.current) return;
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId: youtubeVideoId,
        playerVars: {
          start: Math.floor(startSec),
          rel: 0,           // no related videos from other channels
          modestbranding: 1,
          iv_load_policy: 3, // no video annotations
          playsinline: 1,
        },
        events: {
          onReady: () => {
            if (startSec > 5) setHasResumed(true);
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onStateChange: (e: any) => {
            // PlayerState: PLAYING=1, PAUSED=2, ENDED=0
            if (e.data === 1) {
              // Start periodic sync every 10s while playing
              intervalRef.current = setInterval(() => {
                const t = playerRef.current?.getCurrentTime() ?? 0;
                if (t - lastSyncRef.current >= 10) {
                  lastSyncRef.current = t;
                  syncProgress(t);
                }
              }, 5000);
            } else {
              if (intervalRef.current) clearInterval(intervalRef.current);
              const t = playerRef.current?.getCurrentTime() ?? 0;
              if (t > 2) syncProgress(t);
            }
          },
        },
      });
    }

    if (window.YT?.Player) {
      createPlayer();
    } else {
      window.onYouTubeIframeAPIReady = createPlayer;
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [youtubeVideoId, resumeFromSec, syncProgress]);

  // Sync on page hide/unload
  useEffect(() => {
    const flush = () => {
      const t = playerRef.current?.getCurrentTime() ?? 0;
      if (t > 2) syncProgress(t);
    };
    window.addEventListener("beforeunload", flush);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") flush();
    });
    return () => window.removeEventListener("beforeunload", flush);
  }, [syncProgress]);

  const watermarkPosition = WATERMARK_POSITIONS[watermarkTick % WATERMARK_POSITIONS.length];
  const stamp = new Date().toLocaleTimeString("en-IN", { hour12: false });

  return (
    <div
      className="relative aspect-video w-full overflow-hidden rounded-xl bg-black"
      onContextMenu={e => e.preventDefault()}
    >
      {/* YouTube player mounts here */}
      <div ref={containerRef} className="h-full w-full" />

      {/* Resume badge */}
      {hasResumed && resumeFromSec > 5 && (
        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={() => playerRef.current?.seekTo(0, true)}
            className="flex items-center gap-1 bg-black/70 text-white text-xs px-2.5 py-1.5 rounded-full hover:bg-black/90 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            Restart from beginning
          </button>
        </div>
      )}

      {/* Dynamic visible watermark to deter link-sharing/screen recording */}
      <div className={`pointer-events-none absolute z-10 ${watermarkPosition}`}>
        <span className="rounded-full bg-black/55 px-2 py-1 text-[10px] font-medium text-white/80 shadow">
          {watermarkLabel} | {stamp}
        </span>
      </div>
    </div>
  );
}

// Extend window type for YT API
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}
