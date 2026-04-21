import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { GradingForm } from "@/components/admin/grading-form.client";

export default async function SubmissionsPage() {
  await requireRole(["TEACHER", "ADMIN"]);

  const submissions = await db.submission.findMany({
    where: { status: { in: ["SUBMITTED", "GRADING"] } },
    include: {
      user: true,
      assignment: { include: { session: true, rubric: true } },
    },
    orderBy: { submittedAt: "asc" },
    take: 50,
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="font-fraunces text-3xl font-bold text-navy mb-2">Pending Submissions</h1>
      <p className="text-muted mb-6">{submissions.length} submission{submissions.length !== 1 ? "s" : ""} awaiting grading</p>

      <div className="space-y-4">
        {submissions.map(sub => (
          <div key={sub.id} className="bg-white rounded-xl border border-navy/10 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-navy/5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-muted">Session {sub.assignment.session?.sequence} · {sub.assignment.type}</p>
                  <h3 className="font-semibold text-navy mt-0.5">{sub.user.name}</h3>
                  <p className="text-muted text-sm">{sub.assignment.title}</p>
                </div>
                <span className={`flex-shrink-0 text-xs px-2 py-1 rounded-full font-semibold ${
                  sub.assignment.type === "WRITING" ? "bg-navy/10 text-navy" :
                  sub.assignment.type === "CURSIVE" ? "bg-gold/10 text-gold" : "bg-red/10 text-red"
                }`}>
                  {sub.assignment.type}
                </span>
              </div>
            </div>

            {sub.textContent && (
              <div className="p-4 bg-cream/50 border-b border-navy/5">
                <p className="text-navy text-sm whitespace-pre-wrap">{sub.textContent}</p>
                {sub.wordCount && <p className="text-muted text-xs mt-2">{sub.wordCount} words</p>}
              </div>
            )}

            {sub.imageUrl && (
              <div className="p-4 border-b border-navy/5">
                <img src={sub.imageUrl} alt="Cursive submission" className="max-w-full rounded-lg border border-navy/10" />
              </div>
            )}

            {sub.audioUrl && (
              <div className="p-4 border-b border-navy/5">
                <audio src={sub.audioUrl} controls className="w-full" />
              </div>
            )}

            <div className="p-4">
              <GradingForm submissionId={sub.id} maxScore={sub.assignment.maxScore} />
            </div>
          </div>
        ))}

        {submissions.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-navy/10">
            <div className="text-4xl mb-3">✅</div>
            <p className="font-semibold text-navy">All caught up!</p>
            <p className="text-muted text-sm mt-1">No submissions pending grading.</p>
          </div>
        )}
      </div>
    </div>
  );
}
