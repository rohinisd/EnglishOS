import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import crypto from "crypto";
import { z } from "zod";
import { addMonths } from "date-fns";

const Body = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
  plan: z.enum(["monthly", "full"]),
});

export async function POST(req: Request) {
  const sessionUser = await getSession();
  if (!sessionUser) return new Response("unauthorized", { status: 401 });

  const user = await db.user.findUnique({ where: { id: sessionUser.id } });
  if (!user) return new Response("forbidden", { status: 403 });

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: "bad request" }, { status: 400 });

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = parsed.data;

  // Verify signature
  const expectedSig = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSig !== razorpay_signature) {
    return Response.json({ error: "Invalid payment signature" }, { status: 400 });
  }

  const amountPaise = plan === "monthly"
    ? parseInt(process.env.COURSE_FEE_MONTHLY_PAISE ?? "100000")
    : parseInt(process.env.COURSE_FEE_FULL_PAISE ?? "180000");

  const expiresAt = plan === "monthly"
    ? addMonths(new Date(), 1)
    : addMonths(new Date(), 2);

  // Create subscription + update payment
  const sub = await db.subscription.create({
    data: {
      userId: user.id,
      status: "ACTIVE",
      plan,
      pricePaise: amountPaise,
      startsAt: new Date(),
      expiresAt,
    },
  });

  await db.payment.updateMany({
    where: { razorpayOrderId: razorpay_order_id },
    data: {
      status: "PAID",
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      paidAt: new Date(),
      subscriptionId: sub.id,
    },
  });

  // Cancel old trial subscriptions
  await db.subscription.updateMany({
    where: { userId: user.id, status: "TRIAL", id: { not: sub.id } },
    data: { status: "CANCELLED", cancelledAt: new Date() },
  });

  // In-app notification
  await db.notification.create({
    data: {
      userId: user.id,
      kind: "PAYMENT_RECEIVED",
      channel: "IN_APP",
      title: "Payment confirmed!",
      body: `Your ${plan === "monthly" ? "monthly" : "full program"} subscription is now active.`,
      url: "/today",
    },
  });

  return Response.json({ ok: true, subscriptionId: sub.id });
}
