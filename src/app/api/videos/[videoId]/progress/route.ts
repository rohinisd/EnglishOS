import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const Body = z.object({ position: z.number().int().nonnegative() });

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ videoId: string }> }
) {
  const { videoId } = await params;
  const sessionUser = await getSession();
  if (!sessionUser) return new Response("unauthorized", { status: 401 });

  const user = await db.user.findUnique({ where: { id: sessionUser.id } });
  if (!user) return new Response("forbidden", { status: 403 });

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return new Response("bad request", { status: 400 });

  const { position } = parsed.data;
  const video = await db.video.findUnique({ where: { id: videoId } });
  if (!video) return new Response("not found", { status: 404 });

  const current = await db.videoProgress.findUnique({
    where: { userId_videoId: { userId: user.id, videoId: video.id } },
  });

  const maxPosition = Math.max(current?.maxPositionSec ?? 0, position);
  const watchedDelta = Math.max(0, position - (current?.lastPositionSec ?? 0));
  const watchedSec = (current?.watchedSec ?? 0) + watchedDelta;
  const duration = video.durationSeconds ?? 1;
  const percentage = Math.min(1, maxPosition / duration);
  // Anti-cheat: require actual watch time + position
  const completed = percentage >= 0.95 && watchedSec >= duration * 0.80;

  await db.videoProgress.upsert({
    where: { userId_videoId: { userId: user.id, videoId: video.id } },
    update: {
      lastPositionSec: position,
      maxPositionSec: maxPosition,
      watchedSec,
      percentage,
      completed,
      lastWatchedAt: new Date(),
      ...(completed && !current?.completed ? { completedAt: new Date() } : {}),
    },
    create: {
      userId: user.id,
      videoId: video.id,
      lastPositionSec: position,
      maxPositionSec: position,
      watchedSec: position,
      percentage,
      completed,
    },
  });

  // Update streak
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const streak = await db.streak.findUnique({ where: { userId: user.id } });
  const lastActive = streak?.lastActiveOn ? new Date(streak.lastActiveOn) : null;
  if (lastActive) lastActive.setHours(0, 0, 0, 0);
  const isToday = lastActive?.getTime() === today.getTime();
  if (!isToday) {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = lastActive?.getTime() === yesterday.getTime();
    await db.streak.upsert({
      where: { userId: user.id },
      update: {
        currentDays: isYesterday ? { increment: 1 } : 1,
        longestDays: isYesterday ? { increment: 1 } : (streak?.longestDays ?? 1),
        lastActiveOn: new Date(),
      },
      create: { userId: user.id, currentDays: 1, longestDays: 1, lastActiveOn: new Date() },
    });
  }

  return Response.json({ ok: true });
}
