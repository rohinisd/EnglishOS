import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const CreateBody = z.object({
  assignmentId: z.string(),
  type: z.enum(["WRITING", "CURSIVE", "SPEAKING"]),
  textContent: z.string().optional(),
  wordCount: z.number().optional(),
  imageUrl: z.string().optional(),
  audioUrl: z.string().optional(),
  audioDurationSec: z.number().optional(),
  status: z.enum(["DRAFT", "SUBMITTED"]).default("DRAFT"),
});

export async function POST(req: Request) {
  const sessionUser = await getSession();
  if (!sessionUser) return new Response("unauthorized", { status: 401 });

  const user = await db.user.findUnique({ where: { id: sessionUser.id } });
  if (!user) return new Response("forbidden", { status: 403 });

  const parsed = CreateBody.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: parsed.error }, { status: 400 });

  const data = parsed.data;
  const submission = await db.submission.upsert({
    where: { userId_assignmentId: { userId: user.id, assignmentId: data.assignmentId } },
    update: {
      textContent: data.textContent,
      wordCount: data.wordCount,
      imageUrl: data.imageUrl,
      audioUrl: data.audioUrl,
      audioDurationSec: data.audioDurationSec,
      status: data.status,
      ...(data.status === "SUBMITTED" ? { submittedAt: new Date() } : {}),
    },
    create: {
      userId: user.id,
      assignmentId: data.assignmentId,
      textContent: data.textContent,
      wordCount: data.wordCount,
      imageUrl: data.imageUrl,
      audioUrl: data.audioUrl,
      audioDurationSec: data.audioDurationSec,
      status: data.status,
      ...(data.status === "SUBMITTED" ? { submittedAt: new Date() } : {}),
    },
  });

  // Award XP on first submission
  if (data.status === "SUBMITTED") {
    await db.studentProfile.updateMany({
      where: { userId: user.id },
      data: { xp: { increment: 10 } },
    });
  }

  return Response.json(submission);
}
