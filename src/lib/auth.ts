import { cookies } from "next/headers";
import { db } from "./db";
import { redirect } from "next/navigation";
import type { Role, ApprovalStatus } from "@prisma/client";

export type SessionUser = {
  id: string;
  name: string;
  phone: string;
  role: Role;
  approvalStatus: ApprovalStatus;
  studentProfile: { grade: string; xp: number; level: number } | null;
};

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("ef_session")?.value;
  if (!token) return null;

  const session = await db.authSession.findUnique({
    where: { token },
    include: {
      user: {
        include: { studentProfile: true },
      },
    },
  });

  if (!session || session.expiresAt < new Date() || session.user.deletedAt) {
    return null;
  }

  const { user } = session;
  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    role: user.role,
    approvalStatus: user.approvalStatus,
    studentProfile: user.studentProfile
      ? { grade: user.studentProfile.grade, xp: user.studentProfile.xp, level: user.studentProfile.level }
      : null,
  };
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) redirect("/sign-in");
  return user;
}

export async function requireApproved(): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.approvalStatus === "PENDING") redirect("/pending-approval");
  if (user.approvalStatus === "REJECTED" || user.approvalStatus === "SUSPENDED") redirect("/sign-in?error=access_denied");
  return user;
}

export async function requireRole(roles: Role[]): Promise<SessionUser> {
  const user = await requireApproved();
  if (!roles.includes(user.role)) redirect("/today");
  return user;
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  return getSession();
}

// Normalise phone: strip spaces/dashes, ensure +91 prefix
export function normalisePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  if (raw.trim().startsWith("+")) return raw.replace(/[^+\d]/g, "");
  return `+${digits}`;
}
