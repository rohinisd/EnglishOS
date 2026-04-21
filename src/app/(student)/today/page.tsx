import { requireApproved } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Play, CheckCircle, Lock, Flame, Trophy, BookOpen } from "lucide-react";
import { formatTime } from "@/lib/utils";

export default async function TodayPage() {
  const user = await requireApproved();

  const [sessions, streak, enrollment] = await Promise.all([
    db.session.findMany({
      where: { course: { slug: "english-mastery" } },
      include: {
        lessons: {
          where: { type: "VIDEO" },
          include: {
            video: {
              include: {
                progress: { where: { userId: user.id } },
              },
            },
          },
        },
      },
      orderBy: { sequence: "asc" },
      take: 20,
    }),
    db.streak.findUnique({ where: { userId: user.id } }),
    db.enrollment.findFirst({
      where: { userId: user.id, course: { slug: "english-mastery" } },
    }),
  ]);

  const publishedSessions = sessions.filter(s => s.publishedAt);
  const latestSession = publishedSessions[publishedSessions.length - 1];
  const completedCount = publishedSessions.filter(s => {
    const lesson = s.lessons[0];
    return lesson?.video?.progress[0]?.completed;
  }).length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="font-fraunces text-3xl font-bold text-navy">
          Good day, {user.name.split(" ")[0]} 👋
        </h1>
        <p className="text-muted mt-1">
          {enrollment ? `${completedCount}/${publishedSessions.length} sessions completed` : "Start your free trial today"}
        </p>
      </div>

      {/* Streak + Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-xl p-4 text-center border border-navy/10 shadow-sm">
          <Flame className="h-6 w-6 text-gold mx-auto mb-1" />
          <div className="text-2xl font-bold text-navy">{streak?.currentDays ?? 0}</div>
          <div className="text-xs text-muted">Day Streak</div>
        </div>
        <div className="bg-white rounded-xl p-4 text-center border border-navy/10 shadow-sm">
          <BookOpen className="h-6 w-6 text-gold mx-auto mb-1" />
          <div className="text-2xl font-bold text-navy">{completedCount}</div>
          <div className="text-xs text-muted">Done</div>
        </div>
        <div className="bg-white rounded-xl p-4 text-center border border-navy/10 shadow-sm">
          <Trophy className="h-6 w-6 text-gold mx-auto mb-1" />
          <div className="text-2xl font-bold text-navy">{user.studentProfile?.xp ?? 0}</div>
          <div className="text-xs text-muted">XP</div>
        </div>
      </div>

      {/* Latest session */}
      {latestSession && (
        <div className="mb-6">
          <h2 className="font-fraunces text-lg font-semibold text-navy mb-3">Continue Learning</h2>
          {(() => {
            const lesson = latestSession.lessons[0];
            const progress = lesson?.video?.progress[0];
            const pct = Math.round((progress?.percentage ?? 0) * 100);
            const resumeSec = progress?.lastPositionSec ?? 0;
            const isCompleted = progress?.completed ?? false;
            return (
              <Link
                href={`/sessions/${latestSession.id}`}
                className="block bg-navy rounded-2xl p-5 text-cream hover:bg-navy/90 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-cream/60 text-xs mb-1">Session {latestSession.sequence}</p>
                    <h3 className="font-fraunces text-xl font-semibold">{latestSession.title}</h3>
                  </div>
                  {isCompleted && <CheckCircle className="h-6 w-6 text-gold flex-shrink-0" />}
                </div>
                <div className="h-2 bg-white/20 rounded-full mb-2">
                  <div className="h-2 bg-gold rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-cream/60 text-sm">{pct}% watched</span>
                  <div className="flex items-center gap-2 bg-gold text-white px-4 py-2 rounded-lg text-sm font-semibold">
                    <Play className="h-4 w-4" />
                    {resumeSec > 0 ? `Continue from ${formatTime(resumeSec)}` : "Start"}
                  </div>
                </div>
              </Link>
            );
          })()}
        </div>
      )}

      {/* All sessions */}
      <h2 className="font-fraunces text-lg font-semibold text-navy mb-3">All Sessions</h2>
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
                  className="flex items-center gap-4 bg-white rounded-xl p-4 border border-navy/10 shadow-sm hover:border-gold/50 transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-navy/5 flex items-center justify-center flex-shrink-0">
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-gold" />
                    ) : (
                      <span className="text-navy font-bold text-sm">{session.sequence}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-navy font-medium text-sm truncate">{session.title}</p>
                    <div className="h-1.5 bg-navy/10 rounded-full mt-1.5">
                      <div className="h-1.5 bg-gold rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <span className="text-xs text-muted flex-shrink-0">{pct}%</span>
                </Link>
              ) : (
                <div className="flex items-center gap-4 bg-white/50 rounded-xl p-4 border border-navy/5 opacity-60">
                  <div className="w-10 h-10 rounded-full bg-navy/5 flex items-center justify-center flex-shrink-0">
                    <Lock className="h-4 w-4 text-muted" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-muted font-medium text-sm truncate">{session.title}</p>
                    <p className="text-xs text-muted/60">Not yet available</p>
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
