import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { TeacherBookingActions } from "@/components/speaking/teacher-booking-actions.client";
import { CalendarClock, Phone } from "lucide-react";

function formatDate(value: Date | null) {
  if (!value) return "Not confirmed yet";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
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

export default async function TeacherSpeakingBookingsPage() {
  await requireRole(["TEACHER", "ADMIN"]);

  const bookings = await db.speakingBooking.findMany({
    where: { status: { not: "PENDING_PAYMENT" } },
    include: {
      student: { select: { name: true, phone: true } },
      teacher: { select: { name: true } },
    },
    orderBy: [
      { status: "asc" },
      { preferredStartAt: "asc" },
    ],
    take: 100,
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6">
        <p className="text-muted text-sm">1:1 Add-on Sessions</p>
        <h1 className="font-fraunces text-3xl font-bold text-navy">
          Speaking Bookings
        </h1>
        <p className="text-muted mt-2">
          Confirm paid speaking-session requests, share meeting links, and add feedback after the call.
        </p>
      </div>

      <div className="space-y-4">
        {bookings.map(booking => (
          <div key={booking.id} className="bg-white rounded-xl border border-navy/10 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-navy/5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <CalendarClock className="h-3.5 w-3.5" />
                    Preferred: {formatDate(booking.preferredStartAt)}
                  </div>
                  <h3 className="font-semibold text-navy mt-1">{booking.student.name}</h3>
                  <div className="flex items-center gap-2 text-muted text-sm mt-1">
                    <Phone className="h-3.5 w-3.5" />
                    {booking.student.phone}
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${statusClass(booking.status)}`}>
                  {booking.status.replaceAll("_", " ")}
                </span>
              </div>
            </div>

            <div className="p-4 bg-cream/40 border-b border-navy/5 grid sm:grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-muted text-xs">Paid</p>
                <p className="font-semibold text-navy">Rs.{booking.pricePaise / 100}</p>
              </div>
              <div>
                <p className="text-muted text-xs">Duration</p>
                <p className="font-semibold text-navy">{booking.durationMinutes} minutes</p>
              </div>
              <div>
                <p className="text-muted text-xs">Confirmed</p>
                <p className="font-semibold text-navy">{formatDate(booking.confirmedStartAt)}</p>
              </div>
            </div>

            {booking.studentNotes && (
              <div className="p-4 border-b border-navy/5">
                <p className="text-muted text-xs mb-1">Student wants to practise</p>
                <p className="text-navy text-sm whitespace-pre-wrap">{booking.studentNotes}</p>
              </div>
            )}

            <div className="p-4">
              <TeacherBookingActions
                bookingId={booking.id}
                initialConfirmedStartAt={booking.confirmedStartAt?.toISOString() ?? null}
                initialMeetingLink={booking.meetingLink ?? ""}
                initialTeacherFeedback={booking.teacherFeedback ?? ""}
                status={booking.status}
              />
            </div>
          </div>
        ))}

        {bookings.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-navy/10">
            <CalendarClock className="h-10 w-10 text-gold mx-auto mb-3" />
            <p className="font-semibold text-navy">No speaking bookings yet</p>
            <p className="text-muted text-sm mt-1">Paid booking requests will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
