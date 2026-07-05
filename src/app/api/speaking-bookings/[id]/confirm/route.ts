import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const Body = z.object({
  confirmedStartAt: z.string().min(1),
  meetingLink: z.string().max(500).optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sessionUser = await getSession();
  if (!sessionUser) return new Response("unauthorized", { status: 401 });

  const teacher = await db.user.findUnique({ where: { id: sessionUser.id } });
  if (!teacher || !["TEACHER", "ADMIN"].includes(teacher.role)) {
    return new Response("forbidden", { status: 403 });
  }

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: parsed.error }, { status: 400 });

  const confirmedStartAt = new Date(parsed.data.confirmedStartAt);
  if (Number.isNaN(confirmedStartAt.getTime())) {
    return Response.json({ error: "Please enter a valid confirmed time." }, { status: 400 });
  }

  const booking = await db.speakingBooking.update({
    where: { id },
    data: {
      teacherId: teacher.id,
      confirmedStartAt,
      meetingLink: parsed.data.meetingLink,
      status: "CONFIRMED",
    },
  });

  await db.notification.create({
    data: {
      userId: booking.studentId,
      kind: "ANNOUNCEMENT",
      channel: "IN_APP",
      title: "Speaking session confirmed",
      body: "Your 1:1 speaking session has been confirmed. Check the booking page for the meeting link.",
      url: "/speaking-sessions",
    },
  });

  return Response.json(booking);
}
