import type { UserRole } from "@/lib/planner-domain";

export type PlannerSection =
  | "dashboard"
  | "access"
  | "guests"
  | "vendors"
  | "tasks"
  | "budget"
  | "timeline"
  | "seating"
  | "import"
  | "public";

const restrictedForWitness = new Set<PlannerSection>(["budget", "import"]);
const restrictedForReadOnly = new Set<PlannerSection>([
  "budget",
  "import",
  "tasks",
]);
const rolesLimitedToWitnessTasks = new Set<UserRole>(["WITNESS", "READ_ONLY"]);

export const canAccessSection = (
  role: UserRole,
  section: PlannerSection,
): boolean => {
  if (section === "access") {
    return role === "ADMIN";
  }
  if (role === "ADMIN") {
    return true;
  }
  if (role === "WITNESS") {
    return !restrictedForWitness.has(section);
  }
  return !restrictedForReadOnly.has(section);
};

export const canViewVendorPricing = (role: UserRole): boolean =>
  role === "ADMIN";

export const canManageAccess = (role: UserRole): boolean => role === "ADMIN";

export const canEditGuests = (role: UserRole): boolean => role === "ADMIN";
export const canEditVendors = (role: UserRole): boolean => role === "ADMIN";
export const canEditTimeline = (role: UserRole): boolean => role === "ADMIN";
export const canEditSeating = (role: UserRole): boolean => role === "ADMIN";
export const canCreateTasks = (role: UserRole): boolean => role !== "READ_ONLY";
export const canEditTasks = (role: UserRole): boolean => role === "ADMIN";
export const canViewDashboardTasks = (role: UserRole): boolean =>
  role !== "READ_ONLY";
export const isWitnessScopedTaskViewer = (role?: UserRole): boolean =>
  role ? rolesLimitedToWitnessTasks.has(role) : false;
