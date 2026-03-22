import type { TaskInput } from "@/features/tasks/types/task";

export const TASK_TEMPLATES = [
  {
    id: "vendor-follow-up",
    label: "Vendor follow-up",
    values: {
      title: "Follow up with shortlisted vendor",
      description:
        "Confirm availability, compare the latest offer, and decide on next steps.",
      priority: "HIGH",
      assignee: "COUPLE",
      tags: ["vendor", "follow-up"],
    },
  },
  {
    id: "guest-logistics",
    label: "Guest logistics",
    values: {
      title: "Confirm guest logistics",
      description:
        "Close transport, accommodation, and special guest requirements before the deadline.",
      priority: "MEDIUM",
      assignee: "WITNESSES",
      tags: ["guests", "logistics"],
    },
  },
  {
    id: "timeline-readiness",
    label: "Timeline readiness",
    values: {
      title: "Lock timeline readiness",
      description:
        "Validate all hand-offs around the wedding-day schedule and final timings.",
      priority: "HIGH",
      assignee: "BRIDE",
      tags: ["timeline", "day-of"],
    },
  },
] satisfies Array<{
  id: string;
  label: string;
  values: Partial<
    Pick<TaskInput, "title" | "description" | "priority" | "assignee" | "tags">
  >;
}>;
