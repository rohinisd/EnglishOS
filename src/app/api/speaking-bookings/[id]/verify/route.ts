import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import crypto from "crypto";
import { z } from "zod";

const Body = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sessionUser = await getSession();
  if (!sessionUser) return new Response("unauthorized", { status: 401 });

  const user = await db.user.findUnique({ where: { id: sessionUser.id } });
  if (!user) return new Response("forbidden", { status: 403 });

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: "bad request" }, { status: 400 });

  const booking = await db.speakingBooking.findUnique({ where: { id } });
  if (!booking || booking.studentId !== user.id) {
    return new Response("not found", { status: 404 });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;
  if (booking.razorpayOrderId !== razorpay_order_id) {
    return Response.json({ error: "Order does not match this booking." }, { status: 400 });
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) return Response.json({ error: "Razorpay is not configured." }, { status: 503 });

  const expectedSig = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSig !== razorpay_signature) {
    return Response.json({ error: "Invalid payment signature" }, { status: 400 });
  }

  const paidAt = new Date();
  const updatedBooking = await db.$transaction(async tx => {
    const result = await tx.speakingBooking.update({
      where: { id },
      data: {
        status: "PAID",
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        paidAt,
      },
    });

    await tx.payment.updateMany({
      where: { razorpayOrderId: razorpay_order_id },
      data: {
        status: "PAID",
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        paidAt,
      },
    });

    await tx.notification.create({
      data: {
        userId: user.id,
        kind: "PAYMENT_RECEIVED",
        channel: "IN_APP",
        title: "Speaking session payment received",
        body: "Your speaking session request is paid. Rohini Ma'am will confirm the timing soon.",
        url: "/speaking-sessions",
      },
    });

    return result;
  });

  return Response.json({ ok: true, booking: updatedBooking });
}
