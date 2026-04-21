"use client";
import { useState } from "react";
import { CheckCircle, PlayCircle, ExternalLink } from "lucide-react";

type Props = {
  lessonId: string;
  currentYoutubeVideoId?: string | null;
};

function extractVideoId(input: string): string | null {
  const trimmed = input.trim();
  // Already a bare ID (11 chars, no slashes)
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  // Full URL or short URL
  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    if (url.hostname.includes("youtu.be")) return url.pathname.slice(1).split("?")[0];
    return url.searchParams.get("v");
  } catch {
    return null;
  }
}

export function VideoUploaderClient({ lessonId, currentYoutubeVideoId }: Props) {
  const [input, setInput] = useState(currentYoutubeVideoId ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(!!currentYoutubeVideoId);
  const [error, setError] = useState<string | null>(null);

  const videoId = extractVideoId(input);

  async function handleSave() {
    if (!videoId) { setError("Could not extract a valid YouTube video ID from that URL"); return; }
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/videos/set-youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, youtubeVideoId: videoId }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Save failed"); return; }
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <PlayCircle className="h-5 w-5 text-red-500" />
        <h3 className="font-semibold text-navy">YouTube Video</h3>
      </div>

      <div className="bg-navy/5 rounded-xl p-4 text-sm text-muted space-y-1">
        <p className="font-medium text-navy text-xs">How to add a video:</p>
        <ol className="list-decimal list-inside space-y-0.5 text-xs">
          <li>Upload to YouTube → set visibility to <strong>Unlisted</strong></li>
          <li>Copy the video URL or just the video ID</li>
          <li>Paste below and click Save</li>
        </ol>
      </div>

      <div>
        <label className="block text-navy text-sm font-semibold mb-2">
          YouTube URL or Video ID
        </label>
        <input
          type="text"
          value={input}
          onChange={e => { setInput(e.target.value); setSaved(false); setError(null); }}
          placeholder="https://youtu.be/dQw4w9WgXcQ  or  dQw4w9WgXcQ"
          className="w-full border-2 border-navy/20 rounded-xl px-4 py-3 text-navy focus:border-gold focus:outline-none font-mono text-sm"
        />
        {input && !videoId && (
          <p className="text-red text-xs mt-1">Paste a YouTube URL or 11-character video ID</p>
        )}
        {videoId && (
          <p className="text-gold text-xs mt-1 font-medium">✓ Video ID: {videoId}</p>
        )}
      </div>

      {/* Preview thumbnail */}
      {videoId && (
        <div className="relative aspect-video w-full max-w-sm rounded-xl overflow-hidden bg-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
            alt="Video thumbnail"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-red-600 rounded-full p-2">
              <PlayCircle className="h-5 w-5 text-white" />
            </div>
          </div>
          <a
            href={`https://www.youtube.com/watch?v=${videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1 hover:bg-black/80 transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            Preview
          </a>
        </div>
      )}

      {error && <p className="text-red text-sm">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving || !videoId}
          className="bg-gold text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-gold/90 disabled:opacity-60 transition-colors"
        >
          {saving ? "Saving…" : "Save Video"}
        </button>
        {saved && (
          <div className="flex items-center gap-1.5 text-gold text-sm font-medium">
            <CheckCircle className="h-4 w-4" />
            Saved
          </div>
        )}
      </div>
    </div>
  );
}
