import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Clock, Phone } from "lucide-react";

export default async function PendingApprovalPage() {
  const user = await getSession();
  if (!user) redirect("/sign-in");
  if (user.approvalStatus === "APPROVED") redirect("/today");

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm text-center">
        <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="h-8 w-8 text-gold" />
        </div>
        <h2 className="font-fraunces text-2xl font-bold text-navy mb-2">Approval Pending</h2>
        <p className="text-muted mb-4">
          Hi <strong className="text-navy">{user.name}</strong>! Your account is being reviewed by Rohini.
          You&apos;ll receive a WhatsApp message once you&apos;re approved.
        </p>
        <div className="bg-navy/5 rounded-xl p-4 mb-6 text-left">
          <p className="text-xs font-semibold text-muted mb-1">Registered phone</p>
          <p className="text-navy font-medium">{user.phone}</p>
        </div>
        <div className="flex items-center gap-2 justify-center text-sm text-muted mb-4">
          <Phone className="h-4 w-4" />
          <span>Contact Rohini: +91 96200 10983</span>
        </div>
        <form action="/api/auth/signout" method="POST">
          <button type="submit" className="text-muted text-sm underline">Sign out</button>
        </form>
      </div>
    </div>
  );
}
