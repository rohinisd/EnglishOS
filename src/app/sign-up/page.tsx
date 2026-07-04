"use client";
import { useState } from "react";
import Link from "next/link";

export default function SignUpPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const raw = await res.text();
      let data: { error?: string } | null = null;
      if (raw) {
        try {
          data = JSON.parse(raw) as { error?: string };
        } catch {
          data = null;
        }
      }

      if (!res.ok) {
        setError(data?.error ?? `Sign-up failed (HTTP ${res.status})`);
        return;
      }
      setDone(true);
    } catch {
      setError("Could not register right now. Please check internet and try again.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="font-fraunces text-2xl font-bold text-navy mb-2">You&apos;re registered!</h2>
          <p className="text-muted mb-6">Your account is ready. Sign in with your phone number to start learning.</p>
          <Link href="/sign-in" className="block bg-navy text-cream py-3 rounded-xl font-semibold text-center hover:bg-navy/90 transition-colors">
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 py-8">
      <div className="mb-6 text-center">
        <span className="font-fraunces text-3xl font-bold text-navy">
          English<span className="text-gold">Forge</span>
        </span>
        <p className="text-muted text-sm mt-1">Create your account</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-navy text-sm font-semibold mb-1.5">Full Name *</label>
              <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Aarav Sharma" className="w-full border-2 border-navy/20 rounded-xl px-4 py-3 text-navy focus:border-gold focus:outline-none" />
            </div>
            <div>
              <label className="block text-navy text-sm font-semibold mb-1.5">Phone Number *</label>
              <div className="flex gap-2">
                <span className="flex items-center px-3 bg-navy/5 border-2 border-navy/20 rounded-xl text-navy text-sm font-medium">+91</span>
                <input type="tel" required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="9876543210" maxLength={10}
                  className="flex-1 border-2 border-navy/20 rounded-xl px-4 py-3 text-navy focus:border-gold focus:outline-none" />
              </div>
            </div>
          </div>

          {error && <p className="text-red text-sm">{error}</p>}

          <button type="submit" disabled={loading || !form.name || !form.phone}
            className="w-full bg-gold text-white py-3 rounded-xl font-semibold hover:bg-gold/90 disabled:opacity-60 transition-colors mt-2">
            {loading ? "Creating account…" : "Register →"}
          </button>

          <p className="text-center text-sm text-muted">
            Already registered?{" "}
            <Link href="/sign-in" className="text-gold font-semibold">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
