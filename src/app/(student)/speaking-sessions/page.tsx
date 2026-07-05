import { requireApproved } from "@/lib/auth";
import { db } from "@/lib/db";
import { SpeakingBookingForm } from "@/components/speaking/speaking-booking-form.client";

export default async function SpeakingSessionsPage() {
  const user = await requireApproved();

  const bookings = await db.speakingBooking.findMany({
    where: { studentId: user.id },
    orderBy: { preferredStartAt: "desc" },
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <p className="text-muted text-sm">Speaking Practice</p>
        <h1 className="font-fraunces text-3xl font-bold text-navy">
          Book a Speaking Session
        </h1>
        <p className="text-muted mt-2">
          Get personal speaking practice, corrections, and confidence-building guidance.
        </p>
      </div>

      <SpeakingBookingForm
        studentName={user.name}
        studentPhone={user.phone}
        bookings={bookings.map(booking => ({
          id: booking.id,
          status: booking.status,
          preferredStartAt: booking.preferredStartAt.toISOString(),
          confirmedStartAt: booking.confirmedStartAt?.toISOString() ?? null,
          meetingLink: booking.meetingLink,
          studentNotes: booking.studentNotes,
          teacherFeedback: booking.teacherFeedback,
          pricePaise: booking.pricePaise,
          durationMinutes: booking.durationMinutes,
          paidAt: booking.paidAt?.toISOString() ?? null,
        }))}
      />
    </div>
  );
}
