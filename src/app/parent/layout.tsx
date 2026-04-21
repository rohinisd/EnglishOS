import { requireRole } from "@/lib/auth";

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["PARENT", "ADMIN"]);
  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-navy text-cream px-4 py-3">
        <span className="font-fraunces text-xl font-bold">English<span className="text-gold">Forge</span> <span className="text-sm opacity-60">Parent View</span></span>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
