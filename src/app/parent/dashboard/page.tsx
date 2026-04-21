import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function ParentDashboard() {
  const parent = await requireRole(["PARENT", "ADMIN"]);

  const children = await db.parentLink.findMany({
    where: { parentId: parent.id },
    include: {
      child: {
        include: {
          studentProfile: true,
          videoProgress: { where: { completed: true } },
          submissions: { where: { status: "GRADED" } },
          streak: true,
        },
      },
    },
  });

  return (
    <div>
      <h1 className="font-fraunces text-2xl font-bold text-navy mb-6">Your Child's Progress</h1>
      {children.length === 0 ? (
        <p className="text-muted text-center py-8">No student accounts linked. Contact support.</p>
      ) : (
        <div className="space-y-6">
          {children.map(link => {
            const child = link.child;
            const submissions = child.submissions;
            const avgScore = submissions.length > 0 ? submissions.reduce((a, s) => a + (s.score ?? 0), 0) / submissions.length : 0;
            return (
              <div key={link.id} className="bg-white rounded-xl border border-navy/10 p-5 shadow-sm">
                <h2 className="font-fraunces text-xl font-semibold text-navy mb-3">{child.name}</h2>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-navy/5 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-navy">{child.videoProgress.length}</div>
                    <div className="text-muted text-xs">Videos Done</div>
                  </div>
                  <div className="bg-gold/5 rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-navy">{child.streak?.currentDays ?? 0}</div>
                    <div className="text-muted text-xs">Day Streak</div>
                  </div>
                  <div className="bg-cream rounded-xl p-3 text-center">
                    <div className="text-2xl font-bold text-navy">{Math.round(avgScore * 10) / 10}</div>
                    <div className="text-muted text-xs">Avg Score</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
