"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";

import {
  CalendarHeart,
  ChartPie,
  CircleDollarSign,
  ListTodo,
  Siren,
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
  const [responsibilityFilter, setResponsibilityFilter] =
    useState<DashboardData["responsibilityOptions"][number]["id"]>("ALL");
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
  const selectedResponsibility = data.responsibilityOptions.find(
    (option) => option.id === responsibilityFilter,
  );
  const formatResponsibilityOptionLabel = (
    option: DashboardData["responsibilityOptions"][number],
  ) =>
    option.type === "ALL"
      ? messages.dashboard.allResponsibilities
      : option.type === "TASK_ASSIGNEE"
        ? messages.enums.taskAssignee[option.value]
        : option.label;
  const matchesTaskFilter = (assignee: string) =>
    selectedResponsibility?.type !== "TASK_ASSIGNEE" ||
    selectedResponsibility.value === assignee;
  const matchesVendorFilter = (owner: string) =>
    selectedResponsibility?.type !== "VENDOR_OWNER" ||
    selectedResponsibility.value === owner;
  const filteredUpcomingTasks = data.upcomingTasks.filter((task) =>
    matchesTaskFilter(task.assignee),
  );
  const filteredAttentionTasks = data.attentionTasks.filter((task) =>
    matchesTaskFilter(task.assignee),
  );
  const filteredOverdueTasks = data.overdueTasks.filter((task) =>
    matchesTaskFilter(task.assignee),
  );
  const filteredVendorFollowUps = data.vendorFollowUps.filter((vendor) =>
    matchesVendorFilter(vendor.owner),
  );
  const filteredVendorsMissingContact = data.vendorsMissingContact.filter(
    (vendor) => matchesVendorFilter(vendor.owner),
  );
  const filteredTodayTasks = data.todayFocus.tasks.filter((task) => {
    const source = data.upcomingTasks.find((item) => item.id === task.id);
    return source ? matchesTaskFilter(source.assignee) : true;
  });
  const filteredTodayVendorFollowUps = data.todayFocus.vendorFollowUps.filter(
    (vendor) => {
      const source = data.vendorFollowUps.find((item) => item.id === vendor.id);
      return source ? matchesVendorFilter(source.owner) : true;
    },
  );
  const filteredActivityFeed = data.activityFeed.filter((item) => {
    if (item.type === "TASK") {
      return item.taskAssignee ? matchesTaskFilter(item.taskAssignee) : true;
    }
    if (item.type === "VENDOR") {
      return item.vendorOwner ? matchesVendorFilter(item.vendorOwner) : true;
    }
    return selectedResponsibility?.type === "ALL";
  });
  const filteredDecisionQueue = data.decisionQueue.filter((item) => {
    if (item.taskAssignee) {
      return matchesTaskFilter(item.taskAssignee);
    }
    if (item.vendorOwner) {
      return matchesVendorFilter(item.vendorOwner);
    }
    return true;
  });
  const responsibilityLabel = selectedResponsibility
    ? formatResponsibilityOptionLabel(selectedResponsibility)
    : messages.dashboard.allResponsibilities;

  return (
    <div className="space-y-6">
      <Card className="border-white/70 bg-white/85 shadow-[0_18px_60px_rgba(160,96,120,0.12)]">
        <CardContent className="flex flex-col gap-3 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-[var(--color-muted-copy)]">
              {messages.dashboard.responsibilityFilter}
            </p>
            <p className="mt-2 text-sm text-[var(--color-muted-copy)]">
              {messages.dashboard.responsibilityFilterDetail(
                responsibilityLabel,
              )}
            </p>
          </div>
          <select
            className="h-11 rounded-full border border-[var(--color-card-tint)] bg-white px-4 text-sm text-[var(--color-ink)]"
            value={responsibilityFilter}
            onChange={(event) =>
              setResponsibilityFilter(
                event.target
                  .value as DashboardData["responsibilityOptions"][number]["id"],
              )
            }
            aria-label={messages.dashboard.responsibilityFilter}
          >
            {data.responsibilityOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {formatResponsibilityOptionLabel(option)}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>
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
            label: messages.dashboard.attention,
            value: `${data.attentionStats.missingRsvp + data.attentionStats.unseatedGuests + data.attentionStats.overdueTasks + data.attentionStats.vendorFollowUps + (canSeeBudget ? data.attentionStats.overdueExpenses : 0)}`,
            detail: messages.dashboard.attentionDetail(
              data.attentionStats.missingRsvp,
              data.attentionStats.overdueTasks,
            ),
            icon: <Siren className="h-5 w-5" />,
            accent: "linear-gradient(135deg, #d7765e, #efb085)",
            href: "/dashboard",
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
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Card className="border-white/70 bg-white/85 shadow-[0_18px_60px_rgba(160,96,120,0.12)]">
          <CardHeader>
            <CardTitle className="font-display text-3xl text-[var(--color-ink)]">
              {messages.dashboard.quickActions}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {data.quickActions.map((action) => (
              <Link
                key={action.id}
                href={action.href}
                className="rounded-[1.5rem] bg-[var(--color-card-tint)]/70 px-4 py-4 text-sm font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--color-card-tint)]"
              >
                {messages.dashboard.quickActionLabels[action.id]}
              </Link>
            ))}
          </CardContent>
        </Card>
        <Card className="border-white/70 bg-white/85 shadow-[0_18px_60px_rgba(160,96,120,0.12)]">
          <CardHeader>
            <CardTitle className="font-display text-3xl text-[var(--color-ink)]">
              {messages.dashboard.todayFocus}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.25em] text-[var(--color-dusty-rose)]">
                {messages.dashboard.todayTasks}
              </p>
              {filteredTodayTasks.map((task) => (
                <Link
                  key={task.id}
                  href={task.href}
                  className="block rounded-[1.25rem] bg-[var(--color-card-tint)]/70 p-3"
                >
                  <p className="font-medium text-[var(--color-ink)]">
                    {task.title}
                  </p>
                  <p className="text-sm text-[var(--color-muted-copy)]">
                    {formatTime(task.dueDate, locale)}
                  </p>
                </Link>
              ))}
              {filteredTodayTasks.length === 0 ? (
                <p className="text-sm text-[var(--color-muted-copy)]">
                  {messages.dashboard.noTodayTasks}
                </p>
              ) : null}
            </div>
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.25em] text-[var(--color-dusty-rose)]">
                {messages.dashboard.todayEvents}
              </p>
              {data.todayFocus.events.map((event) => (
                <Link
                  key={event.id}
                  href={event.href}
                  className="block rounded-[1.25rem] bg-[var(--color-card-tint)]/70 p-3"
                >
                  <p className="font-medium text-[var(--color-ink)]">
                    {event.title}
                  </p>
                  <p className="text-sm text-[var(--color-muted-copy)]">
                    {formatTime(event.startsAt, locale)}
                  </p>
                </Link>
              ))}
              {data.todayFocus.events.length === 0 ? (
                <p className="text-sm text-[var(--color-muted-copy)]">
                  {messages.dashboard.noTodayEvents}
                </p>
              ) : null}
            </div>
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.25em] text-[var(--color-dusty-rose)]">
                {messages.dashboard.todayPayments}
              </p>
              {data.todayFocus.payments.map((payment) => (
                <Link
                  key={payment.id}
                  href={payment.href}
                  className="block rounded-[1.25rem] bg-[var(--color-card-tint)]/70 p-3"
                >
                  <p className="font-medium text-[var(--color-ink)]">
                    {payment.name}
                  </p>
                  <p className="text-sm text-[var(--color-muted-copy)]">
                    {formatTime(payment.dueDate, locale)}
                  </p>
                </Link>
              ))}
              {data.todayFocus.payments.length === 0 ? (
                <p className="text-sm text-[var(--color-muted-copy)]">
                  {messages.dashboard.noTodayPayments}
                </p>
              ) : null}
            </div>
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.25em] text-[var(--color-dusty-rose)]">
                {messages.dashboard.todayVendorFollowUps}
              </p>
              {filteredTodayVendorFollowUps.map((vendor) => (
                <Link
                  key={vendor.id}
                  href={vendor.href}
                  className="block rounded-[1.25rem] bg-[var(--color-card-tint)]/70 p-3"
                >
                  <p className="font-medium text-[var(--color-ink)]">
                    {vendor.name}
                  </p>
                  <p className="text-sm text-[var(--color-muted-copy)]">
                    {formatTime(vendor.followUpDate, locale)}
                  </p>
                </Link>
              ))}
              {filteredTodayVendorFollowUps.length === 0 ? (
                <p className="text-sm text-[var(--color-muted-copy)]">
                  {messages.dashboard.noTodayVendorFollowUps}
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>
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
              {filteredUpcomingTasks.map((task) => (
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
      <div
        className={`grid gap-6 ${
          canSeeBudget ? "xl:grid-cols-2" : "lg:grid-cols-2"
        }`}
      >
        <Card className="border-white/70 bg-white/85 shadow-[0_18px_60px_rgba(160,96,120,0.12)]">
          <CardHeader>
            <CardTitle className="font-display text-3xl text-[var(--color-ink)]">
              {messages.dashboard.rsvpWatchlist}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[1.5rem] bg-[var(--color-card-tint)]/70 p-4">
              <p className="text-sm uppercase tracking-[0.25em] text-[var(--color-dusty-rose)]">
                {messages.dashboard.pendingRsvpCount(
                  data.attentionStats.missingRsvp,
                )}
              </p>
              <p className="mt-2 text-sm text-[var(--color-muted-copy)]">
                {messages.dashboard.unseatedCount(
                  data.attentionStats.unseatedGuests,
                )}
              </p>
            </div>
            {data.pendingRsvps.map((guest) => (
              <div
                key={guest.id}
                className="rounded-[1.5rem] bg-[var(--color-card-tint)]/70 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-2xl text-[var(--color-ink)]">
                    {guest.name}
                  </h3>
                  <span className="rounded-full bg-white px-3 py-1 text-xs uppercase tracking-[0.2em] text-[var(--color-dusty-rose)]">
                    {messages.enums.guestSide[guest.side]}
                  </span>
                </div>
                <p className="mt-2 text-sm text-[var(--color-muted-copy)]">
                  {guest.invitationGroupName
                    ? messages.dashboard.groupLabel(guest.invitationGroupName)
                    : messages.dashboard.noInvitationGroup}
                </p>
                <div className="mt-4 flex justify-end">
                  <Link
                    href={`/guests#guest-${guest.id}`}
                    className="rounded-full bg-white px-4 py-2 text-sm text-[var(--color-ink)]"
                  >
                    {messages.common.more}
                  </Link>
                </div>
              </div>
            ))}
            {data.pendingRsvps.length === 0 ? (
              <p className="text-sm text-[var(--color-muted-copy)]">
                {messages.dashboard.allRsvpsIn}
              </p>
            ) : null}
          </CardContent>
        </Card>
        <Card className="border-white/70 bg-white/85 shadow-[0_18px_60px_rgba(160,96,120,0.12)]">
          <CardHeader>
            <CardTitle className="font-display text-3xl text-[var(--color-ink)]">
              {messages.dashboard.seatingAttention}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.unseatedGuests.map((guest) => (
              <div
                key={guest.id}
                className="rounded-[1.5rem] bg-[var(--color-card-tint)]/70 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-2xl text-[var(--color-ink)]">
                    {guest.name}
                  </h3>
                  <span className="rounded-full bg-white px-3 py-1 text-xs uppercase tracking-[0.2em] text-[var(--color-dusty-rose)]">
                    {messages.enums.guestSide[guest.side]}
                  </span>
                </div>
                <p className="mt-2 text-sm text-[var(--color-muted-copy)]">
                  {guest.invitationGroupName
                    ? messages.dashboard.groupLabel(guest.invitationGroupName)
                    : messages.dashboard.noInvitationGroup}
                </p>
                <div className="mt-4 flex justify-end">
                  <Link
                    href={`/seating#guest-${guest.id}`}
                    className="rounded-full bg-white px-4 py-2 text-sm text-[var(--color-ink)]"
                  >
                    {messages.common.more}
                  </Link>
                </div>
              </div>
            ))}
            {data.unseatedGuests.length === 0 ? (
              <p className="text-sm text-[var(--color-muted-copy)]">
                {messages.dashboard.everyoneSeated}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
      <div
        className={`grid gap-6 ${
          canSeeBudget ? "xl:grid-cols-4" : "lg:grid-cols-3"
        }`}
      >
        {canSeeTasks ? (
          <Card className="border-white/70 bg-white/85 shadow-[0_18px_60px_rgba(160,96,120,0.12)]">
            <CardHeader>
              <CardTitle className="font-display text-3xl text-[var(--color-ink)]">
                {messages.dashboard.overdueTasks}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredOverdueTasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-[1.5rem] bg-[var(--color-card-tint)]/70 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-display text-2xl text-[var(--color-ink)]">
                      {task.title}
                    </h3>
                    <span className="rounded-full bg-[#f3d4d4] px-3 py-1 text-xs uppercase tracking-[0.2em] text-[#9a3f3f]">
                      {messages.dashboard.overdue}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[#b45454]">
                    {messages.dashboard.overdueSince(
                      formatDate(task.dueDate, locale),
                    )}
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-muted-copy)]">
                    {messages.tasks.assignee}:{" "}
                    {messages.enums.taskAssignee[task.assignee]}
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
              {filteredOverdueTasks.length === 0 ? (
                <p className="text-sm text-[var(--color-muted-copy)]">
                  {messages.dashboard.noOverdueTasks}
                </p>
              ) : null}
            </CardContent>
          </Card>
        ) : null}
        {canSeeTasks ? (
          <Card className="border-white/70 bg-white/85 shadow-[0_18px_60px_rgba(160,96,120,0.12)]">
            <CardHeader>
              <CardTitle className="font-display text-3xl text-[var(--color-ink)]">
                {messages.dashboard.taskAttention}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredAttentionTasks.map((task) => (
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
                  <p
                    className={`mt-2 text-sm ${task.isOverdue ? "text-[#b45454]" : "text-[var(--color-muted-copy)]"}`}
                  >
                    {task.isOverdue
                      ? messages.dashboard.overdueSince(
                          formatDate(task.dueDate, locale),
                        )
                      : formatDate(task.dueDate, locale)}
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-muted-copy)]">
                    {messages.tasks.assignee}:{" "}
                    {messages.enums.taskAssignee[task.assignee]}
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
              {filteredAttentionTasks.length === 0 ? (
                <p className="text-sm text-[var(--color-muted-copy)]">
                  {messages.dashboard.noTaskAlerts}
                </p>
              ) : null}
            </CardContent>
          </Card>
        ) : null}
        <Card className="border-white/70 bg-white/85 shadow-[0_18px_60px_rgba(160,96,120,0.12)]">
          <CardHeader>
            <CardTitle className="font-display text-3xl text-[var(--color-ink)]">
              {messages.dashboard.vendorFollowUps}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredVendorFollowUps.map((vendor) => (
              <div
                key={vendor.id}
                className="rounded-[1.5rem] bg-[var(--color-card-tint)]/70 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-2xl text-[var(--color-ink)]">
                    {vendor.name}
                  </h3>
                  <span className="rounded-full bg-white px-3 py-1 text-xs uppercase tracking-[0.2em] text-[var(--color-dusty-rose)]">
                    {messages.enums.vendorStatus[vendor.status]}
                  </span>
                </div>
                <p className="mt-2 text-sm text-[var(--color-muted-copy)]">
                  {vendor.categoryName}
                </p>
                <p className="mt-1 text-sm text-[var(--color-muted-copy)]">
                  {messages.vendors.followUpLabel(
                    formatDate(vendor.followUpDate, locale),
                  )}
                </p>
                <p className="mt-1 text-sm text-[var(--color-muted-copy)]">
                  {messages.dashboard.ownerLabel(
                    vendor.owner || messages.dashboard.unassignedOwner,
                  )}
                </p>
                <div className="mt-4 flex justify-end">
                  <Link
                    href={`/vendors#vendor-${vendor.id}`}
                    className="rounded-full bg-white px-4 py-2 text-sm text-[var(--color-ink)]"
                  >
                    {messages.common.more}
                  </Link>
                </div>
              </div>
            ))}
            {filteredVendorFollowUps.length === 0 ? (
              <p className="text-sm text-[var(--color-muted-copy)]">
                {messages.dashboard.noVendorFollowUps}
              </p>
            ) : null}
          </CardContent>
        </Card>
        <Card className="border-white/70 bg-white/85 shadow-[0_18px_60px_rgba(160,96,120,0.12)]">
          <CardHeader>
            <CardTitle className="font-display text-3xl text-[var(--color-ink)]">
              {messages.dashboard.vendorsMissingContact}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredVendorsMissingContact.map((vendor) => (
              <div
                key={vendor.id}
                className="rounded-[1.5rem] bg-[var(--color-card-tint)]/70 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-2xl text-[var(--color-ink)]">
                    {vendor.name}
                  </h3>
                  <span className="rounded-full bg-white px-3 py-1 text-xs uppercase tracking-[0.2em] text-[var(--color-dusty-rose)]">
                    {vendor.categoryName}
                  </span>
                </div>
                <p className="mt-2 text-sm text-[var(--color-muted-copy)]">
                  {messages.dashboard.ownerLabel(
                    vendor.owner || messages.dashboard.unassignedOwner,
                  )}
                </p>
                <p className="mt-1 text-sm text-[var(--color-muted-copy)]">
                  {messages.dashboard.missingContactLabel(
                    vendor.hasEmail,
                    vendor.hasPhone,
                  )}
                </p>
                <div className="mt-4 flex justify-end">
                  <Link
                    href={`/vendors#vendor-${vendor.id}`}
                    className="rounded-full bg-white px-4 py-2 text-sm text-[var(--color-ink)]"
                  >
                    {messages.common.more}
                  </Link>
                </div>
              </div>
            ))}
            {filteredVendorsMissingContact.length === 0 ? (
              <p className="text-sm text-[var(--color-muted-copy)]">
                {messages.dashboard.noVendorsMissingContact}
              </p>
            ) : null}
          </CardContent>
        </Card>
        {canSeeBudget ? (
          <Card className="border-white/70 bg-white/85 shadow-[0_18px_60px_rgba(160,96,120,0.12)]">
            <CardHeader>
              <CardTitle className="font-display text-3xl text-[var(--color-ink)]">
                {messages.dashboard.paymentAlerts}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.paymentAlerts.map((expense) => (
                <div
                  key={expense.id}
                  className="rounded-[1.5rem] bg-[var(--color-card-tint)]/70 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-display text-2xl text-[var(--color-ink)]">
                      {expense.name}
                    </h3>
                    <span
                      className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em] ${
                        expense.isOverdue
                          ? "bg-[#f3d4d4] text-[#9a3f3f]"
                          : "bg-white text-[var(--color-dusty-rose)]"
                      }`}
                    >
                      {expense.isOverdue
                        ? messages.dashboard.overdue
                        : messages.dashboard.upcoming}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[var(--color-muted-copy)]">
                    {expense.vendorName
                      ? messages.budget.vendorLabel(expense.vendorName)
                      : messages.budget.noVendor}
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-muted-copy)]">
                    {messages.budget.dueDateLabel(
                      formatDate(expense.dueDate, locale),
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
              {data.paymentAlerts.length === 0 ? (
                <p className="text-sm text-[var(--color-muted-copy)]">
                  {messages.dashboard.noPaymentAlerts}
                </p>
              ) : null}
            </CardContent>
          </Card>
        ) : null}
      </div>
      {canSeeBudget ? (
        <Card className="border-white/70 bg-white/85 shadow-[0_18px_60px_rgba(160,96,120,0.12)]">
          <CardHeader>
            <CardTitle className="font-display text-3xl text-[var(--color-ink)]">
              {messages.dashboard.upcomingPayments}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-2">
            {data.upcomingPayments.map((expense) => (
              <div
                key={expense.id}
                className="rounded-[1.5rem] bg-[var(--color-card-tint)]/70 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-2xl text-[var(--color-ink)]">
                    {expense.name}
                  </h3>
                  <span className="rounded-full bg-white px-3 py-1 text-xs uppercase tracking-[0.2em] text-[var(--color-dusty-rose)]">
                    {messages.dashboard.upcoming}
                  </span>
                </div>
                <p className="mt-2 text-sm text-[var(--color-muted-copy)]">
                  {expense.vendorName
                    ? messages.budget.vendorLabel(expense.vendorName)
                    : messages.budget.noVendor}
                </p>
                <p className="mt-1 text-sm text-[var(--color-muted-copy)]">
                  {messages.budget.dueDateLabel(
                    formatDate(expense.dueDate, locale),
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
            {data.upcomingPayments.length === 0 ? (
              <p className="text-sm text-[var(--color-muted-copy)]">
                {messages.dashboard.noUpcomingPayments}
              </p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
      <Card className="border-white/70 bg-white/85 shadow-[0_18px_60px_rgba(160,96,120,0.12)]">
        <CardHeader>
          <CardTitle className="font-display text-3xl text-[var(--color-ink)]">
            {messages.dashboard.decisionQueue}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredDecisionQueue.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="block rounded-[1.5rem] bg-[var(--color-card-tint)]/70 p-4"
            >
              <h3 className="font-display text-2xl text-[var(--color-ink)]">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-[var(--color-muted-copy)]">
                {item.detail}
              </p>
            </Link>
          ))}
          {filteredDecisionQueue.length === 0 ? (
            <p className="text-sm text-[var(--color-muted-copy)]">
              {messages.dashboard.noDecisionQueue}
            </p>
          ) : null}
        </CardContent>
      </Card>
      <Card className="border-white/70 bg-white/85 shadow-[0_18px_60px_rgba(160,96,120,0.12)]">
        <CardHeader>
          <CardTitle className="font-display text-3xl text-[var(--color-ink)]">
            {messages.dashboard.activityFeed}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredActivityFeed.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="block rounded-[1.5rem] bg-[var(--color-card-tint)]/70 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-display text-2xl text-[var(--color-ink)]">
                  {item.title}
                </h3>
                <span className="rounded-full bg-white px-3 py-1 text-xs uppercase tracking-[0.2em] text-[var(--color-dusty-rose)]">
                  {messages.dashboard.activityTypes[item.type]}
                </span>
              </div>
              <p className="mt-2 text-sm text-[var(--color-muted-copy)]">
                {item.detail}
              </p>
              <p className="mt-1 text-sm text-[var(--color-muted-copy)]">
                {formatDate(item.updatedAt, locale)}{" "}
                {formatTime(item.updatedAt, locale)}
              </p>
            </Link>
          ))}
          {filteredActivityFeed.length === 0 ? (
            <p className="text-sm text-[var(--color-muted-copy)]">
              {messages.dashboard.noActivityForResponsibility}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};
