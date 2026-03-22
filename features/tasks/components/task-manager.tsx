"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { FieldError } from "@/components/field-error";
import { useLocale } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTaskBuckets } from "@/features/tasks/hooks/use-task-buckets";
import { TASK_TEMPLATES } from "@/features/tasks/lib/task-templates";
import { taskInputSchema } from "@/features/tasks/types/task";
import type { TaskInput, TaskView } from "@/features/tasks/types/task";
import { canCreateTasks, canEditTasks } from "@/lib/access-control";
import { apiClient } from "@/lib/api-client";
import { toDateTimeLocalValue } from "@/lib/date-time";
import { formatDate } from "@/lib/format";
import type { UserRole } from "@/lib/planner-domain";
import { useLocalStorage } from "@/hooks/use-local-storage";

const statusOrder = { TODO: 0, IN_PROGRESS: 1, DONE: 2 } as const;
const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 } as const;
const TASK_VIEW_PRESETS = ["ALL", "OVERDUE", "NEXT_14_DAYS"] as const;
type TaskViewPreset = (typeof TASK_VIEW_PRESETS)[number];

const sortTasks = (items: TaskView[]) =>
  items.slice().sort((left, right) => {
    return (
      statusOrder[left.status] - statusOrder[right.status] ||
      left.dueDate.localeCompare(right.dueDate) ||
      priorityOrder[left.priority] - priorityOrder[right.priority]
    );
  });

const toTaskPayload = (
  task: TaskView,
  overrides?: Partial<TaskInput>,
): TaskInput => ({
  title: task.title,
  description: task.description,
  dueDate: toDateTimeLocalValue(task.dueDate),
  priority: task.priority,
  status: task.status,
  assignee: task.assignee,
  tags: task.tags,
  notes: task.notes,
  ...overrides,
});

const filterByViewPreset = (
  tasks: TaskView[],
  viewPreset: TaskViewPreset,
): TaskView[] => {
  const now = Date.now();
  const twoWeeks = now + 14 * 24 * 60 * 60 * 1000;

  switch (viewPreset) {
    case "OVERDUE":
      return tasks.filter(
        (task) =>
          task.status !== "DONE" && new Date(task.dueDate).getTime() < now,
      );
    case "NEXT_14_DAYS":
      return tasks.filter((task) => {
        const dueAt = new Date(task.dueDate).getTime();
        return task.status !== "DONE" && dueAt >= now && dueAt <= twoWeeks;
      });
    default:
      return tasks;
  }
};

export const TaskManager = ({
  initialTasks,
  viewerRole,
}: {
  initialTasks: TaskView[];
  viewerRole: UserRole;
}) => {
  const { locale, messages } = useLocale();
  const [tasks, setTasks] = useState(sortTasks(initialTasks));
  const [selectedTask, setSelectedTask] = useState<TaskView | null>(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | TaskInput["status"]>(
    "ALL",
  );
  const [assigneeFilter, setAssigneeFilter] = useState<
    "ALL" | TaskInput["assignee"]
  >("ALL");
  const [viewPreset, setViewPreset, viewPresetHydrated] =
    useLocalStorage<TaskViewPreset>(`tasks-view-preset:${viewerRole}`, "ALL");
  const buckets = useTaskBuckets(tasks);
  const formRef = useRef<HTMLDivElement | null>(null);
  const emptyTaskForm: TaskInput = {
    title: "",
    description: "",
    dueDate: toDateTimeLocalValue(new Date().toISOString()),
    priority: "MEDIUM",
    status: "TODO",
    assignee: viewerRole === "WITNESS" ? "WITNESSES" : "COUPLE",
    tags: [],
    notes: "",
  };
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TaskInput>({
    defaultValues: emptyTaskForm,
    resolver: zodResolver(taskInputSchema) as never,
  });
  const watchedTags = watch("tags");

  const resetTaskForm = () => {
    setSelectedTask(null);
    setSelectedTemplateId("");
    reset(emptyTaskForm);
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      const payload =
        viewerRole === "WITNESS"
          ? {
              ...values,
              assignee: "WITNESSES" as const,
            }
          : values;

      if (selectedTask) {
        const updated = await apiClient<TaskView>(
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
        const created = await apiClient<TaskView>("/api/tasks", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setTasks((current) => sortTasks([...current, created]));
      }
      resetTaskForm();
    } catch {
      toast.error(messages.common.actionError);
    }
  });

  const visibleTasks = filterByViewPreset(tasks, viewPreset).filter((task) => {
    if (statusFilter !== "ALL" && task.status !== statusFilter) {
      return false;
    }
    if (assigneeFilter !== "ALL" && task.assignee !== assigneeFilter) {
      return false;
    }
    return true;
  });

  const handleEdit = (task: TaskView) => {
    setSelectedTask(task);
    reset({
      title: task.title,
      description: task.description,
      dueDate: toDateTimeLocalValue(task.dueDate),
      priority: task.priority,
      status: task.status,
      assignee: task.assignee,
      tags: task.tags,
      notes: task.notes,
    });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const bulkUpdateStatus = async (status: TaskInput["status"]) => {
    if (selectedTaskIds.length === 0) {
      return;
    }

    try {
      const updatedTasks = await Promise.all(
        tasks
          .filter((task) => selectedTaskIds.includes(task.id))
          .map((task) =>
            apiClient<TaskView>(`/api/tasks/${task.id}`, {
              method: "PATCH",
              body: JSON.stringify(toTaskPayload(task, { status })),
            }),
          ),
      );

      setTasks((current) =>
        sortTasks(
          current.map(
            (task) =>
              updatedTasks.find((updated) => updated.id === task.id) ?? task,
          ),
        ),
      );
      setSelectedTaskIds([]);
    } catch {
      toast.error(messages.common.actionError);
    }
  };

  const allVisibleSelected =
    visibleTasks.length > 0 &&
    visibleTasks.every((task) => selectedTaskIds.includes(task.id));

  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      {canCreateTasks(viewerRole) ? (
        <Card
          className="scroll-mt-40 border-white/70 bg-white/85"
          ref={formRef}
        >
          <CardHeader>
            <CardTitle className="font-display text-3xl text-[var(--color-ink)]">
              {selectedTask ? messages.tasks.edit : messages.tasks.newTask}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={onSubmit}>
              <label className="space-y-1 text-sm text-[var(--color-ink)]">
                <span>{messages.tasks.template}</span>
                <select
                  className="h-10 w-full rounded-xl border px-3"
                  value={selectedTemplateId}
                  onChange={(event) => {
                    const templateId = event.target.value;
                    setSelectedTemplateId(templateId);
                    const template = TASK_TEMPLATES.find(
                      (candidate) => candidate.id === templateId,
                    );
                    if (!template) {
                      return;
                    }
                    reset({
                      ...emptyTaskForm,
                      ...template.values,
                      dueDate: toDateTimeLocalValue(new Date().toISOString()),
                    });
                  }}
                >
                  <option value="">{messages.tasks.noTemplate}</option>
                  {TASK_TEMPLATES.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1 text-sm text-[var(--color-ink)]">
                <span>{messages.tasks.title}</span>
                <Input
                  placeholder={messages.tasks.title}
                  aria-invalid={!!errors.title}
                  {...register("title")}
                />
                <FieldError error={errors.title} />
              </label>
              <label className="space-y-1 text-sm text-[var(--color-ink)]">
                <span>{messages.tasks.description}</span>
                <Input
                  placeholder={messages.tasks.description}
                  aria-invalid={!!errors.description}
                  {...register("description")}
                />
                <FieldError error={errors.description} />
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
                <span>{messages.tasks.tags}</span>
                <Input
                  placeholder={messages.tasks.tagsPlaceholder}
                  value={watchedTags?.join(", ") ?? ""}
                  onChange={(event) =>
                    setValue(
                      "tags",
                      event.target.value
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter(Boolean),
                    )
                  }
                />
              </label>
              <label className="space-y-1 text-sm text-[var(--color-ink)]">
                <span>{messages.tasks.notes}</span>
                <Input
                  placeholder={messages.tasks.notes}
                  {...register("notes")}
                />
              </label>
              <div className="flex gap-3">
                <Button
                  className="rounded-full"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {selectedTask ? messages.tasks.save : messages.tasks.create}
                </Button>
                {selectedTask ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    onClick={resetTaskForm}
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
        <div className="flex flex-wrap items-center gap-2">
          {TASK_VIEW_PRESETS.map((preset) => (
            <Button
              key={preset}
              type="button"
              variant={
                viewPresetHydrated && viewPreset === preset
                  ? "default"
                  : "outline"
              }
              className="rounded-full"
              onClick={() => setViewPreset(preset)}
            >
              {messages.tasks.viewPresets[preset]}
            </Button>
          ))}
          <a
            href="/api/calendar"
            className="inline-flex h-10 items-center justify-center rounded-full border border-white/70 bg-white/80 px-4 text-sm font-medium text-[var(--color-ink)] shadow-sm transition-colors hover:bg-white"
          >
            {messages.tasks.exportCalendar}
          </a>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <select
            className="h-10 rounded-xl border px-3"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as "ALL" | TaskInput["status"])
            }
            aria-label={messages.tasks.status}
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
            aria-label={messages.tasks.assignee}
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
        {canEditTasks(viewerRole) ? (
          <Card className="border-white/70 bg-white/85">
            <CardContent className="flex flex-wrap items-center gap-3 p-5">
              <label className="flex items-center gap-2 text-sm text-[var(--color-ink)]">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={(event) =>
                    setSelectedTaskIds(
                      event.target.checked
                        ? visibleTasks.map((task) => task.id)
                        : [],
                    )
                  }
                />
                {messages.tasks.selectVisible}
              </label>
              <span className="text-sm text-[var(--color-muted-copy)]">
                {messages.tasks.selectedCount(selectedTaskIds.length)}
              </span>
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                disabled={selectedTaskIds.length === 0}
                onClick={() => void bulkUpdateStatus("TODO")}
              >
                {messages.tasks.bulkTodo}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                disabled={selectedTaskIds.length === 0}
                onClick={() => void bulkUpdateStatus("IN_PROGRESS")}
              >
                {messages.tasks.bulkInProgress}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                disabled={selectedTaskIds.length === 0}
                onClick={() => void bulkUpdateStatus("DONE")}
              >
                {messages.tasks.bulkDone}
              </Button>
            </CardContent>
          </Card>
        ) : null}
        {visibleTasks.length === 0 ? (
          <p className="py-8 text-center text-sm text-[var(--color-muted-copy)]">
            {messages.tasks.empty}
          </p>
        ) : null}
        {visibleTasks.map((task) => (
          <Card
            key={task.id}
            id={`task-${task.id}`}
            className="scroll-mt-40 border-white/70 bg-white/85"
            onDoubleClick={() => {
              if (!canEditTasks(viewerRole)) {
                return;
              }
              handleEdit(task);
            }}
          >
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  {canEditTasks(viewerRole) ? (
                    <label className="flex items-center gap-2 text-sm text-[var(--color-ink)]">
                      <input
                        type="checkbox"
                        checked={selectedTaskIds.includes(task.id)}
                        onChange={(event) =>
                          setSelectedTaskIds((current) =>
                            event.target.checked
                              ? [...current, task.id]
                              : current.filter(
                                  (candidate) => candidate !== task.id,
                                ),
                          )
                        }
                      />
                      {messages.tasks.selectTask}
                    </label>
                  ) : null}
                  <label className="flex items-center gap-2 text-sm text-[var(--color-ink)]">
                    <input
                      type="checkbox"
                      checked={task.status === "DONE"}
                      disabled={!canEditTasks(viewerRole)}
                      onChange={async () => {
                        if (!canEditTasks(viewerRole)) {
                          return;
                        }
                        try {
                          const updated = await apiClient<TaskView>(
                            `/api/tasks/${task.id}`,
                            {
                              method: "PATCH",
                              body: JSON.stringify(
                                toTaskPayload(task, {
                                  status:
                                    task.status === "DONE" ? "TODO" : "DONE",
                                }),
                              ),
                            },
                          );
                          setTasks((current) =>
                            sortTasks(
                              current.map((candidate) =>
                                candidate.id === updated.id
                                  ? updated
                                  : candidate,
                              ),
                            ),
                          );
                        } catch {
                          toast.error(messages.common.actionError);
                        }
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
                {task.tags.length > 0 ? (
                  <p className="text-sm text-[var(--color-muted-copy)]">
                    {messages.tasks.tagsLabel(task.tags.join(", "))}
                  </p>
                ) : null}
                <p className="text-sm text-[var(--color-muted-copy)]">
                  {task.notes}
                </p>
              </div>
              <div className="flex gap-3">
                {canEditTasks(viewerRole) ? (
                  <>
                    <Button variant="outline" onClick={() => handleEdit(task)}>
                      {messages.guests.editButton}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={async () => {
                        if (!window.confirm(messages.common.confirmDelete)) {
                          return;
                        }
                        try {
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
                        } catch {
                          toast.error(messages.common.actionError);
                        }
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
