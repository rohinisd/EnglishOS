"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Mic, PenLine, Brain, Star, CheckCircle } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePhoneLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/phone-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const raw = await res.text();
      let data: { error?: string; redirectTo?: string } | null = null;

      try {
        data = raw ? (JSON.parse(raw) as { error?: string; redirectTo?: string }) : null;
      } catch {
        data = null;
      }

      if (!res.ok) {
        setError(data?.error ?? "Could not sign in with this phone number.");
        return;
      }

      router.push(data?.redirectTo ?? "/today");
      router.refresh();
    } catch {
      setError("Could not sign in right now. Please check internet and try again.");
    } finally {
      setLoading(false);
    }
  }

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
              Join Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 py-12 md:py-16 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-10 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-gold/10 text-gold text-xs font-semibold px-3 py-1 rounded-full mb-6">
              <Star className="h-3 w-3" /> From Instagram & YouTube to real English practice
            </div>
            <h1 className="font-fraunces text-4xl md:text-6xl font-bold text-navy mb-4 leading-tight">
              Watch a reel.<br />
              <span className="text-gold">Continue learning</span> here.
            </h1>
            <p className="text-muted text-lg mb-8 max-w-xl mx-auto lg:mx-0">
              Join Rohini Devan&apos;s English Mastery Program for Class 8, 9, and 10 students. Learn Grammar, Cursive, Writing, and Speaking with structured videos, homework, quizzes, and teacher feedback.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link href="/sign-up" className="bg-gold text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gold/90 transition-all shadow-lg shadow-gold/30">
                New Student? Join Free
              </Link>
              <Link href="/sign-in" className="border-2 border-navy text-navy px-8 py-4 rounded-xl text-lg font-semibold hover:bg-navy hover:text-cream transition-all">
                Sign In Page
              </Link>
            </div>
            <p className="text-muted text-sm mt-4">Use this website link in your Instagram bio, YouTube descriptions, and reel captions.</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-navy/10 p-6 md:p-8">
            <p className="text-gold text-sm font-semibold mb-2">Already registered?</p>
            <h2 className="font-fraunces text-3xl font-bold text-navy mb-2">Login with phone number</h2>
            <p className="text-muted text-sm mb-6">
              Enter the same number used during registration. Approved students go straight to their lessons.
            </p>

            <form onSubmit={handlePhoneLogin} className="space-y-4">
              <div>
                <label className="block text-navy text-sm font-semibold mb-2">Phone Number</label>
                <div className="flex gap-2">
                  <span className="flex items-center px-3 bg-navy/5 border-2 border-navy/20 rounded-xl text-navy text-sm font-medium">+91</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="9876543210"
                    maxLength={10}
                    required
                    className="flex-1 min-w-0 border-2 border-navy/20 rounded-xl px-4 py-3 text-navy focus:border-gold focus:outline-none text-lg tracking-widest"
                  />
                </div>
              </div>

              {error && <p className="text-red text-sm">{error}</p>}

              <button
                type="submit"
                disabled={loading || phone.replace(/\D/g, "").length < 10}
                className="w-full bg-navy text-cream py-3 rounded-xl font-semibold hover:bg-navy/90 disabled:opacity-60 transition-colors"
              >
                {loading ? "Signing in…" : "Continue to Lessons"}
              </button>

              <p className="text-center text-sm text-muted">
                Not registered yet?{" "}
                <Link href="/sign-up" className="text-gold font-semibold">Create your account</Link>
              </p>
            </form>
          </div>
        </div>
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
