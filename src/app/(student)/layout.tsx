import { requireApproved } from "@/lib/auth";
import { StudentNav } from "@/components/common/nav";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  await requireApproved();
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <StudentNav />
      <main className="flex-1 pb-20 md:pb-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
