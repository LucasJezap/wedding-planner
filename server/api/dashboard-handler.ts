import type { UserRole } from "@/lib/planner-domain";
import { getDashboardData } from "@/services/dashboard-service";

export const getDashboardHandler = async (viewerRole?: UserRole) =>
  getDashboardData({ viewerRole });
