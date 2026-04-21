import { db } from "@/lib/db";
import { createOtp } from "@/lib/otp";
import { normalisePhone } from "@/lib/auth";
import { z } from "zod";

const Body = z.object({ phone: z.string().min(10) });

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: "Invalid phone" }, { status: 400 });

  const phone = normalisePhone(parsed.data.phone);

  // Check if user exists
  const user = await db.user.findUnique({ where: { phone } });
  if (!user) return Response.json({ error: "No account found with this number. Please sign up first." }, { status: 404 });

  await createOtp(phone);
  return Response.json({ ok: true, message: "OTP sent" });
}
