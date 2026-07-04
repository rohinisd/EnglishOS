import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function PendingApprovalPage() {
  const user = await getSession();
  if (!user) redirect("/sign-in");
  redirect(user.role === "STUDENT" ? "/today" : "/teacher/dashboard");
}
