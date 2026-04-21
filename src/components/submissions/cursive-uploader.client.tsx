"use client";
import { useState, useRef } from "react";
import type { Assignment, Submission } from "@prisma/client";
import { Camera, Upload, Send, X } from "lucide-react";

type Props = {
  assignment: Assignment;
  existingSubmission: Submission | null;
};

export function CursiveUploader({ assignment, existingSubmission }: Props) {
  const [preview, setPreview] = useState<string | null>(existingSubmission?.imageUrl ?? null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File) {
    if (f.size > 5 * 1024 * 1024) {
      alert("Image must be under 5MB");
      return;
    }
    setFile(f);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  }

  async function handleSubmit() {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "cursive-submissions");
      formData.append("assignmentId", assignment.id);

      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      const { url } = await uploadRes.json();

      await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentId: assignment.id,
          type: "CURSIVE",
          imageUrl: url,
          status: "SUBMITTED",
        }),
      });
      setSubmitted(true);
    } finally {
      setUploading(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-6">
        <div className="text-4xl mb-2">✅</div>
        <p className="font-semibold text-navy">Photo submitted!</p>
        <p className="text-muted text-sm mt-1">Rohini will grade your handwriting.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {!preview ? (
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-navy/30 rounded-xl p-8 text-center cursor-pointer hover:border-gold transition-colors"
        >
          <Camera className="h-8 w-8 text-muted mx-auto mb-2" />
          <p className="text-navy font-medium text-sm">Take a photo or upload image</p>
          <p className="text-muted text-xs mt-1">Max 5MB · JPG/PNG</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
          />
        </div>
      ) : (
        <div className="relative">
          <img src={preview} alt="Cursive preview" className="w-full rounded-xl border-2 border-navy/10" />
          <button
            onClick={() => { setPreview(null); setFile(null); }}
            className="absolute top-2 right-2 bg-white/90 rounded-full p-1 shadow-sm hover:bg-red/10 transition-colors"
          >
            <X className="h-4 w-4 text-navy" />
          </button>
        </div>
      )}
      {preview && (
        <button
          onClick={handleSubmit}
          disabled={!file || uploading}
          className="w-full flex items-center justify-center gap-2 bg-gold text-white py-3 rounded-xl font-semibold hover:bg-gold/90 disabled:opacity-50 transition-colors"
        >
          <Send className="h-4 w-4" />
          {uploading ? "Uploading…" : "Submit Handwriting"}
        </button>
      )}
    </div>
  );
}
