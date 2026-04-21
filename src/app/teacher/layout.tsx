import { requireRole } from "@/lib/auth";
import { TeacherNav } from "@/components/common/nav";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["TEACHER", "ADMIN"]);
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <TeacherNav />
      <main className="flex-1 pb-20 md:pb-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
