import { requireApproved } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { VideoSection } from "@/components/video/video-section";
import { HomeworkSection } from "@/components/submissions/homework-section";
import { QuizSection } from "@/components/quiz/quiz-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, PenLine, HelpCircle, MessageCircle } from "lucide-react";

export default async function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireApproved();

  const session = await db.session.findUnique({
    where: { id },
    include: {
      lessons: {
        include: {
          video: {
            include: { progress: { where: { userId: user.id } } },
          },
        },
      },
      assignments: { include: { rubric: true, submissions: { where: { userId: user.id } } } },
      quizzes: { include: { questions: true, attempts: { where: { userId: user.id } } } },
      doubts: { include: { replies: true }, orderBy: { upvotes: "desc" }, take: 10 },
    },
  });

  if (!session || !session.publishedAt) notFound();

  const videoLesson = session.lessons.find(l => l.type === "VIDEO");
  const videoProgress = videoLesson?.video?.progress[0];
  const videoCompleted = videoProgress?.completed ?? false;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="mb-4">
        <p className="text-muted text-sm">Session {session.sequence}</p>
        <h1 className="font-fraunces text-2xl font-bold text-navy">{session.title}</h1>
        {session.grammarFocus && <p className="text-muted text-sm mt-1">{session.grammarFocus}</p>}
      </div>

      {videoLesson?.video && (
        <VideoSection
          video={videoLesson.video}
          progress={videoProgress ?? null}
          userId={user.id}
          sessionId={session.id}
        />
      )}

      <Tabs defaultValue="homework" className="mt-6">
        <TabsList className="grid grid-cols-4 w-full bg-navy/5 rounded-xl p-1">
          <TabsTrigger value="homework" className="text-xs data-[state=active]:bg-white data-[state=active]:text-navy rounded-lg">
            <PenLine className="h-3.5 w-3.5 mr-1" /> Homework
          </TabsTrigger>
          <TabsTrigger value="quiz" className="text-xs data-[state=active]:bg-white data-[state=active]:text-navy rounded-lg">
            <HelpCircle className="h-3.5 w-3.5 mr-1" /> Quiz
          </TabsTrigger>
          <TabsTrigger value="about" className="text-xs data-[state=active]:bg-white data-[state=active]:text-navy rounded-lg">
            <BookOpen className="h-3.5 w-3.5 mr-1" /> About
          </TabsTrigger>
          <TabsTrigger value="doubts" className="text-xs data-[state=active]:bg-white data-[state=active]:text-navy rounded-lg">
            <MessageCircle className="h-3.5 w-3.5 mr-1" /> Doubts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="homework" className="mt-4">
          <HomeworkSection
            assignments={session.assignments}
            videoCompleted={videoCompleted}
            userId={user.id}
            sessionId={session.id}
          />
        </TabsContent>

        <TabsContent value="quiz" className="mt-4">
          <QuizSection
            quizzes={session.quizzes}
            videoCompleted={videoCompleted}
            userId={user.id}
          />
        </TabsContent>

        <TabsContent value="about" className="mt-4">
          <div className="bg-white rounded-xl p-5 border border-navy/10 space-y-4">
            {session.grammarFocus && (
              <div>
                <h3 className="font-semibold text-navy text-sm mb-1">Grammar Focus</h3>
                <p className="text-muted text-sm">{session.grammarFocus}</p>
              </div>
            )}
            {session.cursiveDrill && (
              <div>
                <h3 className="font-semibold text-navy text-sm mb-1">Cursive Drill</h3>
                <p className="text-muted text-sm">{session.cursiveDrill}</p>
              </div>
            )}
            {session.speakingActivity && (
              <div>
                <h3 className="font-semibold text-navy text-sm mb-1">Speaking Activity</h3>
                <p className="text-muted text-sm">{session.speakingActivity}</p>
              </div>
            )}
            {session.writingFormat && (
              <div>
                <h3 className="font-semibold text-navy text-sm mb-1">Writing Format</h3>
                <p className="text-muted text-sm">{session.writingFormat}</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="doubts" className="mt-4">
          <div className="bg-white rounded-xl p-5 border border-navy/10">
            <p className="text-muted text-sm text-center">
              Post your doubts and get answers from Rohini.
            </p>
            <div className="mt-4 space-y-3">
              {session.doubts.map(doubt => (
                <div key={doubt.id} className="border border-navy/10 rounded-lg p-3">
                  <p className="text-navy font-medium text-sm">{doubt.title}</p>
                  <p className="text-muted text-xs mt-1">{doubt.replies.length} replies</p>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
