"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to send OTP"); return; }
      setStep("otp");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: otp }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Invalid OTP"); return; }
      router.push(data.redirectTo ?? "/today");
      router.refresh();
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
        <p className="text-muted text-sm mt-1">Sign in with your phone number</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
        {searchParams.get("error") === "access_denied" && (
          <div className="bg-red/10 text-red text-sm p-3 rounded-lg mb-4">Your account has been suspended. Contact support.</div>
        )}

        {step === "phone" ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
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
            </div>
            {error && <p className="text-red text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading || phone.replace(/\D/g, "").length < 10}
              className="w-full bg-gold text-white py-3 rounded-xl font-semibold hover:bg-gold/90 disabled:opacity-60 transition-colors"
            >
              {loading ? "Sending OTP…" : "Send OTP →"}
            </button>
            <p className="text-center text-sm text-muted">
              New student?{" "}
              <Link href="/sign-up" className="text-gold font-semibold">Sign up here</Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="text-center mb-2">
              <p className="text-navy font-medium">Enter the 4-digit OTP</p>
              <p className="text-muted text-sm mt-1">Sent to +91 {phone.replace(/\D/g, "").slice(-10)}</p>
            </div>
            <input
              type="text"
              inputMode="numeric"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="0000"
              maxLength={4}
              required
              className="w-full border-2 border-navy/20 rounded-xl px-4 py-4 text-navy text-center text-3xl tracking-[1em] focus:border-gold focus:outline-none"
            />
            {error && <p className="text-red text-sm text-center">{error}</p>}
            <button
              type="submit"
              disabled={loading || otp.length < 4}
              className="w-full bg-gold text-white py-3 rounded-xl font-semibold hover:bg-gold/90 disabled:opacity-60 transition-colors"
            >
              {loading ? "Verifying…" : "Verify & Sign In"}
            </button>
            <button
              type="button"
              onClick={() => { setStep("phone"); setOtp(""); setError(""); }}
              className="w-full text-muted text-sm underline"
            >
              Change phone number
            </button>
          </form>
        )}
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
