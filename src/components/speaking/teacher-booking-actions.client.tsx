"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2, Save, XCircle } from "lucide-react";

type Props = {
  bookingId: string;
  initialConfirmedStartAt: string | null;
  initialMeetingLink: string;
  initialTeacherFeedback: string;
  status: string;
};

function toDateTimeLocal(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

export function TeacherBookingActions({
  bookingId,
  initialConfirmedStartAt,
  initialMeetingLink,
  initialTeacherFeedback,
  status,
}: Props) {
  const router = useRouter();
  const [confirmedStartAt, setConfirmedStartAt] = useState(toDateTimeLocal(initialConfirmedStartAt));
  const [meetingLink, setMeetingLink] = useState(initialMeetingLink);
  const [teacherFeedback, setTeacherFeedback] = useState(initialTeacherFeedback);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function updateBooking(nextStatus: "CONFIRMED" | "COMPLETED" | "CANCELLED") {
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch(`/api/speaking-bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirmedStartAt: confirmedStartAt ? new Date(confirmedStartAt).toISOString() : undefined,
          meetingLink: meetingLink.trim() || undefined,
          teacherFeedback: teacherFeedback.trim() || undefined,
          status: nextStatus,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setMessage(data.error ?? "Could not update booking.");
        return;
      }

      setMessage("Saved.");
      router.refresh();
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs font-medium text-navy">Confirmed date and time</span>
          <input
            type="datetime-local"
            value={confirmedStartAt}
            onChange={e => setConfirmedStartAt(e.target.value)}
            className="mt-1 w-full border-2 border-navy/20 rounded-lg px-3 py-2 text-navy text-sm focus:border-gold focus:outline-none"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium text-navy">Meeting link</span>
          <input
            type="url"
            value={meetingLink}
            onChange={e => setMeetingLink(e.target.value)}
            placeholder="https://meet.google.com/..."
            className="mt-1 w-full border-2 border-navy/20 rounded-lg px-3 py-2 text-navy text-sm focus:border-gold focus:outline-none"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-xs font-medium text-navy">Feedback after session</span>
        <textarea
          value={teacherFeedback}
          onChange={e => setTeacherFeedback(e.target.value)}
          rows={3}
          placeholder="Fluency, grammar, vocabulary, pronunciation, confidence..."
          className="mt-1 w-full border-2 border-navy/20 rounded-lg px-3 py-2 text-navy text-sm focus:border-gold focus:outline-none"
        />
      </label>

      {message && <p className="text-muted text-xs">{message}</p>}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => updateBooking("CONFIRMED")}
          disabled={saving || !confirmedStartAt || status === "CANCELLED"}
          className="inline-flex items-center gap-2 bg-gold text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-gold/90 disabled:opacity-50 transition-colors"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Confirm
        </button>

        <button
          type="button"
          onClick={() => updateBooking("COMPLETED")}
          disabled={saving || status === "CANCELLED"}
          className="inline-flex items-center gap-2 bg-navy text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-navy/90 disabled:opacity-50 transition-colors"
        >
          <CheckCircle className="h-4 w-4" />
          Mark Completed
        </button>

        <button
          type="button"
          onClick={() => updateBooking("CANCELLED")}
          disabled={saving || status === "COMPLETED"}
          className="inline-flex items-center gap-2 border border-red/30 text-red px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red/5 disabled:opacity-50 transition-colors"
        >
          <XCircle className="h-4 w-4" />
          Cancel
        </button>
      </div>
    </div>
  );
}
