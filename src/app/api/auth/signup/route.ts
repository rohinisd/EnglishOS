import { db } from "@/lib/db";
import { normalisePhone } from "@/lib/auth";
import { Prisma } from "@prisma/client";
import { z } from "zod";

const Body = z.object({
  name: z.string().trim().min(1),
  phone: z.string().trim().min(1),
});

export async function POST(req: Request) {
  try {
    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });

    const { name } = parsed.data;
    const phone = normalisePhone(parsed.data.phone);

    try {
      await db.user.create({
        data: {
          phone,
          name,
          role: "STUDENT",
          approvalStatus: "PENDING",
        },
      });
    } catch (err) {
      if (!(err instanceof Prisma.PrismaClientKnownRequestError) || err.code !== "P2002") {
        throw err;
      }

      await db.user.update({
        where: { phone },
        data: { name },
      });
    }

    return Response.json({ ok: true, message: "Account created. Waiting for admin approval." });
  } catch (err) {
    console.error("signup error", err);
    const message = err instanceof Error ? err.message : "Unknown signup error";
    return Response.json({ error: `Signup failed: ${message}` }, { status: 500 });
  }
}
