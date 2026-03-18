"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";

import {
  CalendarHeart,
  ChartPie,
  CircleDollarSign,
  ListTodo,
} from "lucide-react";

import { useLocale } from "@/components/locale-provider";

const LazyBarChart = dynamic(
  () =>
    import("recharts").then((mod) => {
      const {
        Bar,
        BarChart,
        CartesianGrid,
        ResponsiveContainer,
        Tooltip,
        XAxis,
      } = mod;
      const ChartWrapper = ({
        data,
        dataKey,
        barName,
      }: {
        data: Array<Record<string, unknown>>;
        dataKey: string;
        barName: string;
      }) => (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f0d6c5"
            />
            <XAxis dataKey="name" stroke="#74626a" />
            <Tooltip />
            <Bar
              dataKey={dataKey}
              name={barName}
              fill="#e7c787"
              radius={[10, 10, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      );
      ChartWrapper.displayName = "DashboardBarChart";
      return { default: ChartWrapper };
    }),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-sm text-[var(--color-muted-copy)]">
        Ładowanie wykresu...
      </div>
    ),
  },
);
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SummaryCard } from "@/components/summary-card";
import { canViewDashboardTasks } from "@/lib/access-control";
import { formatCurrency, formatDate, formatTime } from "@/lib/format";
import type { DashboardData } from "@/lib/planner-domain";

export const DashboardOverview = ({ data }: { data: DashboardData }) => {
  const { locale, messages } = useLocale();
  const coupleNames = `${data.wedding.coupleOneName} & ${data.wedding.coupleTwoName}`;
  const canSeeBudget = data.viewerRole === "ADMIN" || !data.viewerRole;
  const canSeeTasks = canViewDashboardTasks(data.viewerRole ?? "ADMIN");
  const [chartFilter, setChartFilter] = useState<
    "planned" | "paid" | "remaining"
  >("planned");
  const chartData = data.categorySpend
    .slice()
    .filter((category) =>
      chartFilter === "planned"
        ? category.planned > 0
        : chartFilter === "paid"
          ? category.actual > 0
          : category.remaining > 0,
    )
    .sort((left, right) =>
      chartFilter === "planned"
        ? right.planned - left.planned
        : chartFilter === "paid"
          ? right.actual - left.actual
          : right.remaining - left.remaining,
    );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: messages.dashboard.countdown,
            value: `${data.countdownDays} ${messages.dashboard.days}, ${data.countdownHours} h`,
            detail: messages.dashboard.countdownDetail(
              coupleNames,
              formatDate(data.wedding.ceremonyDate, locale),
            ),
            icon: <CalendarHeart className="h-5 w-5" />,
            accent: "linear-gradient(135deg, #d48ca1, #edb8a8)",
            href: "/timeline",
          },
          {
            label: messages.dashboard.guests,
            value: `${data.guestStats.attending}/${data.guestStats.total}`,
            detail: messages.dashboard.guestsDetail(data.guestStats.pending),
            icon: <ChartPie className="h-5 w-5" />,
            accent: "linear-gradient(135deg, #8eb9a9, #dce8af)",
            href: "/guests",
          },
          {
            label: messages.dashboard.tasks,
            value: `${data.taskStats.done}/${data.taskStats.total}`,
            detail: messages.dashboard.tasksDetail(data.taskStats.inProgress),
            icon: <ListTodo className="h-5 w-5" />,
            accent: "linear-gradient(135deg, #9ca7d8, #c8bde9)",
            href: "/tasks",
          },
          ...(canSeeBudget
            ? [
                {
                  label: messages.dashboard.budget,
                  value: formatCurrency(data.budgetStats.actual, locale),
                  detail: messages.dashboard.budgetDetail(
                    formatCurrency(data.budgetStats.remaining, locale),
                  ),
                  icon: <CircleDollarSign className="h-5 w-5" />,
                  accent: "linear-gradient(135deg, #e1b96c, #f6dda2)",
                  href: "/budget",
                },
              ]
            : []),
        ]
          .filter(
            (card) => canSeeTasks || card.label !== messages.dashboard.tasks,
          )
          .map((card) => (
            <div key={card.label}>
              <SummaryCard {...card} />
            </div>
          ))}
      </div>
      <div
        className={`grid gap-6 ${canSeeBudget ? "lg:grid-cols-[1.2fr_0.8fr]" : "lg:grid-cols-1"}`}
      >
        {canSeeBudget ? (
          <Card className="border-white/70 bg-white/85 shadow-[0_18px_60px_rgba(160,96,120,0.12)]">
            <CardHeader>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <CardTitle className="font-display text-3xl text-[var(--color-ink)]">
                  {messages.dashboard.categorySpend}
                </CardTitle>
                <select
                  className="h-10 rounded-full border border-[var(--color-card-tint)] bg-white px-4 text-sm text-[var(--color-ink)]"
                  value={chartFilter}
                  onChange={(event) =>
                    setChartFilter(
                      event.target.value as "planned" | "paid" | "remaining",
                    )
                  }
                  aria-label={messages.dashboard.chartFilter}
                >
                  <option value="planned">
                    {messages.dashboard.filters.planned}
                  </option>
                  <option value="paid">
                    {messages.dashboard.filters.paid}
                  </option>
                  <option value="remaining">
                    {messages.dashboard.filters.remaining}
                  </option>
                </select>
              </div>
            </CardHeader>
            <CardContent className="h-[320px]">
              <LazyBarChart
                data={chartData}
                dataKey={
                  chartFilter === "planned"
                    ? "planned"
                    : chartFilter === "paid"
                      ? "actual"
                      : "remaining"
                }
                barName={
                  chartFilter === "planned"
                    ? messages.dashboard.planned
                    : chartFilter === "paid"
                      ? messages.budget.paid
                      : messages.budget.remaining
                }
              />
            </CardContent>
          </Card>
        ) : null}
        <Card className="border-white/70 bg-white/85 shadow-[0_18px_60px_rgba(160,96,120,0.12)]">
          <CardHeader>
            <CardTitle className="font-display text-3xl text-[var(--color-ink)]">
              {messages.dashboard.nextMoments}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.nextEvents.map((event) => (
              <div
                key={event.id}
                className="rounded-[1.5rem] bg-[var(--color-card-tint)]/70 p-4"
              >
                <p className="text-sm uppercase tracking-[0.25em] text-[var(--color-dusty-rose)]">
                  {formatTime(event.startsAt, locale)}
                </p>
                <h3 className="mt-2 font-display text-2xl text-[var(--color-ink)]">
                  {event.title}
                </h3>
                <p className="mt-1 text-sm text-[var(--color-muted-copy)]">
                  {event.location}
                </p>
                <div className="mt-4 flex justify-end">
                  <Link
                    href={`/timeline#timeline-${event.id}`}
                    className="rounded-full bg-white px-4 py-2 text-sm text-[var(--color-ink)]"
                  >
                    {messages.common.more}
                  </Link>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <div
        className={`grid gap-6 ${
          canSeeBudget && canSeeTasks ? "lg:grid-cols-2" : "lg:grid-cols-1"
        }`}
      >
        {canSeeTasks ? (
          <Card className="border-white/70 bg-white/85 shadow-[0_18px_60px_rgba(160,96,120,0.12)]">
            <CardHeader>
              <CardTitle className="font-display text-3xl text-[var(--color-ink)]">
                {messages.dashboard.upcomingTasks}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.upcomingTasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-[1.5rem] bg-[var(--color-card-tint)]/70 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-display text-2xl text-[var(--color-ink)]">
                      {task.title}
                    </h3>
                    <span className="rounded-full bg-white px-3 py-1 text-xs uppercase tracking-[0.2em] text-[var(--color-dusty-rose)]">
                      {messages.enums.taskPriority[task.priority]}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[var(--color-muted-copy)]">
                    {formatDate(task.dueDate, locale)}
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-muted-copy)]">
                    {messages.tasks.assignee}:{" "}
                    {messages.enums.taskAssignee[task.assignee]}
                  </p>
                  <p className="mt-2 text-sm text-[var(--color-muted-copy)]">
                    {task.notes || messages.dashboard.noTaskNotes}
                  </p>
                  <div className="mt-4 flex justify-end">
                    <Link
                      href={`/tasks#task-${task.id}`}
                      className="rounded-full bg-white px-4 py-2 text-sm text-[var(--color-ink)]"
                    >
                      {messages.common.more}
                    </Link>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}
        {canSeeBudget ? (
          <Card className="border-white/70 bg-white/85 shadow-[0_18px_60px_rgba(160,96,120,0.12)]">
            <CardHeader>
              <CardTitle className="font-display text-3xl text-[var(--color-ink)]">
                {messages.dashboard.allExpenses}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.expenseHighlights.map((expense) => (
                <div
                  key={expense.id}
                  className="rounded-[1.5rem] bg-[var(--color-card-tint)]/70 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-display text-2xl text-[var(--color-ink)]">
                      {expense.name}
                    </h3>
                    <span className="text-sm font-medium text-[var(--color-ink)]">
                      {formatCurrency(expense.planned, locale)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[var(--color-muted-copy)]">
                    {messages.dashboard.expenseActual(
                      formatCurrency(expense.actual, locale),
                    )}
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-muted-copy)]">
                    {messages.dashboard.expenseRemaining(
                      formatCurrency(expense.remaining, locale),
                    )}
                  </p>
                  <div className="mt-4 flex justify-end">
                    <Link
                      href={`/budget#expense-${expense.id}`}
                      className="rounded-full bg-white px-4 py-2 text-sm text-[var(--color-ink)]"
                    >
                      {messages.common.more}
                    </Link>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
};
