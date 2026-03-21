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
      checklistItems: [
        { title: "Review the latest offer", completed: false },
        { title: "Send follow-up questions", completed: false },
        { title: "Book a call or decision slot", completed: false },
      ],
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
      checklistItems: [
        { title: "Check outstanding transport requests", completed: false },
        { title: "Confirm accommodation list", completed: false },
        { title: "Send final instructions to guests", completed: false },
      ],
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
      checklistItems: [
        { title: "Confirm ceremony timing", completed: false },
        { title: "Share latest schedule with vendors", completed: false },
        { title: "Verify speech and music cues", completed: false },
      ],
    },
  },
] satisfies Array<{
  id: string;
  label: string;
  values: Partial<
    Pick<
      TaskInput,
      | "title"
      | "description"
      | "priority"
      | "assignee"
      | "tags"
      | "checklistItems"
    >
  >;
}>;
