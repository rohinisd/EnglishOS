"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ApprovalStatus } from "@prisma/client";

interface Props {
  userId: string;
  compact?: boolean;
  currentStatus?: ApprovalStatus;
}

export function ApprovalActions({ userId, compact = false, currentStatus }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function act(action: string) {
    setLoading(action);
    try {
      const res = await fetch("/api/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(null);
    }
  }

  if (compact) {
    // Inline actions for the table row
    if (currentStatus === "APPROVED") {
      return (
        <button
          onClick={() => act("suspend")}
          disabled={!!loading}
          className="text-xs text-muted hover:text-red transition-colors underline"
        >
          {loading === "suspend" ? "…" : "Suspend"}
        </button>
      );
    }
    if (currentStatus === "SUSPENDED" || currentStatus === "REJECTED") {
      return (
        <button
          onClick={() => act("reactivate")}
          disabled={!!loading}
          className="text-xs text-gold hover:text-gold/80 transition-colors underline"
        >
          {loading === "reactivate" ? "…" : "Reactivate"}
        </button>
      );
    }
    return null;
  }

  // Full approve/reject buttons for pending card
  return (
    <div className="flex gap-2 shrink-0 flex-col sm:flex-row">
      <button
        onClick={() => act("approve")}
        disabled={!!loading}
        className="bg-gold text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gold/90 disabled:opacity-60 transition-colors whitespace-nowrap"
      >
        {loading === "approve" ? "Approving…" : "✅ Approve"}
      </button>
      <button
        onClick={() => act("reject")}
        disabled={!!loading}
        className="bg-navy/5 text-navy text-sm font-medium px-4 py-2 rounded-lg hover:bg-navy/10 disabled:opacity-60 transition-colors"
      >
        {loading === "reject" ? "…" : "Reject"}
      </button>
    </div>
  );
}
