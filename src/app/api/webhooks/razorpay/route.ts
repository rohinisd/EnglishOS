import crypto from "crypto";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const rawBody = await req.text();
  const sig = req.headers.get("x-razorpay-signature") ?? "";
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET ?? "";

  if (secret && secret !== "placeholder_fill_later") {
    const expectedSig = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    if (sig !== expectedSig) return new Response("invalid sig", { status: 401 });
  }

  const event = JSON.parse(rawBody);

  if (event.event === "payment.failed") {
    const orderId = event.payload.payment.entity.order_id;
    await db.payment.updateMany({
      where: { razorpayOrderId: orderId },
      data: { status: "FAILED", failureReason: event.payload.payment.entity.error_description },
    });
  }

  return Response.json({ received: true });
}
