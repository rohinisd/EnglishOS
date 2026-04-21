import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import Razorpay from "razorpay";
import { z } from "zod";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const Body = z.object({
  plan: z.enum(["monthly", "full"]),
});

export async function POST(req: Request) {
  const sessionUser = await getSession();
  if (!sessionUser) return new Response("unauthorized", { status: 401 });

  const user = await db.user.findUnique({ where: { id: sessionUser.id } });
  if (!user) return new Response("forbidden", { status: 403 });

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: "bad request" }, { status: 400 });

  const { plan } = parsed.data;
  const amountPaise = plan === "monthly"
    ? parseInt(process.env.COURSE_FEE_MONTHLY_PAISE ?? "100000")
    : parseInt(process.env.COURSE_FEE_FULL_PAISE ?? "180000");

  const order = await razorpay.orders.create({
    amount: amountPaise,
    currency: "INR",
    notes: { userId: user.id, plan },
  });

  await db.payment.create({
    data: {
      userId: user.id,
      amountPaise,
      currency: "INR",
      status: "CREATED",
      razorpayOrderId: order.id,
      receiptNumber: `EF-${Date.now()}`,
    },
  });

  return Response.json({ orderId: order.id, amountPaise, keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID });
}
