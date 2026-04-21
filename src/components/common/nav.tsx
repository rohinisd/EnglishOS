"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Home, Trophy, MessageCircle, Settings, LogOut } from "lucide-react";

function SignOutButton() {
  const router = useRouter();
  async function signOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/sign-in");
    router.refresh();
  }
  return (
    <button type="button" onClick={signOut} className="flex items-center gap-2 text-muted hover:text-navy transition-colors px-2 py-2 rounded-lg hover:bg-cream">
      <LogOut className="h-4 w-4" />
      <span className="text-xs md:text-sm hidden md:inline">Sign Out</span>
    </button>
  );
}

export function StudentNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-navy/10 bg-white/95 backdrop-blur-sm md:relative md:border-t-0 md:border-r md:bg-white md:h-screen md:w-64">
      <div className="flex items-center justify-around px-4 py-2 md:flex-col md:items-start md:gap-2 md:px-4 md:py-6">
        <div className="hidden md:flex items-center gap-2 mb-8 px-2">
          <span className="font-fraunces text-xl font-bold text-navy">English<span className="text-gold">Forge</span></span>
        </div>
        {[
          { href: "/today", icon: Home, label: "Today" },
          { href: "/sessions", icon: BookOpen, label: "Sessions" },
          { href: "/progress", icon: Trophy, label: "Progress" },
          { href: "/doubts", icon: MessageCircle, label: "Doubts" },
        ].map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href} className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-muted hover:text-navy hover:bg-cream transition-colors md:flex-row md:gap-3 md:w-full">
            <Icon className="h-5 w-5" />
            <span className="text-xs md:text-sm">{label}</span>
          </Link>
        ))}
        <div className="md:mt-auto md:px-2">
          <SignOutButton />
        </div>
      </div>
    </nav>
  );
}

export function TeacherNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-navy/10 bg-white/95 backdrop-blur-sm md:relative md:border-t-0 md:border-r md:bg-white md:h-screen md:w-64">
      <div className="flex items-center justify-around px-4 py-2 md:flex-col md:items-start md:gap-2 md:px-4 md:py-6">
        <div className="hidden md:flex items-center gap-2 mb-8 px-2">
          <span className="font-fraunces text-xl font-bold text-navy">English<span className="text-gold">Forge</span> <span className="text-sm text-muted">Admin</span></span>
        </div>
        {[
          { href: "/teacher/dashboard", icon: Home, label: "Dashboard" },
          { href: "/teacher/sessions", icon: BookOpen, label: "Sessions" },
          { href: "/teacher/submissions", icon: Trophy, label: "Submissions" },
          { href: "/teacher/roster", icon: Settings, label: "Roster" },
        ].map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href} className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-muted hover:text-navy hover:bg-cream transition-colors md:flex-row md:gap-3 md:w-full">
            <Icon className="h-5 w-5" />
            <span className="text-xs md:text-sm">{label}</span>
          </Link>
        ))}
        <div className="md:mt-auto md:px-2">
          <SignOutButton />
        </div>
      </div>
    </nav>
  );
}
