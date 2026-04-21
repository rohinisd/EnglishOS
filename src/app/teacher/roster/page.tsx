import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { ApprovalActions } from "@/components/admin/approval-actions.client";

export default async function RosterPage() {
  await requireRole(["TEACHER", "ADMIN"]);

  const [pendingStudents, activeStudents] = await Promise.all([
    db.user.findMany({
      where: { role: "STUDENT", approvalStatus: "PENDING", deletedAt: null },
      include: { studentProfile: true },
      orderBy: { createdAt: "asc" },
    }),
    db.user.findMany({
      where: { role: "STUDENT", approvalStatus: { in: ["APPROVED", "REJECTED", "SUSPENDED"] }, deletedAt: null },
      include: {
        studentProfile: true,
        subscriptions: { orderBy: { createdAt: "desc" }, take: 1 },
        videoProgress: { where: { completed: true } },
        submissions: { where: { status: "GRADED" } },
        streak: true,
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
      <h1 className="font-fraunces text-3xl font-bold text-navy">Student Roster</h1>

      {/* ── Pending Approvals ── */}
      {pendingStudents.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <h2 className="font-fraunces text-xl font-semibold text-navy">Pending Approval</h2>
            <span className="bg-red/10 text-red text-xs font-bold px-2.5 py-1 rounded-full">
              {pendingStudents.length} waiting
            </span>
          </div>
          <div className="space-y-3">
            {pendingStudents.map(student => (
              <div key={student.id} className="bg-white rounded-xl border-2 border-gold/30 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-navy">{student.name}</span>
                      <span className="text-xs bg-navy/5 text-navy px-2 py-0.5 rounded-full">
                        {student.studentProfile?.grade?.replace("CLASS_", "Class ") ?? "—"}
                      </span>
                    </div>
                    <p className="text-muted text-sm mt-0.5">📱 {student.phone}</p>
                    {student.studentProfile?.parentName && (
                      <p className="text-muted text-xs mt-0.5">
                        Parent: {student.studentProfile.parentName}
                        {student.studentProfile.parentPhone && ` · ${student.studentProfile.parentPhone}`}
                      </p>
                    )}
                    {student.studentProfile?.schoolName && (
                      <p className="text-muted text-xs">{student.studentProfile.schoolName}{student.studentProfile.city ? ` · ${student.studentProfile.city}` : ""}</p>
                    )}
                    <p className="text-muted text-xs mt-1">Registered: {formatDate(student.createdAt)}</p>
                  </div>
                  <ApprovalActions userId={student.id} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pendingStudents.length === 0 && (
        <div className="bg-gold/5 border border-gold/20 rounded-xl p-4 text-center">
          <p className="text-navy font-medium text-sm">✅ No pending approvals</p>
        </div>
      )}

      {/* ── Active Students ── */}
      <div>
        <h2 className="font-fraunces text-xl font-semibold text-navy mb-3">
          All Students ({activeStudents.length})
        </h2>
        <div className="bg-white rounded-xl border border-navy/10 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-navy/5 border-b border-navy/10">
                  <th className="text-left text-xs font-semibold text-muted px-4 py-3">Student</th>
                  <th className="text-left text-xs font-semibold text-muted px-4 py-3">Class</th>
                  <th className="text-center text-xs font-semibold text-muted px-4 py-3">Status</th>
                  <th className="text-center text-xs font-semibold text-muted px-4 py-3">Videos</th>
                  <th className="text-center text-xs font-semibold text-muted px-4 py-3">Streak</th>
                  <th className="text-left text-xs font-semibold text-muted px-4 py-3">Subscription</th>
                  <th className="text-left text-xs font-semibold text-muted px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeStudents.map(student => {
                  const sub = student.subscriptions[0];
                  const subStatus = sub?.status ?? "none";
                  const approvalStatus = student.approvalStatus;
                  return (
                    <tr key={student.id} className="border-b border-navy/5 hover:bg-cream/50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-navy text-sm">{student.name}</div>
                        <div className="text-muted text-xs">{student.phone}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-navy">
                        {student.studentProfile?.grade?.replace("CLASS_", "Class ") ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          approvalStatus === "APPROVED" ? "bg-gold/10 text-gold" :
                          approvalStatus === "REJECTED" ? "bg-red/10 text-red" :
                          "bg-navy/10 text-muted"
                        }`}>
                          {approvalStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-semibold text-navy">
                        {student.videoProgress.length}
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-semibold text-navy">
                        {student.streak?.currentDays ?? 0}🔥
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          subStatus === "ACTIVE" ? "bg-gold/10 text-gold" :
                          subStatus === "TRIAL" ? "bg-navy/10 text-navy" :
                          "bg-red/10 text-red"
                        }`}>
                          {subStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <ApprovalActions userId={student.id} compact currentStatus={approvalStatus} />
                      </td>
                    </tr>
                  );
                })}
                {activeStudents.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-muted">No approved students yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
