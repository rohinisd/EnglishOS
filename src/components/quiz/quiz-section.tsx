"use client";
import { useState } from "react";
import type { Quiz, QuizQuestion, QuizAttempt } from "@prisma/client";
import { Lock, CheckCircle, XCircle, Trophy, Timer } from "lucide-react";

type QuizWithAll = Quiz & { questions: QuizQuestion[]; attempts: QuizAttempt[] };

type Props = {
  quizzes: QuizWithAll[];
  videoCompleted: boolean;
  userId: string;
};

export function QuizSection({ quizzes, videoCompleted }: Props) {
  const [activeQuiz, setActiveQuiz] = useState<QuizWithAll | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ score: number; maxScore: number; percentage: number; passed: boolean } | null>(null);
  const [startTime] = useState(Date.now());

  if (!videoCompleted) {
    return (
      <div className="bg-navy/5 rounded-xl p-6 text-center">
        <Lock className="h-8 w-8 text-muted mx-auto mb-3" />
        <p className="text-navy font-semibold">Quiz Locked</p>
        <p className="text-muted text-sm mt-1">Complete the video to unlock the quiz</p>
      </div>
    );
  }

  if (quizzes.length === 0) {
    return <p className="text-muted text-sm text-center py-8">No quiz for this session.</p>;
  }

  const quiz = quizzes[0];
  const attempts = quiz.attempts;
  const lastAttempt = attempts[attempts.length - 1];
  const canAttempt = attempts.length < quiz.maxAttempts;

  if (!activeQuiz && !submitted) {
    return (
      <div className="bg-white rounded-xl border border-navy/10 p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-fraunces text-lg font-semibold text-navy">{quiz.title}</h3>
            <p className="text-muted text-sm mt-1">{quiz.questions.length} questions · {quiz.durationSec / 60} minutes</p>
          </div>
          {lastAttempt && (
            <div className={`text-sm font-bold px-3 py-1 rounded-full ${lastAttempt.passed ? "bg-gold/10 text-gold" : "bg-red/10 text-red"}`}>
              {Math.round(lastAttempt.percentage)}%
            </div>
          )}
        </div>
        {attempts.length > 0 && (
          <div className="mb-4 space-y-2">
            {attempts.map((a, i) => (
              <div key={a.id} className="flex items-center gap-2 text-sm">
                {a.passed ? <CheckCircle className="h-4 w-4 text-gold" /> : <XCircle className="h-4 w-4 text-red-400" />}
                <span className="text-muted">Attempt {i + 1}: {a.score}/{a.maxScore} ({Math.round(a.percentage)}%)</span>
              </div>
            ))}
          </div>
        )}
        {canAttempt ? (
          <button
            onClick={() => setActiveQuiz(quiz)}
            className="w-full bg-gold text-white py-3 rounded-xl font-semibold hover:bg-gold/90 transition-colors"
          >
            {attempts.length === 0 ? "Start Quiz" : `Retry (${quiz.maxAttempts - attempts.length} attempts left)`}
          </button>
        ) : (
          <p className="text-center text-muted text-sm">Maximum attempts ({quiz.maxAttempts}) reached</p>
        )}
      </div>
    );
  }

  if (result) {
    return (
      <div className="bg-white rounded-xl border border-navy/10 p-6 text-center">
        <div className="text-5xl mb-3">{result.passed ? "🎉" : "📚"}</div>
        <h3 className="font-fraunces text-2xl font-bold text-navy mb-1">
          {result.score}/{result.maxScore}
        </h3>
        <p className="text-muted mb-4">{Math.round(result.percentage)}% · {result.passed ? "Passed!" : "Keep practising"}</p>
        <div className="h-2 bg-navy/10 rounded-full mb-6">
          <div className="h-2 bg-gold rounded-full transition-all" style={{ width: `${result.percentage}%` }} />
        </div>
        <button onClick={() => { setActiveQuiz(null); setSubmitted(false); setResult(null); setAnswers({}); setCurrentQ(0); }} className="text-gold text-sm underline">
          Back to quiz info
        </button>
      </div>
    );
  }

  if (!activeQuiz) return null;
  const question = activeQuiz.questions[currentQ];
  const options = question.options as string[];
  const isLast = currentQ === activeQuiz.questions.length - 1;

  async function handleNext() {
    if (isLast) {
      // Submit
      const answersArr = activeQuiz!.questions.map(q => {
        const userAnswer = answers[q.id] ?? "";
        const correct = userAnswer === (q.correct as string);
        return { questionId: q.id, answer: userAnswer, correct };
      });
      const durationSec = Math.floor((Date.now() - startTime) / 1000);
      const res = await fetch("/api/quiz-attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId: activeQuiz!.id, answers: answersArr, durationSec }),
      });
      const data = await res.json();
      setResult(data);
      setSubmitted(true);
    } else {
      setCurrentQ(c => c + 1);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-navy/10 overflow-hidden">
      <div className="bg-navy px-4 py-3 flex items-center justify-between">
        <span className="text-cream text-sm">Question {currentQ + 1}/{activeQuiz.questions.length}</span>
        <div className="flex items-center gap-1.5 text-cream/60 text-sm">
          <Timer className="h-4 w-4" />
          <span>{quiz.durationSec / quiz.questions.length}s per question</span>
        </div>
      </div>
      <div className="p-5">
        <p className="text-navy font-semibold mb-4">{question.prompt}</p>
        <div className="space-y-2">
          {options.map(opt => (
            <button
              key={opt}
              onClick={() => setAnswers(a => ({ ...a, [question.id]: opt }))}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm transition-all ${
                answers[question.id] === opt
                  ? "border-gold bg-gold/5 text-navy font-medium"
                  : "border-navy/10 text-navy hover:border-navy/30"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
        <button
          onClick={handleNext}
          disabled={!answers[question.id]}
          className="w-full mt-4 bg-navy text-cream py-3 rounded-xl font-semibold hover:bg-navy/90 disabled:opacity-50 transition-colors"
        >
          {isLast ? "Submit Quiz" : "Next →"}
        </button>
      </div>
    </div>
  );
}
