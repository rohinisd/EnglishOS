import { db } from "@/lib/db";
import { WatchPlayer } from "./watch-player.client";
import type { Video, VideoProgress } from "@prisma/client";

type Props = {
  video: Video & { progress: VideoProgress[] };
  progress: VideoProgress | null;
  userId: string;
  sessionId: string;
};

export async function VideoSection({ video, progress }: Props) {
  if (video.muxStatus !== "ready" || !video.muxPlaybackId) {
    return (
      <div className="aspect-video w-full rounded-xl bg-navy/5 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3">⏳</div>
          <p className="text-navy font-semibold">Video is being processed</p>
          <p className="text-muted text-sm mt-1">Please check back in a few minutes</p>
        </div>
      </div>
    );
  }

  // Fetch signed URL server-side
  let playbackData: { playbackUrl: string; resumeFromSec: number; durationSec: number; watermarkText: string } | null = null;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/videos/${video.id}/playback`, {
      cache: "no-store",
    });
    if (res.ok) playbackData = await res.json();
  } catch {
    // Mux not configured
  }

  if (!playbackData) {
    // Fallback: show a placeholder if Mux is not configured
    return (
      <div className="aspect-video w-full rounded-xl bg-navy flex items-center justify-center">
        <div className="text-center text-cream">
          <div className="text-4xl mb-3">🎥</div>
          <p className="font-semibold">Video player ready</p>
          <p className="text-cream/60 text-sm mt-1">Configure Mux to enable video streaming</p>
          {progress && progress.percentage > 0 && (
            <p className="text-gold text-sm mt-3">
              Last watched: {Math.round(progress.percentage * 100)}% complete
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <WatchPlayer
      videoId={video.id}
      playbackUrl={playbackData.playbackUrl}
      resumeFromSec={playbackData.resumeFromSec}
      durationSec={playbackData.durationSec}
      watermarkText={playbackData.watermarkText}
    />
  );
}
