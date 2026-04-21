import { cookies } from "next/headers";
import { db } from "@/lib/db";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get("ef_session")?.value;

  if (token) {
    await db.authSession.deleteMany({ where: { token } });
    cookieStore.delete("ef_session");
  }

  return Response.json({ ok: true });
}
