import { requireApproved } from "@/lib/auth";
import { db } from "@/lib/db";
import { MessageCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function DoubtsPage() {
  const user = await requireApproved();

  const doubts = await db.doubt.findMany({
    where: { userId: user.id },
    include: {
      replies: { include: { user: { select: { name: true, role: true } } } },
      session: { select: { sequence: true, title: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="font-fraunces text-3xl font-bold text-navy mb-6">My Doubts</h1>

      <div className="space-y-4">
        {doubts.map(doubt => (
          <div key={doubt.id} className="bg-white rounded-xl border border-navy/10 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-navy">{doubt.title}</h3>
              {doubt.answered && (
                <span className="flex-shrink-0 text-xs bg-gold/10 text-gold px-2 py-0.5 rounded-full font-semibold">Answered</span>
              )}
            </div>
            <p className="text-muted text-sm">{doubt.body}</p>
            {doubt.session && (
              <p className="text-xs text-muted/60 mt-1">Session {doubt.session.sequence}: {doubt.session.title}</p>
            )}
            {doubt.replies.length > 0 && (
              <div className="mt-3 space-y-2 border-t border-navy/5 pt-3">
                {doubt.replies.map(reply => (
                  <div key={reply.id} className={`text-sm rounded-lg p-2 ${reply.byTeacher ? "bg-gold/5 text-navy" : "bg-navy/5 text-navy"}`}>
                    <span className={`text-xs font-semibold ${reply.byTeacher ? "text-gold" : "text-muted"}`}>
                      {reply.user.name} {reply.byTeacher ? "· Teacher" : ""}
                    </span>
                    <p className="mt-0.5">{reply.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {doubts.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-navy/10">
            <MessageCircle className="h-10 w-10 text-muted/40 mx-auto mb-3" />
            <p className="font-semibold text-navy">No doubts yet</p>
            <p className="text-muted text-sm mt-1">Ask questions from any session page</p>
          </div>
        )}
      </div>
    </div>
  );
}
