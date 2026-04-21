import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ videoId: string }> }
) {
  const { videoId } = await params;
  const sessionUser = await getSession();
  if (!sessionUser) return new Response("unauthorized", { status: 401 });

  const user = await db.user.findUnique({ where: { id: sessionUser.id } });
  if (!user) return new Response("forbidden", { status: 403 });

  // Check active subscription
  const sub = await db.subscription.findFirst({
    where: {
      userId: user.id,
      status: { in: ["TRIAL", "ACTIVE"] },
      expiresAt: { gte: new Date() },
    },
  });
  if (!sub) return new Response("subscription required", { status: 402 });

  const video = await db.video.findUnique({ where: { id: videoId } });
  if (!video?.muxPlaybackId) return new Response("not ready", { status: 404 });

  // Load / create progress row
  const progress = await db.videoProgress.upsert({
    where: { userId_videoId: { userId: user.id, videoId: video.id } },
    update: { openCount: { increment: 1 }, lastWatchedAt: new Date() },
    create: { userId: user.id, videoId: video.id, openCount: 1 },
  });

  // Check if Mux signing keys are configured
  const signingKeyId = process.env.MUX_SIGNING_KEY_ID;
  const signingKeyPrivate = process.env.MUX_SIGNING_KEY_PRIVATE;
  
  let playbackUrl: string;
  
  if (!signingKeyId || signingKeyId === "placeholder_fill_later" || !signingKeyPrivate || signingKeyPrivate === "placeholder_fill_later") {
    // Dev mode: use unsigned URL (only works if playback policy is public)
    playbackUrl = `https://stream.mux.com/${video.muxPlaybackId}.m3u8`;
  } else {
    const privateKey = Buffer.from(signingKeyPrivate, "base64").toString();
    const token = jwt.sign(
      {
        sub: video.muxPlaybackId,
        aud: "v",
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8,
        kid: signingKeyId,
      },
      privateKey,
      { algorithm: "RS256" }
    );
    playbackUrl = `https://stream.mux.com/${video.muxPlaybackId}.m3u8?token=${token}`;
  }

  return Response.json({
    playbackUrl,
    resumeFromSec: progress.lastPositionSec,
    durationSec: video.durationSeconds ?? 0,
    watermarkText: user.phone ?? user.id,
  });
}
