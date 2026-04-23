"use client";
import { useState } from "react";
import { BookOpenCheck, CheckCircle2 } from "lucide-react";

type Props = {
  sessionId: string;
  currentTitle?: string | null;
  currentContent?: string | null;
};

export function ReadingContentEditorClient({ sessionId, currentTitle, currentContent }: Props) {
  const [title, setTitle] = useState(currentTitle ?? "Reading Practice");
  const [content, setContent] = useState(currentContent ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(!!currentContent);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (title.trim().length < 2) {
      setError("Please add a title with at least 2 characters.");
      return;
    }
    if (content.trim().length < 1) {
      setError("Please add reading content before saving.");
      return;
    }

    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/lessons/set-reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          title: title.trim(),
          content: content.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not save reading content");
        return;
      }
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <BookOpenCheck className="h-5 w-5 text-gold" />
        <h3 className="font-semibold text-navy">Topic Text Content</h3>
      </div>
      <p className="text-xs text-muted">
        Add full topic notes students should read to understand the lesson. You can paste explanation, examples, and key points.
      </p>

      <div>
        <label className="block text-navy text-sm font-semibold mb-2">Topic Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setSaved(false);
            setError(null);
          }}
          placeholder="Topic Notes: Direct and Indirect Speech"
          className="w-full border-2 border-navy/20 rounded-xl px-4 py-3 text-navy focus:border-gold focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-navy text-sm font-semibold mb-2">Topic Text</label>
        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setSaved(false);
            setError(null);
          }}
          placeholder="Paste full topic explanation/content here..."
          rows={10}
          className="w-full border-2 border-navy/20 rounded-xl px-4 py-3 text-navy focus:border-gold focus:outline-none"
        />
        <p className="text-xs text-muted mt-1">{content.trim().length} characters</p>
      </div>

      {error && <p className="text-red text-sm">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-gold text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-gold/90 disabled:opacity-60 transition-colors"
        >
          {saving ? "Saving..." : "Save Topic Text"}
        </button>
        {saved && (
          <div className="flex items-center gap-1.5 text-gold text-sm font-medium">
            <CheckCircle2 className="h-4 w-4" />
            Saved
          </div>
        )}
      </div>
    </div>
  );
}
