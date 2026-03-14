import { renderHook } from "@testing-library/react";

import { useTimelineAgenda } from "@/features/timeline/hooks/use-timeline-agenda";
import { createPlannerSeed } from "@/lib/planner-seed";

describe("useTimelineAgenda", () => {
  it("sorts events by start time", () => {
    const events = [...createPlannerSeed().timelineEvents].reverse();
    const { result } = renderHook(() => useTimelineAgenda(events));
    expect(result.current[0]?.id).toBe("timeline-1");
  });
});
