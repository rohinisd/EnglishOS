"use client";
import { useState } from "react";
import type { Assignment, Submission, Rubric } from "@prisma/client";
import { Lock, CheckCircle, Clock, Send } from "lucide-react";
import { WritingEditor } from "./writing-editor.client";
import { CursiveUploader } from "./cursive-uploader.client";
import { SpeakingRecorder } from "./speaking-recorder.client";

type AssignmentWithSub = Assignment & {
  rubric: Rubric | null;
  submissions: Submission[];
};

type Props = {
  assignments: AssignmentWithSub[];
  videoCompleted: boolean;
  userId: string;
  sessionId: string;
};

export function HomeworkSection({ assignments, videoCompleted }: Props) {
  const [activeTab, setActiveTab] = useState(assignments[0]?.id ?? "");

  if (!videoCompleted) {
    return (
      <div className="bg-navy/5 rounded-xl p-6 text-center">
        <Lock className="h-8 w-8 text-muted mx-auto mb-3" />
        <p className="text-navy font-semibold">Homework Locked</p>
        <p className="text-muted text-sm mt-1">Watch at least 95% of the video to unlock homework</p>
      </div>
    );
  }

  if (assignments.length === 0) {
    return <p className="text-muted text-sm text-center py-8">No homework for this session.</p>;
  }

  return (
    <div className="space-y-4">
      {assignments.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {assignments.map(a => (
            <button
              key={a.id}
              onClick={() => setActiveTab(a.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === a.id ? "bg-navy text-cream" : "bg-navy/10 text-navy hover:bg-navy/20"
              }`}
            >
              {a.type.charAt(0) + a.type.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      )}

      {assignments.map(assignment => {
        if (assignments.length > 1 && activeTab !== assignment.id) return null;
        const submission = assignment.submissions[0];
        const isGraded = submission?.status === "GRADED";
        const isSubmitted = submission?.status === "SUBMITTED" || isGraded;

        return (
          <div key={assignment.id} className="bg-white rounded-xl border border-navy/10 overflow-hidden">
            <div className="p-4 border-b border-navy/5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold text-gold uppercase tracking-wide">{assignment.type}</span>
                  <h3 className="font-semibold text-navy mt-0.5">{assignment.title}</h3>
                </div>
                {isGraded && (
                  <div className="flex-shrink-0 bg-gold/10 text-gold text-sm font-bold px-3 py-1 rounded-full">
                    {submission?.score}/{assignment.maxScore}
                  </div>
                )}
                {isSubmitted && !isGraded && (
                  <div className="flex items-center gap-1.5 bg-navy/5 text-muted text-xs px-3 py-1 rounded-full">
                    <Clock className="h-3.5 w-3.5" /> Submitted
                  </div>
                )}
              </div>
              <p className="text-muted text-sm mt-2">{assignment.prompt}</p>
              {assignment.wordCountMin && (
                <p className="text-muted text-xs mt-1">{assignment.wordCountMin}–{assignment.wordCountMax} words</p>
              )}
            </div>

            {isGraded && submission?.feedback && (
              <div className="p-4 bg-gold/5 border-b border-gold/10">
                <p className="text-xs font-semibold text-gold mb-1">Teacher Feedback</p>
                <p className="text-navy text-sm">{submission.feedback}</p>
              </div>
            )}

            {!isSubmitted && (
              <div className="p-4">
                {assignment.type === "WRITING" && (
                  <WritingEditor assignment={assignment} existingSubmission={submission ?? null} />
                )}
                {assignment.type === "CURSIVE" && (
                  <CursiveUploader assignment={assignment} existingSubmission={submission ?? null} />
                )}
                {assignment.type === "SPEAKING" && (
                  <SpeakingRecorder assignment={assignment} existingSubmission={submission ?? null} />
                )}
              </div>
            )}

            {isGraded && submission?.textContent && (
              <div className="p-4">
                <p className="text-xs font-semibold text-muted mb-2">Your Submission</p>
                <div className="text-navy text-sm whitespace-pre-wrap bg-cream rounded-lg p-3">{submission.textContent}</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
