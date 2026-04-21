import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const Body = z.object({
  score: z.number().int().nonnegative(),
  feedback: z.string().optional(),
  rubricScores: z.record(z.string(), z.number()).optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sessionUser = await getSession();
  if (!sessionUser) return new Response("unauthorized", { status: 401 });

  const grader = await db.user.findUnique({ where: { id: sessionUser.id } });
  if (!grader || !["TEACHER", "ADMIN"].includes(grader.role)) {
    return new Response("forbidden", { status: 403 });
  }

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: parsed.error }, { status: 400 });

  const { score, feedback, rubricScores } = parsed.data;

  const submission = await db.submission.update({
    where: { id },
    data: {
      score,
      feedback,
      rubricScores,
      status: "GRADED",
      gradedAt: new Date(),
      gradedById: grader.id,
    },
  });

  // Create in-app notification for student
  await db.notification.create({
    data: {
      userId: submission.userId,
      kind: "SUBMISSION_GRADED",
      channel: "IN_APP",
      title: "Your submission has been graded",
      body: `Score: ${score} · ${feedback ?? "Well done!"}`,
      url: `/sessions/${(await db.assignment.findUnique({ where: { id: submission.assignmentId }, include: { session: true } }))?.sessionId}`,
    },
  });

  return Response.json(submission);
}
