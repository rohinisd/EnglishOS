import { db } from "@/lib/db";
import { normalisePhone, isAdminPhone, ADMIN_DEFAULT_NAME } from "@/lib/auth";
import { cookies } from "next/headers";
import { addDays } from "date-fns";
import { z } from "zod";

const Body = z.object({ phone: z.string().min(10) });

export async function POST(req: Request) {
  try {
    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return Response.json({ error: "Invalid phone number" }, { status: 400 });

    const phone = normalisePhone(parsed.data.phone);
    let user = await db.user.findUnique({ where: { phone } });

    // Hardcoded admin: auto-bootstrap on first sign-in, or repair role/status
    // if it somehow drifted (e.g. signed up as student earlier). This keeps
    // the admin login frictionless without needing the seed-admin endpoint.
    if (isAdminPhone(phone)) {
      if (!user || user.deletedAt) {
        user = await db.user.create({
          data: {
            phone,
            name: ADMIN_DEFAULT_NAME,
            role: "ADMIN",
            approvalStatus: "APPROVED",
            approvedAt: new Date(),
          },
        });
      } else if (user.role !== "ADMIN" || user.approvalStatus !== "APPROVED") {
        user = await db.user.update({
          where: { id: user.id },
          data: {
            role: "ADMIN",
            approvalStatus: "APPROVED",
            approvedAt: user.approvedAt ?? new Date(),
          },
        });
      }
    }

    if (!user || user.deletedAt) {
      return Response.json({ error: "No account found with this number. Please sign up first." }, { status: 404 });
    }

    if (user.approvalStatus === "SUSPENDED") {
      return Response.json({ error: "Your account is suspended. Contact support." }, { status: 403 });
    }

    if (user.approvalStatus === "REJECTED") {
      return Response.json({ error: "Your account was not approved. Please contact your teacher." }, { status: 403 });
    }

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
      redirectTo: user.approvalStatus === "APPROVED"
        ? (user.role === "STUDENT" ? "/today" : "/teacher/dashboard")
        : "/pending-approval",
    });
  } catch (err) {
    console.error("phone-login error", err);
    const message = err instanceof Error ? err.message : "Sign-in failed";
    return Response.json({ error: `Sign-in failed: ${message}` }, { status: 500 });
  }
}
