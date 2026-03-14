"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

import { useLocale } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTaskBuckets } from "@/features/tasks/hooks/use-task-buckets";
import type { TaskInput } from "@/features/tasks/types/task";
import { canCreateTasks, canEditTasks } from "@/lib/access-control";
import type { TaskRecord, UserRole } from "@/lib/planner-domain";
import { apiClient } from "@/lib/api-client";
import { toDateTimeLocalValue } from "@/lib/date-time";
import { formatDate } from "@/lib/format";

const statusOrder = { TODO: 0, IN_PROGRESS: 1, DONE: 2 } as const;
const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 } as const;

const sortTasks = (items: Array<TaskRecord & { notes: string }>) =>
  items.slice().sort((left, right) => {
    return (
      statusOrder[left.status] - statusOrder[right.status] ||
      left.dueDate.localeCompare(right.dueDate) ||
      priorityOrder[left.priority] - priorityOrder[right.priority]
    );
  });

export const TaskManager = ({
  initialTasks,
  viewerRole,
}: {
  initialTasks: Array<TaskRecord & { notes: string }>;
  viewerRole: UserRole;
}) => {
  const { locale, messages } = useLocale();
  const [tasks, setTasks] = useState(sortTasks(initialTasks));
  const [selectedTask, setSelectedTask] = useState<
    (TaskRecord & { notes: string }) | null
  >(null);
  const [statusFilter, setStatusFilter] = useState<"ALL" | TaskInput["status"]>(
    "ALL",
  );
  const [assigneeFilter, setAssigneeFilter] = useState<
    "ALL" | TaskInput["assignee"]
  >("ALL");
  const buckets = useTaskBuckets(tasks);
  const emptyTaskForm: TaskInput = {
    title: "",
    description: "",
    dueDate: toDateTimeLocalValue(new Date().toISOString()),
    priority: "MEDIUM",
    status: "TODO",
    assignee: viewerRole === "WITNESS" ? "WITNESSES" : "COUPLE",
    notes: "",
  };
  const { register, handleSubmit, reset } = useForm<TaskInput>({
    defaultValues: emptyTaskForm,
  });

  const onSubmit = handleSubmit(async (values) => {
    const payload =
      viewerRole === "WITNESS"
        ? { ...values, assignee: "WITNESSES" as const }
        : values;

    if (selectedTask) {
      const updated = await apiClient<TaskRecord & { notes: string }>(
        `/api/tasks/${selectedTask.id}`,
        {
          method: "PATCH",
          body: JSON.stringify(payload),
        },
      );
      setTasks((current) =>
        sortTasks(
          current.map((task) => (task.id === updated.id ? updated : task)),
        ),
      );
    } else {
      const created = await apiClient<TaskRecord & { notes: string }>(
        "/api/tasks",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      );
      setTasks((current) => sortTasks([...current, created]));
    }
    setSelectedTask(null);
    reset(emptyTaskForm);
  });

  const visibleTasks = tasks.filter((task) => {
    if (statusFilter !== "ALL" && task.status !== statusFilter) {
      return false;
    }
    if (assigneeFilter !== "ALL" && task.assignee !== assigneeFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      {canCreateTasks(viewerRole) ? (
        <Card className="border-white/70 bg-white/85">
          <CardHeader>
            <CardTitle className="font-display text-3xl text-[var(--color-ink)]">
              {selectedTask ? messages.tasks.edit : messages.tasks.newTask}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={onSubmit}>
              <label className="space-y-1 text-sm text-[var(--color-ink)]">
                <span>{messages.tasks.title}</span>
                <Input
                  placeholder={messages.tasks.title}
                  {...register("title")}
                />
              </label>
              <label className="space-y-1 text-sm text-[var(--color-ink)]">
                <span>{messages.tasks.description}</span>
                <Input
                  placeholder={messages.tasks.description}
                  {...register("description")}
                />
              </label>
              <label className="space-y-1 text-sm text-[var(--color-ink)]">
                <span>{messages.tasks.due}</span>
                <Input type="datetime-local" {...register("dueDate")} />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1 text-sm text-[var(--color-ink)]">
                  <span>{messages.tasks.priority}</span>
                  <select
                    className="h-10 w-full rounded-xl border px-3"
                    {...register("priority")}
                  >
                    <option value="LOW">
                      {messages.enums.taskPriority.LOW}
                    </option>
                    <option value="MEDIUM">
                      {messages.enums.taskPriority.MEDIUM}
                    </option>
                    <option value="HIGH">
                      {messages.enums.taskPriority.HIGH}
                    </option>
                  </select>
                </label>
                <label className="space-y-1 text-sm text-[var(--color-ink)]">
                  <span>{messages.tasks.status}</span>
                  <select
                    className="h-10 w-full rounded-xl border px-3"
                    {...register("status")}
                  >
                    <option value="TODO">
                      {messages.enums.taskStatus.TODO}
                    </option>
                    <option value="IN_PROGRESS">
                      {messages.enums.taskStatus.IN_PROGRESS}
                    </option>
                    <option value="DONE">
                      {messages.enums.taskStatus.DONE}
                    </option>
                  </select>
                </label>
              </div>
              <label className="space-y-1 text-sm text-[var(--color-ink)]">
                <span>{messages.tasks.assignee}</span>
                <select
                  className="h-10 w-full rounded-xl border px-3"
                  {...register("assignee")}
                  disabled={viewerRole === "WITNESS"}
                >
                  <option value="GROOM">
                    {messages.enums.taskAssignee.GROOM}
                  </option>
                  <option value="BRIDE">
                    {messages.enums.taskAssignee.BRIDE}
                  </option>
                  <option value="COUPLE">
                    {messages.enums.taskAssignee.COUPLE}
                  </option>
                  <option value="WITNESSES">
                    {messages.enums.taskAssignee.WITNESSES}
                  </option>
                </select>
              </label>
              <label className="space-y-1 text-sm text-[var(--color-ink)]">
                <span>{messages.tasks.notes}</span>
                <Input
                  placeholder={messages.tasks.notes}
                  {...register("notes")}
                />
              </label>
              <div className="flex gap-3">
                <Button className="rounded-full" type="submit">
                  {selectedTask ? messages.tasks.save : messages.tasks.create}
                </Button>
                {selectedTask ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => {
                      setSelectedTask(null);
                      reset(emptyTaskForm);
                    }}
                  >
                    {messages.guests.cancel}
                  </Button>
                ) : null}
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <select
            className="h-10 rounded-xl border px-3"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as "ALL" | TaskInput["status"])
            }
          >
            <option value="ALL">{messages.dashboard.filters.all}</option>
            <option value="TODO">{messages.enums.taskStatus.TODO}</option>
            <option value="IN_PROGRESS">
              {messages.enums.taskStatus.IN_PROGRESS}
            </option>
            <option value="DONE">{messages.enums.taskStatus.DONE}</option>
          </select>
          <select
            className="h-10 rounded-xl border px-3"
            value={assigneeFilter}
            onChange={(event) =>
              setAssigneeFilter(
                event.target.value as "ALL" | TaskInput["assignee"],
              )
            }
          >
            <option value="ALL">{messages.dashboard.filters.all}</option>
            <option value="GROOM">{messages.enums.taskAssignee.GROOM}</option>
            <option value="BRIDE">{messages.enums.taskAssignee.BRIDE}</option>
            <option value="COUPLE">{messages.enums.taskAssignee.COUPLE}</option>
            <option value="WITNESSES">
              {messages.enums.taskAssignee.WITNESSES}
            </option>
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            [messages.tasks.todo, buckets.todo],
            [messages.tasks.inProgress, buckets.inProgress],
            [messages.tasks.done, buckets.done],
          ].map(([label, value]) => (
            <Card key={label} className="border-white/70 bg-white/85">
              <CardContent className="p-5">
                <p className="text-sm uppercase tracking-[0.25em] text-[var(--color-dusty-rose)]">
                  {label}
                </p>
                <p className="mt-2 font-display text-4xl text-[var(--color-ink)]">
                  {value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        {visibleTasks.map((task) => (
          <Card
            key={task.id}
            className="border-white/70 bg-white/85"
            onDoubleClick={() => {
              if (!canEditTasks(viewerRole)) {
                return;
              }
              setSelectedTask(task);
              reset({
                title: task.title,
                description: task.description,
                dueDate: toDateTimeLocalValue(task.dueDate),
                priority: task.priority,
                status: task.status,
                assignee: task.assignee,
                notes: task.notes,
              });
            }}
          >
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-[var(--color-ink)]">
                    <input
                      type="checkbox"
                      checked={task.status === "DONE"}
                      disabled={!canEditTasks(viewerRole)}
                      onChange={async () => {
                        if (!canEditTasks(viewerRole)) {
                          return;
                        }
                        const updated = await apiClient<
                          TaskRecord & { notes: string }
                        >(`/api/tasks/${task.id}`, {
                          method: "PATCH",
                          body: JSON.stringify({
                            ...task,
                            dueDate: toDateTimeLocalValue(task.dueDate),
                            status: task.status === "DONE" ? "TODO" : "DONE",
                          }),
                        });
                        setTasks((current) =>
                          sortTasks(
                            current.map((candidate) =>
                              candidate.id === updated.id ? updated : candidate,
                            ),
                          ),
                        );
                      }}
                    />
                    {messages.tasks.completed}
                  </label>
                  <p className="text-sm uppercase tracking-[0.25em] text-[var(--color-dusty-rose)]">
                    {messages.enums.taskStatus[task.status]}
                  </p>
                  <p className="rounded-full bg-[var(--color-card-tint)] px-3 py-1 text-xs uppercase tracking-[0.2em] text-[var(--color-ink)]">
                    {messages.enums.taskPriority[task.priority]}
                  </p>
                </div>
                <h3 className="font-display text-3xl text-[var(--color-ink)]">
                  {task.title}
                </h3>
                <p className="text-sm text-[var(--color-muted-copy)]">
                  {messages.tasks.due} {formatDate(task.dueDate, locale)}
                </p>
                <p className="text-sm text-[var(--color-muted-copy)]">
                  {messages.tasks.assignee}:{" "}
                  {messages.enums.taskAssignee[task.assignee]}
                </p>
                <p className="text-sm text-[var(--color-muted-copy)]">
                  {task.notes}
                </p>
              </div>
              <div className="flex gap-3">
                {canEditTasks(viewerRole) ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedTask(task);
                        reset({
                          title: task.title,
                          description: task.description,
                          dueDate: toDateTimeLocalValue(task.dueDate),
                          priority: task.priority,
                          status: task.status,
                          assignee: task.assignee,
                          notes: task.notes,
                        });
                      }}
                    >
                      {messages.guests.editButton}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={async () => {
                        if (!window.confirm(messages.common.confirmDelete)) {
                          return;
                        }
                        await apiClient<{ taskId: string }>(
                          `/api/tasks/${task.id}`,
                          {
                            method: "DELETE",
                          },
                        );
                        setTasks((current) =>
                          current.filter(
                            (candidate) => candidate.id !== task.id,
                          ),
                        );
                      }}
                    >
                      {messages.tasks.delete}
                    </Button>
                  </>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
