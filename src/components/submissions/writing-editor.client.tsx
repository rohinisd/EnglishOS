"use client";
import { useState, useCallback } from "react";
import type { Assignment, Submission } from "@prisma/client";
import { Send, Save } from "lucide-react";

type Props = {
  assignment: Assignment;
  existingSubmission: Submission | null;
};

export function WritingEditor({ assignment, existingSubmission }: Props) {
  const [text, setText] = useState(existingSubmission?.textContent ?? "");
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const minWords = assignment.wordCountMin ?? 0;
  const maxWords = assignment.wordCountMax ?? 9999;
  const isValid = wordCount >= minWords && wordCount <= maxWords;

  const save = useCallback(async (status: "DRAFT" | "SUBMITTED") => {
    if (status === "DRAFT") setSaving(true);
    else setSubmitting(true);
    try {
      await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: assignment.id,
          type: "WRITING",
          textContent: text,
          wordCount,
          status,
        }),
      });
      if (status === "SUBMITTED") setSubmitted(true);
    } finally {
      setSaving(false);
      setSubmitting(false);
    }
  }, [assignment.id, text, wordCount]);

  if (submitted) {
    return (
      <div className="text-center py-6">
        <div className="text-4xl mb-2">✅</div>
        <p className="font-semibold text-navy">Submission received!</p>
        <p className="text-muted text-sm mt-1">Rohini will grade it soon.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Start writing here…"
        rows={8}
        className="w-full border-2 border-navy/20 rounded-xl px-4 py-3 text-navy text-sm focus:border-gold focus:outline-none resize-none"
      />
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium ${wordCount < minWords ? "text-red-500" : wordCount > maxWords ? "text-red-500" : "text-muted"}`}>
          {wordCount} words {minWords > 0 && `(${minWords}–${maxWords} required)`}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => save("DRAFT")}
            disabled={saving || !text.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-navy/20 rounded-lg text-navy text-sm hover:bg-navy/5 disabled:opacity-50 transition-colors"
          >
            <Save className="h-3.5 w-3.5" /> {saving ? "Saving…" : "Save Draft"}
          </button>
          <button
            onClick={() => save("SUBMITTED")}
            disabled={submitting || !isValid}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-gold text-white rounded-lg text-sm font-semibold hover:bg-gold/90 disabled:opacity-50 transition-colors"
          >
            <Send className="h-3.5 w-3.5" /> {submitting ? "Submitting…" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
