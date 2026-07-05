import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const UpdateBody = z.object({
  confirmedStartAt: z.string().optional(),
  meetingLink: z.string().max(500).optional(),
  teacherFeedback: z.string().max(2000).optional(),
  status: z.enum(["CONFIRMED", "COMPLETED", "CANCELLED"]).optional(),
});

export async function PATCH(
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

  const parsed = UpdateBody.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: parsed.error }, { status: 400 });

  const existing = await db.speakingBooking.findUnique({ where: { id } });
  if (!existing) return new Response("not found", { status: 404 });

  const confirmedStartAt = parsed.data.confirmedStartAt
    ? new Date(parsed.data.confirmedStartAt)
    : undefined;

  if (confirmedStartAt && Number.isNaN(confirmedStartAt.getTime())) {
    return Response.json({ error: "Please enter a valid confirmed time." }, { status: 400 });
  }

  const status = parsed.data.status;
  const completedAt = status === "COMPLETED" ? new Date() : undefined;
  const cancelledAt = status === "CANCELLED" ? new Date() : undefined;

  const booking = await db.speakingBooking.update({
    where: { id },
    data: {
      teacherId: teacher.id,
      confirmedStartAt,
      meetingLink: parsed.data.meetingLink,
      teacherFeedback: parsed.data.teacherFeedback,
      status,
      completedAt,
      cancelledAt,
    },
  });

  if (status === "CONFIRMED") {
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
  }

  if (status === "COMPLETED" && parsed.data.teacherFeedback) {
    await db.notification.create({
      data: {
        userId: booking.studentId,
        kind: "SUBMISSION_GRADED",
        channel: "IN_APP",
        title: "Speaking session feedback added",
        body: parsed.data.teacherFeedback,
        url: "/speaking-sessions",
      },
    });
  }

  return Response.json(booking);
}
