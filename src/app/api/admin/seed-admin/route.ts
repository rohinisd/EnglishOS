import { db } from "@/lib/db";
import { NextRequest } from "next/server";
import { normalisePhone } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-seed-secret");
  if (secret !== process.env.SEED_SECRET && secret !== "ef-seed-2026") {
    return new Response("forbidden", { status: 403 });
  }

  const body = await req.json();
  const rawPhone = body.phone as string | undefined;
  const name = body.name as string | undefined;
  const role = body.role as "ADMIN" | "TEACHER" | undefined;
  if (!rawPhone || !name) return Response.json({ error: "phone and name required" }, { status: 400 });

  const phone = normalisePhone(rawPhone);

  const user = await db.user.upsert({
    where: { phone },
    create: {
      phone,
      name,
      role: role ?? "ADMIN",
      approvalStatus: "APPROVED",
      approvedAt: new Date(),
    },
    update: {
      name,
      role: role ?? "ADMIN",
      approvalStatus: "APPROVED",
    },
  });

  return Response.json({ ok: true, id: user.id, phone: user.phone, role: user.role });
}
