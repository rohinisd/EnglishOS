import { db } from "@/lib/db";
import { verifyOtp } from "@/lib/otp";
import { normalisePhone } from "@/lib/auth";
import { cookies } from "next/headers";
import { addDays } from "date-fns";
import { z } from "zod";

const Body = z.object({ phone: z.string(), code: z.string().length(4) });

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: "Invalid input" }, { status: 400 });

  const phone = normalisePhone(parsed.data.phone);
  const valid = await verifyOtp(phone, parsed.data.code);
  if (!valid) return Response.json({ error: "Invalid or expired OTP" }, { status: 400 });

  let user = await db.user.findUnique({ where: { phone } });
  if (!user) return Response.json({ error: "User not found" }, { status: 404 });

  if (user.role === "STUDENT" && user.approvalStatus !== "APPROVED") {
    user = await db.user.update({
      where: { id: user.id },
      data: {
        approvalStatus: "APPROVED",
        approvedAt: user.approvedAt ?? new Date(),
      },
    });
  }

  // Create session
  const session = await db.authSession.create({
    data: {
      userId: user.id,
      expiresAt: addDays(new Date(), 30),
    },
  });

  const cookieStore = await cookies();
  cookieStore.set("ef_session", session.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return Response.json({
    ok: true,
    approvalStatus: user.approvalStatus,
    role: user.role,
    redirectTo: user.role === "STUDENT" ? "/today" : "/teacher/dashboard",
  });
}
