import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { VideoUploaderClient } from "@/components/admin/video-uploader.client";
import { ReadingContentEditorClient } from "@/components/admin/reading-content-editor.client";
import { PublishSessionForm } from "@/components/admin/publish-session-form.client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditSessionPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["TEACHER", "ADMIN"]);
  const { id } = await params;

  const session = await db.session.findUnique({
    where: { id },
    include: {
      lessons: { include: { video: true }, orderBy: { order: "asc" } },
      assignments: { orderBy: { createdAt: "asc" } },
      quizzes: { include: { questions: true } },
    },
  });

  if (!session) notFound();

  const videoLesson = session.lessons.find(l => l.type === "VIDEO");
  const readingLesson = session.lessons.find(l => l.type === "READING");
  const video = videoLesson?.video ?? null;
  const isVideoReady = !!video?.youtubeVideoId;
  const hasTopicText = !!readingLesson?.description?.trim();
  const contentReady = isVideoReady || hasTopicText;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/teacher/sessions" className="text-muted hover:text-navy transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <p className="text-muted text-xs">Session {session.sequence}</p>
          <h1 className="font-fraunces text-2xl font-bold text-navy">{session.title}</h1>
        </div>
      </div>

      {/* Session info */}
      <div className="bg-white rounded-xl border border-navy/10 p-5 space-y-2 shadow-sm">
        <h2 className="font-semibold text-navy mb-3">Session Details</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {session.grammarFocus && (
            <div>
              <span className="text-muted text-xs">Grammar Focus</span>
              <p className="text-navy font-medium">{session.grammarFocus}</p>
            </div>
          )}
          {session.writingFormat && (
            <div>
              <span className="text-muted text-xs">Writing</span>
              <p className="text-navy font-medium">{session.writingFormat}</p>
            </div>
          )}
          {session.cursiveDrill && (
            <div>
              <span className="text-muted text-xs">Cursive</span>
              <p className="text-navy font-medium">{session.cursiveDrill}</p>
            </div>
          )}
          {session.speakingActivity && (
            <div>
              <span className="text-muted text-xs">Speaking</span>
              <p className="text-navy font-medium">{session.speakingActivity}</p>
            </div>
          )}
        </div>
        <div className="flex gap-2 pt-2">
          {session.assignments.length > 0 && (
            <span className="text-xs bg-navy/5 text-navy px-2 py-1 rounded-full">
              {session.assignments.length} assignment{session.assignments.length > 1 ? "s" : ""}
            </span>
          )}
          {session.quizzes.length > 0 && (
            <span className="text-xs bg-navy/5 text-navy px-2 py-1 rounded-full">
              {session.quizzes[0].questions.length} quiz questions
            </span>
          )}
        </div>
      </div>

      {/* Video uploader */}
      <div className="bg-white rounded-xl border border-navy/10 p-5 shadow-sm">
        {videoLesson ? (
          <VideoUploaderClient
            lessonId={videoLesson.id}
            currentYoutubeVideoId={video?.youtubeVideoId}
          />
        ) : (
          <p className="text-muted text-sm">No video lesson slot found for this session.</p>
        )}
      </div>

      {/* Topic text editor */}
      <div className="bg-white rounded-xl border border-navy/10 p-5 shadow-sm">
        <ReadingContentEditorClient
          sessionId={session.id}
          currentTitle={readingLesson?.title}
          currentContent={readingLesson?.description}
        />
      </div>

      {/* Publish */}
      <div className="bg-white rounded-xl border border-navy/10 p-5 shadow-sm">
        <h2 className="font-semibold text-navy mb-4">Publish Session</h2>
        {!contentReady && (
          <p className="text-muted text-sm mb-4">⚠️ Add a YouTube video or topic text above before publishing.</p>
        )}
        <PublishSessionForm
          sessionId={session.id}
          isPublished={!!session.publishedAt}
          contentReady={contentReady}
        />
      </div>
    </div>
  );
}
