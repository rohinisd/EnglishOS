import { requireApproved } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { CheckCircle, Lock, Play } from "lucide-react";

export default async function SessionsPage() {
  const user = await requireApproved();

  const sessions = await db.session.findMany({
    where: { course: { slug: "english-mastery" } },
    include: {
      lessons: {
        where: { type: "VIDEO" },
        include: { video: { include: { progress: { where: { userId: user.id } } } } },
      },
      assignments: { select: { id: true, type: true } },
      quizzes: { select: { id: true } },
    },
    orderBy: { sequence: "asc" },
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="font-fraunces text-3xl font-bold text-navy mb-2">Sessions</h1>
      <p className="text-muted mb-6">20-session English Mastery Program</p>

      <div className="space-y-3">
        {sessions.map((session) => {
          const lesson = session.lessons[0];
          const progress = lesson?.video?.progress[0];
          const pct = Math.round((progress?.percentage ?? 0) * 100);
          const isPublished = !!session.publishedAt;
          const isCompleted = progress?.completed ?? false;

          return (
            <div key={session.id}>
              {isPublished ? (
                <Link
                  href={`/sessions/${session.id}`}
                  className="flex items-start gap-4 bg-white rounded-xl p-4 border border-navy/10 shadow-sm hover:border-gold/50 hover:shadow-md transition-all"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isCompleted ? "bg-gold/10" : "bg-navy/5"}`}>
                    {isCompleted ? (
                      <CheckCircle className="h-6 w-6 text-gold" />
                    ) : pct > 0 ? (
                      <Play className="h-6 w-6 text-navy" />
                    ) : (
                      <span className="text-navy font-bold">{session.sequence}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted mb-0.5">Session {session.sequence}</p>
                    <h3 className="text-navy font-semibold">{session.title}</h3>
                    {session.grammarFocus && (
                      <p className="text-muted text-xs mt-1 truncate">{session.grammarFocus}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex-1 h-1.5 bg-navy/10 rounded-full">
                        <div className="h-1.5 bg-gold rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-muted">{pct}%</span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {session.assignments.map(a => (
                        <span key={a.id} className="text-xs bg-navy/5 text-navy px-2 py-0.5 rounded-full capitalize">{a.type.toLowerCase()}</span>
                      ))}
                      {session.quizzes.length > 0 && (
                        <span className="text-xs bg-gold/10 text-gold px-2 py-0.5 rounded-full">Quiz</span>
                      )}
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="flex items-center gap-4 bg-white/50 rounded-xl p-4 border border-navy/5">
                  <div className="w-12 h-12 rounded-full bg-navy/5 flex items-center justify-center flex-shrink-0">
                    <Lock className="h-5 w-5 text-muted" />
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-0.5">Session {session.sequence}</p>
                    <h3 className="text-muted/70 font-semibold">{session.title}</h3>
                    <p className="text-xs text-muted/60">Coming soon</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
