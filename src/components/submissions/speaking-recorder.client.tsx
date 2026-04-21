"use client";
import { useState, useRef, useEffect } from "react";
import type { Assignment, Submission } from "@prisma/client";
import { Mic, MicOff, Square, Send, Play, Trash2 } from "lucide-react";
import { formatTime } from "@/lib/utils";

type Props = {
  assignment: Assignment;
  existingSubmission: Submission | null;
};

export function SpeakingRecorder({ assignment, existingSubmission }: Props) {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(existingSubmission?.audioUrl ?? null);
  const [duration, setDuration] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const minSec = assignment.durationSecMin ?? 30;
  const maxSec = assignment.durationSecMax ?? 180;

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = e => chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start(1000);
      setRecording(true);
      setElapsed(0);
      timerRef.current = setInterval(() => {
        setElapsed(prev => {
          if (prev >= maxSec) { mr.stop(); clearInterval(timerRef.current!); setRecording(false); }
          return prev + 1;
        });
      }, 1000);
    } catch {
      alert("Microphone access denied. Please allow microphone access.");
    }
  }

  function stopRecording() {
    mediaRef.current?.stop();
    setRecording(false);
    setDuration(elapsed);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  async function handleSubmit() {
    if (!audioBlob) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "recording.webm");
      formData.append("bucket", "speaking-submissions");
      formData.append("assignmentId", assignment.id);

      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      const { url } = await uploadRes.json();

      await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: assignment.id,
          type: "SPEAKING",
          audioUrl: url,
          audioDurationSec: duration,
          status: "SUBMITTED",
        }),
      });
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-6">
        <div className="text-4xl mb-2">✅</div>
        <p className="font-semibold text-navy">Voice note submitted!</p>
        <p className="text-muted text-sm mt-1">Rohini will grade your speaking.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-muted text-xs">Record {minSec}–{maxSec} seconds · Speak clearly</p>
      
      {!audioUrl ? (
        <div className="flex flex-col items-center gap-4 py-4">
          {recording && (
            <div className="text-center">
              <div className="text-red-500 font-bold text-2xl">{formatTime(elapsed)}</div>
              <div className="text-muted text-xs mt-1">Recording… ({maxSec - elapsed}s left)</div>
            </div>
          )}
          <button
            onClick={recording ? stopRecording : startRecording}
            className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all ${
              recording ? "bg-red-500 text-white animate-pulse scale-110" : "bg-gold text-white hover:scale-105"
            }`}
          >
            {recording ? <Square className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
          </button>
          <p className="text-muted text-sm">{recording ? "Tap to stop" : "Tap to record"}</p>
        </div>
      ) : (
        <div className="space-y-3">
          <audio src={audioUrl} controls className="w-full rounded-xl" />
          <div className="flex gap-2">
            <button
              onClick={() => { setAudioBlob(null); setAudioUrl(null); setElapsed(0); }}
              className="flex items-center gap-1.5 px-3 py-2 border border-red/30 text-red rounded-lg text-sm hover:bg-red/5 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" /> Re-record
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || elapsed < minSec}
              className="flex-1 flex items-center justify-center gap-2 bg-gold text-white py-2 rounded-lg font-semibold hover:bg-gold/90 disabled:opacity-50 transition-colors"
            >
              <Send className="h-4 w-4" />
              {submitting ? "Uploading…" : elapsed < minSec ? `Need ${minSec - elapsed}s more` : "Submit Recording"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
