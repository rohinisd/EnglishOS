import { db } from "@/lib/db";
import { normalisePhone } from "@/lib/auth";
import { z } from "zod";

const Body = z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
});

export async function POST(req: Request) {
  try {
    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });

    const { name } = parsed.data;
    const phone = normalisePhone(parsed.data.phone);

    await db.user.upsert({
      where: { phone },
      create: {
        phone,
        name,
        role: "STUDENT",
        approvalStatus: "PENDING",
      },
      update: {
        name,
        deletedAt: null,
      },
    });

    return Response.json({ ok: true, message: "Account created. Waiting for admin approval." });
  } catch (err) {
    console.error("signup error", err);
    return Response.json({ error: "Could not create your account. Please try again or contact Rohini." }, { status: 500 });
  }
}
