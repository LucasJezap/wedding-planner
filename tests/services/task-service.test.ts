import {
  createTask,
  deleteTask,
  listTasks,
  updateTask,
} from "@/services/task-service";

describe("task-service", () => {
  it("creates, updates, and deletes a task", async () => {
    const created = await createTask({
      title: "Finalize candles",
      description: "Approve the taper palette for reception tables.",
      dueDate: "2026-04-01T12:00:00.000Z",
      priority: "MEDIUM",
      status: "TODO",
      assignee: "COUPLE",
      tags: ["decor"],
      blockedByTaskIds: [],
      notes: "Need a warm ivory tone",
      checklistItems: [
        {
          title: "Approve candle holders",
          completed: true,
        },
        {
          title: "Confirm taper palette",
          completed: false,
        },
      ],
    });

    expect(created.title).toBe("Finalize candles");
    expect(created.checklistItems).toHaveLength(2);
    expect(created.checklistItems[0]?.title).toBe("Approve candle holders");
    expect(created.checklistItems[0]?.completed).toBe(true);

    const updated = await updateTask(created.id, {
      status: "DONE",
      checklistItems: [
        {
          title: "Approve candle holders",
          completed: true,
        },
        {
          title: "Confirm taper palette",
          completed: true,
        },
      ],
    });
    expect(updated.status).toBe("DONE");
    expect(updated.checklistItems.every((item) => item.completed)).toBe(true);

    await deleteTask(created.id);
    await expect(listTasks()).resolves.toHaveLength(3);
  });

  it("throws when updating a missing task", async () => {
    await expect(updateTask("missing", { title: "Ghost" })).rejects.toThrow(
      "Task not found",
    );
  });

  it("filters witness tasks and forces witness assignment on create", async () => {
    const witnessTasks = await listTasks({ viewerRole: "WITNESS" });
    expect(witnessTasks.every((task) => task.assignee === "WITNESSES")).toBe(
      true,
    );
    const readOnlyTasks = await listTasks({ viewerRole: "READ_ONLY" });
    expect(readOnlyTasks.every((task) => task.assignee === "WITNESSES")).toBe(
      true,
    );
    expect(
      (await listTasks({ assignee: "BRIDE" })).every(
        (task) => task.assignee === "BRIDE",
      ),
    ).toBe(true);

    const created = await createTask(
      {
        title: "Witness-only reminder",
        description: "Review accommodation",
        dueDate: "2026-05-01T12:00:00.000Z",
        priority: "HIGH",
        status: "TODO",
        assignee: "GROOM",
        tags: [],
        blockedByTaskIds: [],
        notes: "Should be normalized",
        checklistItems: [],
      },
      { viewerRole: "WITNESS" },
    );

    expect(created.assignee).toBe("WITNESSES");
  });

  it("returns non-witness tasks when filtering by assignee", async () => {
    const groomTasks = await listTasks({ assignee: "COUPLE" });
    expect(groomTasks.length).toBeGreaterThan(0);
    expect(groomTasks.some((task) => task.assignee !== "COUPLE")).toBe(false);
  });

  it("uses priority as the final sort key when status and due date match", async () => {
    await createTask({
      title: "Medium task",
      description: "Sort test",
      dueDate: "2026-07-01T12:00:00.000Z",
      priority: "MEDIUM",
      status: "TODO",
      assignee: "COUPLE",
      tags: [],
      blockedByTaskIds: [],
      notes: "",
      checklistItems: [],
    });
    await createTask({
      title: "High task",
      description: "Sort test",
      dueDate: "2026-07-01T12:00:00.000Z",
      priority: "HIGH",
      status: "TODO",
      assignee: "COUPLE",
      tags: [],
      blockedByTaskIds: [],
      notes: "",
      checklistItems: [],
    });

    const matchingTasks = (await listTasks()).filter((task) =>
      ["Medium task", "High task"].includes(task.title),
    );
    expect(matchingTasks.map((task) => task.title)).toEqual([
      "High task",
      "Medium task",
    ]);
  });

  it("returns seed checklist items with their task", async () => {
    const tasks = await listTasks();
    const taskWithChecklist = tasks.find((task) => task.id === "task-1");
    const blockedTask = tasks.find((task) => task.id === "task-3");

    expect(taskWithChecklist?.checklistItems).toHaveLength(2);
    expect(taskWithChecklist?.checklistItems[0]?.title).toBe(
      "Send dietary restrictions to the venue",
    );
    expect(blockedTask?.blockedByTaskTitles).toContain(
      "Confirm final menu tasting",
    );
  });
});
