import { db } from "@/lib/db";
import { normalisePhone } from "@/lib/auth";
import { addDays } from "date-fns";
import { z } from "zod";

const Body = z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
  grade: z.enum(["CLASS_8", "CLASS_9", "CLASS_10"]),
  schoolName: z.string().optional(),
  parentName: z.string().optional(),
  parentPhone: z.string().optional(),
  city: z.string().optional(),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });

  const { name, grade, schoolName, parentName, city } = parsed.data;
  const phone = normalisePhone(parsed.data.phone);
  const parentPhone = parsed.data.parentPhone ? normalisePhone(parsed.data.parentPhone) : undefined;

  const existing = await db.user.findUnique({ where: { phone } });
  if (existing) return Response.json({ error: "An account with this phone number already exists. Please sign in." }, { status: 409 });

  const course = await db.course.findFirst({ where: { slug: "english-mastery" } });

  await db.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        phone,
        name,
        role: "STUDENT",
        approvalStatus: "PENDING",
      },
    });

    await tx.studentProfile.create({
      data: { userId: user.id, grade, schoolName, parentName, parentPhone, city },
    });

    // Pre-enroll in course (access gated by approvalStatus)
    if (course) {
      await tx.enrollment.create({
        data: { userId: user.id, courseId: course.id },
      });
    }

    // Create a pending trial subscription (activates when admin approves)
    await tx.subscription.create({
      data: {
        userId: user.id,
        status: "TRIAL",
        plan: "trial",
        pricePaise: 0,
        startsAt: new Date(),
        expiresAt: addDays(new Date(), parseInt(process.env.COURSE_TRIAL_DAYS ?? "7")),
      },
    });
  });

  return Response.json({ ok: true, message: "Account created. Waiting for admin approval." });
}
