import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const Body = z.object({
  sessionId: z.string(),
  title: z.string().trim().min(2).max(120),
  content: z.string().trim().min(1).max(12000),
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

  const { sessionId, title, content } = parsed.data;
  const existing = await db.lesson.findFirst({
    where: { sessionId, type: "READING" },
    orderBy: { order: "asc" },
  });

  let lessonId = existing?.id;
  if (existing) {
    await db.lesson.update({
      where: { id: existing.id },
      data: { title, description: content },
    });
  } else {
    const maxOrder = await db.lesson.aggregate({
      where: { sessionId },
      _max: { order: true },
    });
    const created = await db.lesson.create({
      data: {
        sessionId,
        type: "READING",
        title,
        description: content,
        order: (maxOrder._max.order ?? 0) + 1,
      },
    });
    lessonId = created.id;
  }

  return Response.json({ ok: true, lessonId });
}
