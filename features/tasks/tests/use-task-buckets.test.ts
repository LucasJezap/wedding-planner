import { renderHook } from "@testing-library/react";

import { useTaskBuckets } from "@/features/tasks/hooks/use-task-buckets";
import { createPlannerSeed } from "@/lib/planner-seed";

describe("useTaskBuckets", () => {
  it("counts task statuses", () => {
    const seed = createPlannerSeed();
    const tasks = seed.tasks.map((task) => ({
      ...task,
      notes: "",
      checklistItems: seed.taskChecklistItems.filter(
        (item) => item.taskId === task.id,
      ),
      blockedByTaskTitles: [],
    }));
    const { result } = renderHook(() => useTaskBuckets(tasks));
    expect(result.current.todo).toBe(1);
    expect(result.current.inProgress).toBe(1);
    expect(result.current.done).toBe(1);
  });
});
