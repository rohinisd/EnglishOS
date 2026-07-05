import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import Razorpay from "razorpay";
import { z } from "zod";

const CreateBody = z.object({
  preferredStartAt: z.string().min(1),
  studentNotes: z.string().max(1000).optional(),
});

const PRICE_PAISE = parseInt(process.env.SPEAKING_SESSION_PRICE_PAISE ?? "10000", 10);
const DURATION_MINUTES = 60;

export async function GET() {
  const sessionUser = await getSession();
  if (!sessionUser) return new Response("unauthorized", { status: 401 });

  const user = await db.user.findUnique({ where: { id: sessionUser.id } });
  if (!user) return new Response("forbidden", { status: 403 });

  const where = ["TEACHER", "ADMIN"].includes(user.role)
    ? {}
    : { studentId: user.id };

  const bookings = await db.speakingBooking.findMany({
    where,
    include: {
      student: { select: { id: true, name: true, phone: true } },
      teacher: { select: { id: true, name: true, phone: true } },
    },
    orderBy: { preferredStartAt: "desc" },
    take: 50,
  });

  return Response.json({ bookings });
}

export async function POST(req: Request) {
  const sessionUser = await getSession();
  if (!sessionUser) return new Response("unauthorized", { status: 401 });

  const user = await db.user.findUnique({ where: { id: sessionUser.id } });
  if (!user || user.role !== "STUDENT") return new Response("forbidden", { status: 403 });

  const parsed = CreateBody.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: parsed.error }, { status: 400 });

  const preferredStartAt = new Date(parsed.data.preferredStartAt);
  if (Number.isNaN(preferredStartAt.getTime())) {
    return Response.json({ error: "Please choose a valid date and time." }, { status: 400 });
  }

  if (preferredStartAt.getTime() < Date.now()) {
    return Response.json({ error: "Please choose a future date and time." }, { status: 400 });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const publicKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? keyId;
  if (!keyId || !keySecret || !publicKeyId) {
    return Response.json({ error: "Razorpay is not configured." }, { status: 503 });
  }

  const booking = await db.speakingBooking.create({
    data: {
      studentId: user.id,
      preferredStartAt,
      studentNotes: parsed.data.studentNotes,
      durationMinutes: DURATION_MINUTES,
      pricePaise: PRICE_PAISE,
      status: "PENDING_PAYMENT",
    },
  });

  const razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  const order = await razorpay.orders.create({
    amount: PRICE_PAISE,
    currency: "INR",
    notes: {
      userId: user.id,
      bookingId: booking.id,
      purpose: "SPEAKING_BOOKING",
    },
  });

  await db.$transaction([
    db.speakingBooking.update({
      where: { id: booking.id },
      data: { razorpayOrderId: order.id },
    }),
    db.payment.create({
      data: {
        userId: user.id,
        speakingBookingId: booking.id,
        amountPaise: PRICE_PAISE,
        currency: "INR",
        status: "CREATED",
        razorpayOrderId: order.id,
        receiptNumber: `SP-${Date.now()}`,
      },
    }),
  ]);

  return Response.json({
    bookingId: booking.id,
    orderId: order.id,
    amountPaise: PRICE_PAISE,
    keyId: publicKeyId,
  });
}
