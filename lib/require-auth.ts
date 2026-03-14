import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { canAccessSection, type PlannerSection } from "@/lib/access-control";
import { authOptions } from "@/lib/auth";

export const getRequiredSession = async (section?: PlannerSection) => {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  if (section && !canAccessSection(session.user.role, section)) {
    throw new Error("Forbidden");
  }

  return session;
};

export const requirePageAccess = async (section: PlannerSection) => {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (!canAccessSection(session.user.role, section)) {
    redirect("/dashboard");
  }

  return session;
};
