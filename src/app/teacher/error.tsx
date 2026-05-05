"use client";

import { useEffect } from "react";

export default function TeacherError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Teacher section error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-cream">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8">
        <h1 className="font-fraunces text-2xl font-bold text-navy mb-3">
          Something went wrong
        </h1>
        <p className="text-muted text-sm mb-4">
          The teacher dashboard could not load. Details below — please share
          this with the developer.
        </p>
        <pre className="bg-navy/5 border border-navy/10 rounded-lg p-3 text-xs text-red whitespace-pre-wrap break-words mb-4">
          {error.message}
          {error.digest ? `\n\ndigest: ${error.digest}` : ""}
        </pre>
        <button
          type="button"
          onClick={reset}
          className="bg-gold text-white px-4 py-2 rounded-xl font-semibold hover:bg-gold/90 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
