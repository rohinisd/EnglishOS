import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const Body = z.object({
  userId: z.string(),
  action: z.enum(["approve", "reject", "suspend", "reactivate"]),
});

export async function POST(req: Request) {
  const sessionUser = await getSession();
  if (!sessionUser) return new Response("unauthorized", { status: 401 });
  if (!["TEACHER", "ADMIN"].includes(sessionUser.role)) {
    return new Response("forbidden", { status: 403 });
  }

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: "Invalid input" }, { status: 400 });

  const { userId, action } = parsed.data;

  const statusMap: Record<string, "APPROVED" | "REJECTED" | "SUSPENDED"> = {
    approve: "APPROVED",
    reject: "REJECTED",
    suspend: "SUSPENDED",
    reactivate: "APPROVED",
  };

  const newStatus = statusMap[action];

  const user = await db.user.update({
    where: { id: userId },
    data: {
      approvalStatus: newStatus,
      approvedAt: newStatus === "APPROVED" ? new Date() : undefined,
      approvedById: newStatus === "APPROVED" ? sessionUser.id : undefined,
    },
  });

  // Notify student via in-app notification
  const messages = {
    approve: { title: "You're approved! 🎉", body: "Your EnglishForge account is now active. Start learning!" },
    reject: { title: "Account not approved", body: "Contact Rohini for more info: +91 96200 10983" },
    suspend: { title: "Account suspended", body: "Contact your teacher for more info." },
    reactivate: { title: "Account reactivated", body: "Welcome back! Your account is active again." },
  };

  await db.notification.create({
    data: {
      userId,
      kind: "ANNOUNCEMENT",
      channel: "IN_APP",
      title: messages[action].title,
      body: messages[action].body,
      url: "/today",
    },
  });

  return Response.json({ ok: true, approvalStatus: user.approvalStatus });
}
