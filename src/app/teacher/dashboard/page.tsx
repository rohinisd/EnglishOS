import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Users, BookOpen, FileText, TrendingUp } from "lucide-react";

export default async function TeacherDashboard() {
  await requireRole(["TEACHER", "ADMIN"]);

  const [totalStudents, pendingSubmissions, publishedSessions, recentSubmissions, pendingApprovals] = await Promise.all([
    db.user.count({ where: { role: "STUDENT", approvalStatus: "APPROVED" } }),
    db.submission.count({ where: { status: "SUBMITTED" } }),
    db.session.count({ where: { publishedAt: { not: null } } }),
    db.submission.findMany({
      where: { status: "SUBMITTED" },
      include: { user: true, assignment: { include: { session: true } } },
      orderBy: { submittedAt: "desc" },
      take: 10,
    }),
    db.user.count({ where: { role: "STUDENT", approvalStatus: "PENDING" } }),
  ]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="font-fraunces text-3xl font-bold text-navy mb-6">Teacher Dashboard</h1>

      {pendingApprovals > 0 && (
        <Link href="/teacher/roster" className="flex items-center gap-3 bg-red/5 border-2 border-red/20 rounded-xl p-4 mb-6 hover:bg-red/10 transition-colors">
          <span className="bg-red text-white text-xs font-bold px-2.5 py-1 rounded-full">{pendingApprovals}</span>
          <div>
            <p className="text-navy font-semibold text-sm">
              {pendingApprovals === 1 ? "1 student" : `${pendingApprovals} students`} waiting for approval
            </p>
            <p className="text-muted text-xs">Click to review and approve →</p>
          </div>
        </Link>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Users, label: "Students", value: totalStudents, color: "bg-navy" },
          { icon: FileText, label: "Pending", value: pendingSubmissions, color: "bg-red" },
          { icon: BookOpen, label: "Sessions Live", value: publishedSessions, color: "bg-gold" },
          { icon: TrendingUp, label: "Streak", value: "—", color: "bg-muted" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className={`${color} text-white rounded-xl p-4`}>
            <Icon className="h-6 w-6 mb-2 opacity-80" />
            <div className="text-3xl font-bold">{value}</div>
            <div className="text-white/70 text-sm">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="font-fraunces text-xl font-semibold text-navy mb-3">Quick Actions</h2>
          <div className="space-y-2">
            <Link href="/teacher/sessions" className="flex items-center gap-3 bg-white rounded-xl p-4 border border-navy/10 hover:border-gold/50 transition-all">
              <BookOpen className="h-5 w-5 text-gold" />
              <span className="text-navy font-medium">Manage Sessions</span>
            </Link>
            <Link href="/teacher/submissions" className="flex items-center gap-3 bg-white rounded-xl p-4 border border-navy/10 hover:border-gold/50 transition-all">
              <FileText className="h-5 w-5 text-gold" />
              <span className="text-navy font-medium">Grade Submissions ({pendingSubmissions} pending)</span>
            </Link>
            <Link href="/teacher/roster" className="flex items-center gap-3 bg-white rounded-xl p-4 border border-navy/10 hover:border-gold/50 transition-all">
              <Users className="h-5 w-5 text-gold" />
              <span className="text-navy font-medium">Student Roster</span>
            </Link>
          </div>
        </div>

        <div>
          <h2 className="font-fraunces text-xl font-semibold text-navy mb-3">Recent Submissions</h2>
          <div className="space-y-2">
            {recentSubmissions.map(sub => (
              <Link key={sub.id} href={`/teacher/submissions?id=${sub.id}`} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-navy/10 hover:border-gold/50 transition-all">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                  sub.assignment.type === "WRITING" ? "bg-navy" : sub.assignment.type === "CURSIVE" ? "bg-gold" : "bg-red"
                }`}>
                  {sub.assignment.type[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-navy text-sm font-medium truncate">{sub.user.name}</p>
                  <p className="text-muted text-xs truncate">Session {sub.assignment.session?.sequence} · {sub.assignment.type}</p>
                </div>
              </Link>
            ))}
            {recentSubmissions.length === 0 && (
              <p className="text-muted text-sm text-center py-4">No pending submissions</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
