import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const sessionUser = await getSession();
  if (!sessionUser) return new Response("unauthorized", { status: 401 });

  const user = await db.user.findUnique({ where: { id: sessionUser.id } });
  if (!user) return new Response("forbidden", { status: 403 });

  const notifications = await db.notification.findMany({
    where: { userId: user.id, channel: "IN_APP" },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return Response.json(notifications);
}

export async function PATCH(req: Request) {
  const sessionUser = await getSession();
  if (!sessionUser) return new Response("unauthorized", { status: 401 });

  const user = await db.user.findUnique({ where: { id: sessionUser.id } });
  if (!user) return new Response("forbidden", { status: 403 });

  const { id } = await req.json();

  await db.notification.update({
    where: { id, userId: user.id },
    data: { read: true, readAt: new Date() },
  });

  return Response.json({ ok: true });
}
