import Link from "next/link";
import { BookOpen, Mic, PenLine, Brain, Star, CheckCircle } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-cream font-figtree">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-navy/10 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="font-fraunces text-2xl font-bold text-navy">
            English<span className="text-gold">Forge</span>
          </span>
          <div className="flex items-center gap-3">
            <Link href="/sign-in" className="text-sm text-navy hover:text-gold transition-colors">
              Sign In
            </Link>
            <Link href="/sign-up" className="bg-gold text-white text-sm px-4 py-2 rounded-lg hover:bg-gold/90 transition-colors">
              Enrol Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 py-16 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-gold/10 text-gold text-xs font-semibold px-3 py-1 rounded-full mb-6">
          <Star className="h-3 w-3" /> CBSE / ICSE Class 8, 9, 10
        </div>
        <h1 className="font-fraunces text-4xl md:text-6xl font-bold text-navy mb-4 leading-tight">
          40 Hours · 4 Skills ·<br />
          <span className="text-gold">1 Confident</span> English Speaker
        </h1>
        <p className="text-muted text-lg mb-8 max-w-xl mx-auto">
          Join Rohini Devan&apos;s English Mastery Program — 20 live-recorded sessions covering Grammar, Cursive, Writing, and Speaking. Resume any video from exactly where you left off.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/sign-up" className="bg-gold text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gold/90 transition-all shadow-lg shadow-gold/30">
            Start Free 7-Day Trial
          </Link>
          <Link href="/sign-in" className="border-2 border-navy text-navy px-8 py-4 rounded-xl text-lg font-semibold hover:bg-navy hover:text-cream transition-all">
            I&apos;m Already Enrolled
          </Link>
        </div>
        <p className="text-muted text-sm mt-4">No credit card required · 7 days free · Cancel anytime</p>
      </section>

      {/* 4 Skills */}
      <section className="px-4 py-12 bg-navy text-cream">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-fraunces text-3xl font-bold text-center mb-10">Four Skills, One Program</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Brain, skill: "Grammar", desc: "Parts of speech, tenses, voice, reported speech & more" },
              { icon: PenLine, skill: "Cursive", desc: "Pen grip to full-page speed drills in beautiful script" },
              { icon: BookOpen, skill: "Writing", desc: "Letters, essays, articles, reports — 14 formats mastered" },
              { icon: Mic, skill: "Speaking", desc: "From self-intros to debates — speak with confidence" },
            ].map(({ icon: Icon, skill, desc }) => (
              <div key={skill} className="text-center p-4">
                <div className="w-14 h-14 bg-gold/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Icon className="h-7 w-7 text-gold" />
                </div>
                <h3 className="font-fraunces text-lg font-semibold mb-2">{skill}</h3>
                <p className="text-cream/70 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-16 max-w-3xl mx-auto">
        <h2 className="font-fraunces text-3xl font-bold text-navy text-center mb-10">How It Works</h2>
        <div className="space-y-6">
          {[
            { step: "1", title: "Watch the Session Video", desc: "New video drops every weekday. You get a WhatsApp notification. Resume from exactly where you left off — even on a different device." },
            { step: "2", title: "Complete Your Homework", desc: "Write an essay, upload a cursive photo, or record your voice. The homework unlocks after 95% of the video is watched." },
            { step: "3", title: "Take the 5-Min Quiz", desc: "5 grammar questions with instant answers and explanations. Up to 3 attempts." },
            { step: "4", title: "Get Graded by Rohini", desc: "Your teacher grades every submission with personalised feedback and a rubric score." },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-gold rounded-full flex items-center justify-center text-white font-bold">
                {step}
              </div>
              <div>
                <h3 className="font-semibold text-navy text-lg">{title}</h3>
                <p className="text-muted text-sm mt-1">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="px-4 py-16 bg-navy/5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-fraunces text-3xl font-bold text-navy mb-10">Simple Pricing</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 border-2 border-navy/10 shadow-sm">
              <h3 className="font-fraunces text-xl font-semibold text-navy mb-2">Monthly</h3>
              <div className="text-4xl font-bold text-navy mb-1">₹1,000<span className="text-lg text-muted font-normal">/month</span></div>
              <p className="text-muted text-sm mb-4">Billed monthly · 7-day free trial</p>
              <ul className="space-y-2 text-sm text-navy mb-6">
                {["All 20 sessions", "Video resume feature", "Homework & grading", "Grammar quizzes", "Progress tracking"].map(f => (
                  <li key={f} className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-gold" />{f}</li>
                ))}
              </ul>
              <Link href="/sign-up" className="block w-full bg-navy text-cream py-3 rounded-xl text-center hover:bg-navy/90 transition-colors">Start Free Trial</Link>
            </div>
            <div className="bg-navy rounded-2xl p-6 border-2 border-gold shadow-lg relative overflow-hidden">
              <div className="absolute top-3 right-3 bg-gold text-white text-xs font-bold px-2 py-1 rounded-full">BEST VALUE</div>
              <h3 className="font-fraunces text-xl font-semibold text-cream mb-2">Full Program</h3>
              <div className="text-4xl font-bold text-cream mb-1">₹1,800<span className="text-lg text-cream/60 font-normal"> once</span></div>
              <p className="text-cream/60 text-sm mb-4">2 months · Save ₹200</p>
              <ul className="space-y-2 text-sm text-cream mb-6">
                {["Everything in Monthly", "Locked-in price", "Certificate on completion", "Priority grading", "Parent progress reports"].map(f => (
                  <li key={f} className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-gold" />{f}</li>
                ))}
              </ul>
              <Link href="/sign-up" className="block w-full bg-gold text-white py-3 rounded-xl text-center hover:bg-gold/90 transition-colors font-semibold">Enrol Now</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy text-cream px-4 py-10 text-center">
        <p className="font-fraunces text-xl font-bold mb-2">English<span className="text-gold">Forge</span></p>
        <p className="text-cream/60 text-sm">40 Hours · 4 Skills · 1 Confident English Speaker</p>
        <p className="text-cream/40 text-xs mt-4">© 2026 IntelliForge · Instructor: Rohini Devan (+91 96200 10983)</p>
      </footer>
    </div>
  );
}
