import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { TaskManager } from "@/features/tasks/components/task-manager";
import { apiClient } from "@/lib/api-client";
import { listTasks } from "@/services/task-service";

vi.mock("@/lib/api-client", () => ({
  apiClient: vi.fn(),
}));

describe("TaskManager", () => {
  it("creates a task", async () => {
    const tasks = await listTasks();
    vi.mocked(apiClient).mockResolvedValueOnce({
      ...tasks[0]!,
      id: "task-new",
      title: "Confirm cake tasting",
      checklistItems: [
        {
          id: "task-checklist-new",
          weddingId: tasks[0]!.weddingId,
          taskId: "task-new",
          title: "Confirm guest count with pastry chef",
          completed: false,
          sortOrder: 0,
          createdAt: tasks[0]!.createdAt,
          updatedAt: tasks[0]!.updatedAt,
        },
      ],
      tags: [],
      blockedByTaskIds: [],
      blockedByTaskTitles: [],
    });

    render(<TaskManager initialTasks={tasks} viewerRole="ADMIN" />);

    const user = userEvent.setup();
    await user.type(
      screen.getByPlaceholderText("Tytuł zadania"),
      "Confirm cake tasting",
    );
    await user.type(
      screen.getByPlaceholderText("Opis"),
      "Meet pastry chef for final tasting.",
    );
    await user.click(screen.getByRole("button", { name: "Dodaj punkt" }));
    await user.type(
      screen.getByPlaceholderText("Np. Potwierdź liczbę osób"),
      "Confirm guest count with pastry chef",
    );
    await user.click(screen.getByRole("button", { name: "Utwórz zadanie" }));

    await waitFor(() => expect(apiClient).toHaveBeenCalled());
    expect(apiClient).toHaveBeenCalledWith(
      "/api/tasks",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining(
          '"checklistItems":[{"title":"Confirm guest count with pastry chef","completed":false}]',
        ),
      }),
    );
    expect(screen.getAllByText("Confirm cake tasting").length).toBeGreaterThan(
      0,
    );
  }, 10000);

  it("forces witness-created tasks to stay assigned to witnesses", async () => {
    const tasks = await listTasks();
    vi.mocked(apiClient).mockResolvedValueOnce({
      ...tasks[0]!,
      id: "task-witness",
      title: "Witness follow-up",
      assignee: "WITNESSES",
      blockedByTaskTitles: [],
    });

    render(<TaskManager initialTasks={tasks} viewerRole="WITNESS" />);

    const user = userEvent.setup();
    await user.type(
      screen.getByPlaceholderText("Tytuł zadania"),
      "Witness follow-up",
    );
    await user.type(
      screen.getByPlaceholderText("Opis"),
      "Call transport vendor",
    );
    await user.click(screen.getByRole("button", { name: "Utwórz zadanie" }));

    await waitFor(() =>
      expect(apiClient).toHaveBeenCalledWith(
        "/api/tasks",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining('"assignee":"WITNESSES"'),
        }),
      ),
    );
    expect(
      screen.queryByRole("button", { name: "Edytuj" }),
    ).not.toBeInTheDocument();
  });
});
