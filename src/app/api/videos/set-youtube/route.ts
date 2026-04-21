import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const Body = z.object({
  lessonId: z.string(),
  youtubeVideoId: z.string().regex(/^[a-zA-Z0-9_-]{11}$/, "Invalid YouTube video ID"),
});

export async function POST(req: Request) {
  const sessionUser = await getSession();
  if (!sessionUser) return new Response("unauthorized", { status: 401 });
  if (!["TEACHER", "ADMIN"].includes(sessionUser.role)) {
    return new Response("forbidden", { status: 403 });
  }

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { lessonId, youtubeVideoId } = parsed.data;

  // Upsert the video record for this lesson
  const video = await db.video.upsert({
    where: { lessonId },
    create: { lessonId, youtubeVideoId },
    update: { youtubeVideoId },
  });

  return Response.json({ ok: true, videoId: video.id, youtubeVideoId });
}
