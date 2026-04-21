"use client";
import { useState, useRef } from "react";
import type { Video } from "@prisma/client";
import { Upload, CheckCircle, Loader2, AlertCircle } from "lucide-react";

type Props = {
  lessonId: string;
  video: Video | null;
};

export function VideoUploaderClient({ lessonId, video }: Props) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(file: File) {
    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      const res = await fetch("/api/mux/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Upload endpoint failed");
      }

      const { uploadUrl } = await res.json();

      const { createUpload } = await import("@mux/upchunk");
      const upload = createUpload({ endpoint: uploadUrl, file, chunkSize: 5120 });
      
      upload.on("progress", (e) => setProgress(Math.round(e.detail)));
      upload.on("success", () => { setDone(true); setUploading(false); });
      upload.on("error", (e) => { setError(e.detail.message); setUploading(false); });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setUploading(false);
    }
  }

  if (video?.muxStatus === "ready") {
    return (
      <div className="flex items-center gap-3 bg-gold/5 rounded-xl p-4">
        <CheckCircle className="h-6 w-6 text-gold" />
        <div>
          <p className="text-navy font-medium">Video is live</p>
          <p className="text-muted text-sm">Re-upload to replace</p>
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          className="ml-auto text-sm text-navy border border-navy/20 px-3 py-1.5 rounded-lg hover:bg-navy/5 transition-colors"
        >
          Replace
        </button>
        <input ref={inputRef} type="file" accept="video/*" className="hidden" onChange={e => { if (e.target.files?.[0]) handleUpload(e.target.files[0]); }} />
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex items-center gap-3 bg-navy/5 rounded-xl p-4">
        <Loader2 className="h-6 w-6 text-navy animate-spin" />
        <div>
          <p className="text-navy font-medium">Processing…</p>
          <p className="text-muted text-sm">Mux is encoding the video. This takes 2–5 minutes.</p>
        </div>
      </div>
    );
  }

  if (uploading) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-navy text-sm font-medium">Uploading…</span>
          <span className="text-muted text-sm">{progress}%</span>
        </div>
        <div className="h-2 bg-navy/10 rounded-full">
          <div className="h-2 bg-gold rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="flex items-center gap-2 bg-red/5 text-red rounded-lg p-3 mb-3 text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-navy/20 rounded-xl p-8 text-center cursor-pointer hover:border-gold transition-colors"
      >
        <Upload className="h-8 w-8 text-muted mx-auto mb-2" />
        <p className="text-navy font-medium">Drop video here or click to upload</p>
        <p className="text-muted text-sm mt-1">MP4 · Up to 2GB · Max 1 hour</p>
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={e => { if (e.target.files?.[0]) handleUpload(e.target.files[0]); }}
        />
      </div>
    </div>
  );
}
