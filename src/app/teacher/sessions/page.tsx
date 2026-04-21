import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { CheckCircle, Video, Clock, Edit } from "lucide-react";

export default async function TeacherSessionsPage() {
  await requireRole(["TEACHER", "ADMIN"]);

  const sessions = await db.session.findMany({
    where: { course: { slug: "english-mastery" } },
    include: {
      lessons: { include: { video: true } },
      assignments: { select: { id: true, type: true } },
      quizzes: { select: { id: true } },
      _count: { select: { doubts: true } },
    },
    orderBy: { sequence: "asc" },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="font-fraunces text-3xl font-bold text-navy mb-6">Sessions</h1>

      <div className="space-y-3">
        {sessions.map(session => {
          const videoLesson = session.lessons.find(l => l.type === "VIDEO");
          const video = videoLesson?.video;
          const isPublished = !!session.publishedAt;
          const isVideoReady = video?.muxStatus === "ready";

          return (
            <div key={session.id} className="bg-white rounded-xl border border-navy/10 overflow-hidden shadow-sm">
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted">Session {session.sequence}</span>
                      {isPublished && <span className="text-xs bg-gold/10 text-gold px-2 py-0.5 rounded-full font-semibold">Published</span>}
                      {!isPublished && <span className="text-xs bg-navy/10 text-muted px-2 py-0.5 rounded-full">Draft</span>}
                    </div>
                    <h3 className="font-semibold text-navy">{session.title}</h3>
                    <p className="text-muted text-xs mt-1">{session.grammarFocus}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className={`flex items-center gap-1 text-xs ${isVideoReady ? "text-gold" : video?.muxStatus === "uploading" ? "text-navy" : "text-red-400"}`}>
                        <Video className="h-3.5 w-3.5" />
                        {isVideoReady ? "Video ready" : video?.muxStatus === "uploading" ? "Processing…" : "No video"}
                      </div>
                      <span className="text-muted text-xs">{session.assignments.length} assignments</span>
                      <span className="text-muted text-xs">{session._count.doubts} doubts</span>
                    </div>
                  </div>
                  <Link
                    href={`/teacher/sessions/${session.id}/edit`}
                    className="flex items-center gap-1.5 bg-navy/5 text-navy px-3 py-2 rounded-lg text-sm hover:bg-navy/10 transition-colors flex-shrink-0"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
