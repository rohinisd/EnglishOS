"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from "lucide-react";
import { formatTime } from "@/lib/utils";

type Props = {
  videoId: string;
  playbackUrl: string;
  resumeFromSec: number;
  durationSec: number;
  watermarkText: string;
};

export function WatchPlayer({ videoId, playbackUrl, resumeFromSec, durationSec, watermarkText }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(resumeFromSec);
  const [muted, setMuted] = useState(false);
  const lastSyncRef = useRef(0);
  const syncInProgressRef = useRef(false);

  const syncProgress = useCallback(async (position: number) => {
    if (syncInProgressRef.current) return;
    syncInProgressRef.current = true;
    try {
      await fetch(`/api/videos/${videoId}/progress`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ position: Math.floor(position) }),
      });
    } catch {
      // ignore network errors
    } finally {
      syncInProgressRef.current = false;
    }
  }, [videoId]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const start = () => {
      if (resumeFromSec > 5 && resumeFromSec < durationSec - 5) {
        video.currentTime = resumeFromSec;
      }
      setReady(true);
    };

    // Try HLS.js for non-Safari
    const isHlsUrl = playbackUrl.includes(".m3u8");
    if (isHlsUrl && !video.canPlayType("application/vnd.apple.mpegurl")) {
      import("hls.js").then(({ default: Hls }) => {
        if (Hls.isSupported()) {
          const hls = new Hls({ maxBufferLength: 30, enableWorker: true });
          hls.loadSource(playbackUrl);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, start);
          return () => hls.destroy();
        }
      });
    } else {
      video.src = playbackUrl;
      video.addEventListener("loadedmetadata", start, { once: true });
    }

    const onTimeUpdate = () => {
      const t = video.currentTime;
      setCurrentTime(t);
      if (t - lastSyncRef.current >= 10) {
        lastSyncRef.current = t;
        syncProgress(t);
      }
    };

    const onPlay = () => setPlaying(true);
    const onPause = () => {
      setPlaying(false);
      syncProgress(video.currentTime);
    };

    const flush = () => syncProgress(video.currentTime);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    window.addEventListener("beforeunload", flush);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") flush();
    });

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      window.removeEventListener("beforeunload", flush);
    };
  }, [playbackUrl, resumeFromSec, durationSec, syncProgress]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const t = Number(e.target.value);
    v.currentTime = t;
    setCurrentTime(t);
  };

  const pct = durationSec > 0 ? (currentTime / durationSec) * 100 : 0;

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black group">
      <video
        ref={videoRef}
        playsInline
        preload="metadata"
        className="h-full w-full"
        controlsList="nodownload noremoteplayback"
        disablePictureInPicture
        onClick={togglePlay}
      />

      {/* Anti-piracy watermark */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <span className="rotate-[-25deg] text-xl font-bold text-white/10 tracking-[0.3em] select-none whitespace-nowrap">
          {watermarkText}
        </span>
      </div>

      {/* Loading overlay */}
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-white text-sm animate-pulse">Loading video…</div>
        </div>
      )}

      {/* Controls */}
      {ready && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <input
            type="range"
            min={0}
            max={durationSec}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 accent-yellow-400 cursor-pointer mb-2"
          />
          <div className="flex items-center gap-3">
            <button onClick={togglePlay} className="text-white hover:text-yellow-400 transition-colors">
              {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
            <button onClick={() => { const v = videoRef.current; if (v) { v.muted = !v.muted; setMuted(!muted); } }} className="text-white hover:text-yellow-400 transition-colors">
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <span className="text-white text-xs flex-1">
              {formatTime(currentTime)} / {formatTime(durationSec)}
            </span>
            <span className="text-white/60 text-xs">{Math.round(pct)}%</span>
            <button onClick={() => videoRef.current?.requestFullscreen()} className="text-white hover:text-yellow-400 transition-colors">
              <Maximize className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Resume indicator */}
      {ready && resumeFromSec > 5 && (
        <div className="absolute top-3 right-3">
          <button
            onClick={() => { if (videoRef.current) videoRef.current.currentTime = 0; }}
            className="flex items-center gap-1 bg-black/60 text-white text-xs px-2 py-1 rounded-full"
          >
            <RotateCcw className="h-3 w-3" /> Restart
          </button>
        </div>
      )}
    </div>
  );
}
