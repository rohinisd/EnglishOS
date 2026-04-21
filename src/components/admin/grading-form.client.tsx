"use client";
import { useState } from "react";
import { CheckCircle } from "lucide-react";

type Props = { submissionId: string; maxScore: number };

export function GradingForm({ submissionId, maxScore }: Props) {
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [grading, setGrading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleGrade() {
    if (!score) return;
    setGrading(true);
    try {
      await fetch(`/api/submissions/${submissionId}/grade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: Number(score), feedback }),
      });
      setDone(true);
    } finally {
      setGrading(false);
    }
  }

  if (done) {
    return (
      <div className="flex items-center gap-2 text-gold text-sm font-semibold">
        <CheckCircle className="h-4 w-4" /> Graded!
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={0}
          max={maxScore}
          value={score}
          onChange={e => setScore(e.target.value)}
          placeholder="Score"
          className="w-20 border-2 border-navy/20 rounded-lg px-3 py-2 text-navy text-sm focus:border-gold focus:outline-none"
        />
        <span className="text-muted text-sm">/ {maxScore}</span>
      </div>
      <input
        type="text"
        value={feedback}
        onChange={e => setFeedback(e.target.value)}
        placeholder="Feedback for student…"
        className="flex-1 border-2 border-navy/20 rounded-lg px-3 py-2 text-navy text-sm focus:border-gold focus:outline-none"
      />
      <button
        onClick={handleGrade}
        disabled={!score || grading}
        className="bg-gold text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gold/90 disabled:opacity-50 transition-colors"
      >
        {grading ? "Grading…" : "Grade"}
      </button>
    </div>
  );
}
