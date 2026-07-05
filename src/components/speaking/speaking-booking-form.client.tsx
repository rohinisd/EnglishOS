"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, CheckCircle, ExternalLink, Loader2, MessageSquare, Video } from "lucide-react";

type Booking = {
  id: string;
  status: string;
  preferredStartAt: string;
  confirmedStartAt: string | null;
  meetingLink: string | null;
  studentNotes: string | null;
  teacherFeedback: string | null;
  pricePaise: number;
  durationMinutes: number;
  paidAt: string | null;
};

type Props = {
  studentName: string;
  studentPhone: string;
  bookings: Booking[];
};

type RazorpaySuccess = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { name: string; contact: string };
  theme: { color: string };
  handler: (response: RazorpaySuccess) => void | Promise<void>;
  modal?: { ondismiss?: () => void };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

function loadRazorpayScript() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function formatBookingDate(value: string | null) {
  if (!value) return "Not confirmed yet";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function statusClass(status: string) {
  switch (status) {
    case "CONFIRMED":
      return "bg-gold/10 text-gold";
    case "COMPLETED":
      return "bg-navy/10 text-navy";
    case "CANCELLED":
      return "bg-red/10 text-red";
    case "PAID":
      return "bg-green-100 text-green-700";
    default:
      return "bg-muted/10 text-muted";
  }
}

export function SpeakingBookingForm({ studentName, studentPhone, bookings }: Props) {
  const router = useRouter();
  const [preferredStartAt, setPreferredStartAt] = useState("");
  const [studentNotes, setStudentNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const minimumDateTime = useMemo(() => {
    const date = new Date(Date.now() + 60 * 60 * 1000);
    date.setMinutes(0, 0, 0);
    return date.toISOString().slice(0, 16);
  }, []);

  async function handlePay() {
    if (!preferredStartAt) {
      setError("Please choose your preferred date and time.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) {
        setError("Could not load Razorpay checkout. Please try again.");
        return;
      }

      const createRes = await fetch("/api/speaking-bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferredStartAt: new Date(preferredStartAt).toISOString(),
          studentNotes: studentNotes.trim() || undefined,
        }),
      });

      const createData = await createRes.json();
      if (!createRes.ok) {
        setError(createData.error ?? "Could not create booking.");
        return;
      }

      const checkout = new window.Razorpay({
        key: createData.keyId,
        amount: createData.amountPaise,
        currency: "INR",
        name: "EnglishForge",
        description: "1:1 Speaking Session with Rohini Ma'am",
        order_id: createData.orderId,
        prefill: {
          name: studentName,
          contact: studentPhone.replace("+91", ""),
        },
        theme: { color: "#C8A24A" },
        handler: async (response) => {
          const verifyRes = await fetch(`/api/speaking-bookings/${createData.bookingId}/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });

          if (!verifyRes.ok) {
            const verifyData = await verifyRes.json();
            setError(verifyData.error ?? "Payment verification failed.");
            return;
          }

          setPreferredStartAt("");
          setStudentNotes("");
          router.refresh();
        },
        modal: {
          ondismiss: () => setSubmitting(false),
        },
      });

      checkout.open();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-navy rounded-2xl p-5 text-cream">
        <p className="text-cream/70 text-sm">Add-on speaking support</p>
        <h2 className="font-fraunces text-2xl font-bold mt-1">1:1 Speaking Session</h2>
        <p className="text-cream/80 text-sm mt-2">
          Practise English speaking directly with Rohini Ma&apos;am for 60 minutes.
        </p>
        <div className="mt-4 flex items-end gap-2">
          <span className="text-4xl font-bold">Rs.100</span>
          <span className="text-cream/60 pb-1">/ 60 minutes</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-navy/10 p-5 shadow-sm">
        <h3 className="font-fraunces text-xl font-semibold text-navy mb-1">Book Your Slot</h3>
        <p className="text-muted text-sm mb-4">
          Choose a preferred time. Rohini Ma&apos;am will confirm the final time and meeting link after payment.
        </p>

        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-navy">Preferred date and time</span>
            <input
              type="datetime-local"
              min={minimumDateTime}
              value={preferredStartAt}
              onChange={e => setPreferredStartAt(e.target.value)}
              className="mt-1 w-full border-2 border-navy/20 rounded-lg px-3 py-2 text-navy text-sm focus:border-gold focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-navy">What do you want to practise?</span>
            <textarea
              value={studentNotes}
              onChange={e => setStudentNotes(e.target.value)}
              rows={3}
              placeholder="Example: self-introduction, interview practice, speaking fluency, school viva..."
              className="mt-1 w-full border-2 border-navy/20 rounded-lg px-3 py-2 text-navy text-sm focus:border-gold focus:outline-none"
            />
          </label>

          {error && <p className="text-red text-sm">{error}</p>}

          <button
            type="button"
            onClick={handlePay}
            disabled={submitting}
            className="w-full bg-gold text-white py-3 rounded-lg font-semibold hover:bg-gold/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarClock className="h-4 w-4" />}
            {submitting ? "Opening payment..." : "Pay Rs.100 and Book"}
          </button>
        </div>
      </div>

      <div>
        <h3 className="font-fraunces text-xl font-semibold text-navy mb-3">Your Bookings</h3>
        <div className="space-y-3">
          {bookings.map(booking => (
            <div key={booking.id} className="bg-white rounded-xl border border-navy/10 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-muted text-xs">Preferred: {formatBookingDate(booking.preferredStartAt)}</p>
                  <h4 className="font-semibold text-navy mt-1">
                    Confirmed: {formatBookingDate(booking.confirmedStartAt)}
                  </h4>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${statusClass(booking.status)}`}>
                  {booking.status.replaceAll("_", " ")}
                </span>
              </div>

              {booking.meetingLink && (
                <a
                  href={booking.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-gold hover:text-gold/80"
                >
                  <Video className="h-4 w-4" /> Open meeting link <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}

              {booking.teacherFeedback && (
                <div className="mt-3 rounded-lg bg-cream/60 p-3">
                  <div className="flex items-center gap-2 text-navy text-sm font-semibold mb-1">
                    <MessageSquare className="h-4 w-4" /> Feedback
                  </div>
                  <p className="text-muted text-sm whitespace-pre-wrap">{booking.teacherFeedback}</p>
                </div>
              )}
            </div>
          ))}

          {bookings.length === 0 && (
            <div className="bg-white rounded-xl border border-navy/10 p-8 text-center">
              <CheckCircle className="h-8 w-8 text-gold mx-auto mb-2" />
              <p className="font-semibold text-navy">No speaking sessions booked yet</p>
              <p className="text-muted text-sm mt-1">Book your first 1:1 practice session above.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
