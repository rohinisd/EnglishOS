import { db } from "@/lib/db";
import { normalisePhone, isAdminPhone } from "@/lib/auth";
import { addDays } from "date-fns";
import { z } from "zod";

const Body = z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
});

function getTrialDays(): number {
  const days = Number.parseInt(process.env.COURSE_TRIAL_DAYS ?? "7", 10);
  return Number.isFinite(days) && days > 0 ? days : 7;
}

export async function POST(req: Request) {
  try {
    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });

    const { name } = parsed.data;
    const phone = normalisePhone(parsed.data.phone);

    if (isAdminPhone(phone)) {
      return Response.json({ error: "This number is reserved for admin sign-in. Please use the Sign In page." }, { status: 403 });
    }

    const existing = await db.user.findUnique({ where: { phone } });
    if (existing) return Response.json({ error: "An account with this phone number already exists. Please sign in." }, { status: 409 });

    const course = await db.course.findFirst({ where: { slug: "english-mastery" } });
    const trialEndsAt = addDays(new Date(), getTrialDays());

    await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          phone,
          name,
          role: "STUDENT",
          approvalStatus: "PENDING",
        },
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
          expiresAt: trialEndsAt,
        },
      });
    });

    return Response.json({ ok: true, message: "Account created. Waiting for admin approval." });
  } catch (err) {
    console.error("signup error", err);
    return Response.json({ error: "Could not create your account. Please try again or contact Rohini." }, { status: 500 });
  }
}
