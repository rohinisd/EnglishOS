import { requireApproved } from "@/lib/auth";
import { db } from "@/lib/db";
import { Trophy, Flame, BookOpen, Star } from "lucide-react";

export default async function ProgressPage() {
  const user = await requireApproved();

  const [videoProgressData, submissions, quizAttempts, streak, badges] = await Promise.all([
    db.videoProgress.findMany({ where: { userId: user.id } }),
    db.submission.findMany({
      where: { userId: user.id, status: "GRADED" },
      include: { assignment: true },
    }),
    db.quizAttempt.findMany({ where: { userId: user.id } }),
    db.streak.findUnique({ where: { userId: user.id } }),
    db.userBadge.findMany({ where: { userId: user.id }, include: { badge: true } }),
  ]);

  const videosCompleted = videoProgressData.filter(v => v.completed).length;

  const writingSubmissions = submissions.filter(s => s.assignment?.type === "WRITING");
  const cursiveSubmissions = submissions.filter(s => s.assignment?.type === "CURSIVE");
  const speakingSubmissions = submissions.filter(s => s.assignment?.type === "SPEAKING");

  const avgWriting = writingSubmissions.length > 0 ? writingSubmissions.reduce((a, s) => a + (s.score ?? 0), 0) / writingSubmissions.length : 0;
  const avgCursive = cursiveSubmissions.length > 0 ? cursiveSubmissions.reduce((a, s) => a + (s.score ?? 0), 0) / cursiveSubmissions.length : 0;
  const avgSpeaking = speakingSubmissions.length > 0 ? speakingSubmissions.reduce((a, s) => a + (s.score ?? 0), 0) / speakingSubmissions.length : 0;
  const avgQuiz = quizAttempts.length > 0 ? quizAttempts.reduce((a, q) => a + q.percentage, 0) / quizAttempts.length : 0;

  const skills = [
    { name: "Grammar", score: Math.round(avgQuiz), color: "#0f2847", icon: "🧠" },
    { name: "Writing", score: Math.round((avgWriting / 10) * 100), color: "#c9973a", icon: "✍️" },
    { name: "Cursive", score: Math.round((avgCursive / 10) * 100), color: "#b03a2e", icon: "🖊️" },
    { name: "Speaking", score: Math.round((avgSpeaking / 10) * 100), color: "#5c6b80", icon: "🎤" },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="font-fraunces text-3xl font-bold text-navy mb-6">My Progress</h1>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-navy text-cream rounded-xl p-4">
          <Flame className="h-6 w-6 text-gold mb-2" />
          <div className="text-3xl font-bold">{streak?.currentDays ?? 0}</div>
          <div className="text-cream/60 text-sm">Day Streak</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-navy/10 shadow-sm">
          <BookOpen className="h-6 w-6 text-gold mb-2" />
          <div className="text-3xl font-bold text-navy">{videosCompleted}</div>
          <div className="text-muted text-sm">Videos Done</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-navy/10 shadow-sm">
          <Trophy className="h-6 w-6 text-gold mb-2" />
          <div className="text-3xl font-bold text-navy">{user.studentProfile?.xp ?? 0}</div>
          <div className="text-muted text-sm">Total XP</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-navy/10 shadow-sm">
          <Star className="h-6 w-6 text-gold mb-2" />
          <div className="text-3xl font-bold text-navy">{badges.length}</div>
          <div className="text-muted text-sm">Badges</div>
        </div>
      </div>

      {/* Skill scores */}
      <h2 className="font-fraunces text-xl font-semibold text-navy mb-4">Skill Progress</h2>
      <div className="space-y-4 mb-6">
        {skills.map(skill => (
          <div key={skill.name} className="bg-white rounded-xl p-4 border border-navy/10 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{skill.icon}</span>
                <span className="font-semibold text-navy">{skill.name}</span>
              </div>
              <span className="font-bold text-navy">{skill.score}%</span>
            </div>
            <div className="h-2 bg-navy/10 rounded-full">
              <div className="h-2 rounded-full transition-all" style={{ width: `${skill.score}%`, backgroundColor: skill.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <>
          <h2 className="font-fraunces text-xl font-semibold text-navy mb-4">Badges Earned</h2>
          <div className="grid grid-cols-2 gap-3">
            {badges.map(ub => (
              <div key={ub.id} className="bg-white rounded-xl p-4 border border-gold/20 shadow-sm text-center">
                <div className="text-3xl mb-2">🏅</div>
                <div className="font-semibold text-navy text-sm">{ub.badge.name}</div>
                <div className="text-muted text-xs mt-1">{ub.badge.description}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
