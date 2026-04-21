import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const Body = z.object({ publish: z.boolean() });

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sessionUser = await getSession();
  if (!sessionUser) return new Response("unauthorized", { status: 401 });

  const user = await db.user.findUnique({ where: { id: sessionUser.id } });
  if (!user || !["TEACHER", "ADMIN"].includes(user.role)) {
    return new Response("forbidden", { status: 403 });
  }

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return new Response("bad request", { status: 400 });

  const session = await db.session.update({
    where: { id },
    data: { publishedAt: parsed.data.publish ? new Date() : null },
  });

  return Response.json(session);
}
