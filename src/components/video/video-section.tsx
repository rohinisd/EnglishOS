import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { WatchPlayer } from "./watch-player.client";
import type { Video, VideoProgress } from "@prisma/client";

type Props = {
  video: Video & { progress: VideoProgress[] };
  userId: string;
};

export async function VideoSection({ video, userId }: Props) {
  if (!video.youtubeVideoId) {
    return (
      <div className="aspect-video w-full rounded-xl bg-navy/5 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="text-4xl mb-3">🎬</div>
          <p className="text-navy font-semibold">Video coming soon</p>
          <p className="text-muted text-sm mt-1">The teacher hasn&apos;t uploaded this video yet</p>
        </div>
      </div>
    );
  }

  const progress = video.progress.find(p => p.userId === userId) ?? null;
  const resumeFromSec = progress?.lastPositionSec ?? 0;

  const sessionUser = await getSession();
  const studentName = sessionUser?.name ?? "Student";
  const phone = sessionUser?.phone ?? "";
  const maskedPhone = phone.length >= 4 ? `****${phone.slice(-4)}` : "****";
  const watermarkLabel = `${studentName} ${maskedPhone}`;

  return (
    <WatchPlayer
      videoId={video.id}
      youtubeVideoId={video.youtubeVideoId}
      resumeFromSec={resumeFromSec}
      watermarkLabel={watermarkLabel}
    />
  );
}
