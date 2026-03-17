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
      notes: "Need a warm ivory tone",
    });

    expect(created.title).toBe("Finalize candles");

    const updated = await updateTask(created.id, { status: "DONE" });
    expect(updated.status).toBe("DONE");

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
        notes: "Should be normalized",
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
      notes: "",
    });
    await createTask({
      title: "High task",
      description: "Sort test",
      dueDate: "2026-07-01T12:00:00.000Z",
      priority: "HIGH",
      status: "TODO",
      assignee: "COUPLE",
      notes: "",
    });

    const matchingTasks = (await listTasks()).filter((task) =>
      ["Medium task", "High task"].includes(task.title),
    );
    expect(matchingTasks.map((task) => task.title)).toEqual([
      "High task",
      "Medium task",
    ]);
  });
});
