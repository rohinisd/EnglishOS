"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
        setError(data?.error ?? `Sign in failed (HTTP ${res.status})`);
        return;
      }
      const target = data?.redirectTo ?? "/today";
      router.push(target);
      router.refresh();
    } catch (err) {
      console.error("phone-login failed", err);
      setError(err instanceof Error ? err.message : "Could not sign in. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <span className="font-fraunces text-3xl font-bold text-navy">
          English<span className="text-gold">Forge</span>
        </span>
        <p className="text-muted text-sm mt-1">Sign in with your approved phone number</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
        {searchParams.get("error") === "access_denied" && (
          <div className="bg-red/10 text-red text-sm p-3 rounded-lg mb-4">Your account has been suspended. Contact support.</div>
        )}

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
                className="flex-1 border-2 border-navy/20 rounded-xl px-4 py-3 text-navy focus:border-gold focus:outline-none text-lg tracking-widest"
              />
            </div>
            <p className="text-muted text-xs mt-2">
              Register first. After teacher approval, this number can sign in directly.
            </p>
          </div>
          {error && <p className="text-red text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading || phone.replace(/\D/g, "").length < 10}
            className="w-full bg-gold text-white py-3 rounded-xl font-semibold hover:bg-gold/90 disabled:opacity-60 transition-colors"
          >
            {loading ? "Signing in…" : "Sign In →"}
          </button>
          <p className="text-center text-sm text-muted">
            New student?{" "}
            <Link href="/sign-up" className="text-gold font-semibold">Sign up here</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream flex items-center justify-center text-navy">Loading…</div>}>
      <SignInForm />
    </Suspense>
  );
}
