import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const Body = z.object({
  quizId: z.string(),
  answers: z.array(z.object({
    questionId: z.string(),
    answer: z.string(),
    correct: z.boolean(),
  })),
  durationSec: z.number(),
});

export async function POST(req: Request) {
  const sessionUser = await getSession();
  if (!sessionUser) return new Response("unauthorized", { status: 401 });

  const user = await db.user.findUnique({ where: { id: sessionUser.id } });
  if (!user) return new Response("forbidden", { status: 403 });

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: parsed.error }, { status: 400 });

  const { quizId, answers, durationSec } = parsed.data;

  const quiz = await db.quiz.findUnique({
    where: { id: quizId },
    include: { questions: true },
  });
  if (!quiz) return new Response("quiz not found", { status: 404 });

  // Check attempt count
  const attemptCount = await db.quizAttempt.count({ where: { userId: user.id, quizId } });
  if (attemptCount >= quiz.maxAttempts) {
    return Response.json({ error: "Max attempts reached" }, { status: 400 });
  }

  const score = answers.filter(a => a.correct).length;
  const maxScore = quiz.questions.length;
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
  const passed = percentage >= quiz.passingScore;

  const attempt = await db.quizAttempt.create({
    data: {
      userId: user.id,
      quizId,
      score,
      maxScore,
      percentage,
      passed,
      answers,
      durationSec,
      finishedAt: new Date(),
    },
  });

  // Award XP
  if (passed) {
    await db.studentProfile.updateMany({
      where: { userId: user.id },
      data: { xp: { increment: 15 } },
    });
  }

  return Response.json({ attempt, score, maxScore, percentage, passed });
}
