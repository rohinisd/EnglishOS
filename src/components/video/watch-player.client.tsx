"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { RotateCcw, ExternalLink } from "lucide-react";
import { formatTime } from "@/lib/utils";

type Props = {
  videoId: string;
  youtubeVideoId: string;
  resumeFromSec: number;
  studentName: string;
};

export function WatchPlayer({ videoId, youtubeVideoId, resumeFromSec, studentName }: Props) {
  const [hasResumed, setHasResumed] = useState(false);
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

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
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

      {/* Subtle watermark */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <span className="rotate-[-25deg] text-lg font-bold text-white/5 tracking-[0.4em] select-none whitespace-nowrap">
          {studentName}
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
