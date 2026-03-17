"use client";

import Link from "next/link";
import { useState } from "react";

import { motion } from "framer-motion";
import {
  CalendarHeart,
  ChartPie,
  CircleDollarSign,
  ListTodo,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

import { useLocale } from "@/components/locale-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SummaryCard } from "@/components/summary-card";
import {
  canAccessSection,
  canViewDashboardTasks,
  type PlannerSection,
} from "@/lib/access-control";
import { formatCurrency, formatDate, formatTime } from "@/lib/format";
import type { DashboardData } from "@/lib/planner-domain";

export const DashboardOverview = ({ data }: { data: DashboardData }) => {
  const { locale, messages } = useLocale();
  const coupleNames = `${data.wedding.coupleOneName} & ${data.wedding.coupleTwoName}`;
  const canSeeBudget = data.viewerRole === "ADMIN" || !data.viewerRole;
  const canSeeTasks = canViewDashboardTasks(data.viewerRole ?? "ADMIN");
  const dashboardLinks = [
    {
      href: "/guests",
      label: messages.shell.nav.guests,
      section: "guests" as PlannerSection,
    },
    {
      href: "/vendors",
      label: messages.shell.nav.vendors,
      section: "vendors" as PlannerSection,
    },
    {
      href: "/tasks",
      label: messages.shell.nav.tasks,
      section: "tasks" as PlannerSection,
    },
    {
      href: "/budget",
      label: messages.shell.nav.budget,
      section: "budget" as PlannerSection,
    },
    {
      href: "/timeline",
      label: messages.shell.nav.timeline,
      section: "timeline" as PlannerSection,
    },
    {
      href: "/seating",
      label: messages.shell.nav.seating,
      section: "seating" as PlannerSection,
    },
    {
      href: "/import",
      label: messages.shell.nav.import,
      section: "import" as PlannerSection,
    },
    {
      href: "/public",
      label: messages.shell.nav.publicSite,
      section: "public" as PlannerSection,
    },
  ].filter((link) =>
    canAccessSection(data.viewerRole ?? "ADMIN", link.section),
  );
  const [chartFilter, setChartFilter] = useState<
    "all" | "remaining" | "paid" | "top"
  >("all");
  const chartData =
    chartFilter === "remaining"
      ? data.categorySpend.filter((category) => category.remaining > 0)
      : chartFilter === "paid"
        ? data.categorySpend.filter((category) => category.actual > 0)
        : chartFilter === "top"
          ? data.categorySpend
              .slice()
              .sort((left, right) => right.planned - left.planned)
              .slice(0, 8)
          : data.categorySpend;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Link
          href="#dashboard-links"
          className="rounded-full border border-[var(--color-dusty-rose)] bg-white px-4 py-2 text-sm text-[var(--color-ink)]"
        >
          {messages.common.more}
        </Link>
      </div>
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
          .map((card, index) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <SummaryCard {...card} />
            </motion.div>
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
                      event.target.value as
                        | "all"
                        | "remaining"
                        | "paid"
                        | "top",
                    )
                  }
                  aria-label={messages.dashboard.chartFilter}
                >
                  <option value="all">{messages.dashboard.filters.all}</option>
                  <option value="remaining">
                    {messages.dashboard.filters.remaining}
                  </option>
                  <option value="paid">
                    {messages.dashboard.filters.paid}
                  </option>
                  <option value="top">{messages.dashboard.filters.top}</option>
                </select>
              </div>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f0d6c5"
                  />
                  <XAxis dataKey="name" stroke="#74626a" />
                  <Tooltip />
                  <Bar
                    dataKey="planned"
                    name={messages.dashboard.planned}
                    fill="#e7c787"
                    radius={[10, 10, 0, 0]}
                  />
                  <Bar
                    dataKey="actual"
                    name={messages.dashboard.actual}
                    fill="#c57c92"
                    radius={[10, 10, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
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
                  key={expense.name}
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
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}
      </div>
      <Card
        id="dashboard-links"
        className="border-white/70 bg-white/85 shadow-[0_18px_60px_rgba(160,96,120,0.12)]"
      >
        <CardHeader>
          <CardTitle className="font-display text-3xl text-[var(--color-ink)]">
            {messages.common.more}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {dashboardLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full bg-[var(--color-card-tint)] px-4 py-2 text-sm text-[var(--color-ink)]"
            >
              {link.label}
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
