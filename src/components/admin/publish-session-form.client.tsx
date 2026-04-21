"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Globe, EyeOff, AlertCircle } from "lucide-react";

type Props = {
  sessionId: string;
  isPublished: boolean;
  videoReady: boolean;
};

export function PublishSessionForm({ sessionId, isPublished, videoReady }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    await fetch(`/api/sessions/${sessionId}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publish: !isPublished }),
    });
    setLoading(false);
    router.refresh();
  }

  if (!videoReady && !isPublished) {
    return (
      <div className="flex items-center gap-2 text-muted text-sm">
        <AlertCircle className="h-4 w-4" />
        Upload and process a video before publishing
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div>
        <p className="text-navy font-medium text-sm">
          {isPublished ? "Session is live" : "Session is in draft"}
        </p>
        <p className="text-muted text-xs mt-0.5">
          {isPublished ? "Students can see and watch this session" : "Only you can see this session"}
        </p>
      </div>
      <button
        onClick={toggle}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 ${
          isPublished
            ? "bg-navy/10 text-navy hover:bg-navy/20"
            : "bg-gold text-white hover:bg-gold/90"
        }`}
      >
        {isPublished ? <EyeOff className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
        {loading ? "…" : isPublished ? "Unpublish" : "Publish Session"}
      </button>
    </div>
  );
}
