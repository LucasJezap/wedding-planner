"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { useLocale } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type {
  PublicGuestLookupView,
  PublicWeddingView,
} from "@/features/public/types/public";
import { apiClient } from "@/lib/api-client";
import { formatDateTime } from "@/lib/format";

type PublicRsvpFormState = {
  status: "ATTENDING" | "DECLINED";
  guestCount: number;
  attendingChildren: number;
  plusOneName: string;
  mealChoice: string;
  dietaryNotes: string;
  needsAccommodation: boolean;
  transportToVenue: boolean;
  transportFromVenue: boolean;
  message: string;
};

const emptyRsvpForm: PublicRsvpFormState = {
  status: "ATTENDING",
  guestCount: 1,
  attendingChildren: 0,
  plusOneName: "",
  mealChoice: "",
  dietaryNotes: "",
  needsAccommodation: false,
  transportToVenue: false,
  transportFromVenue: false,
  message: "",
};

const Countdown = ({ targetDate }: { targetDate: string }) => {
  const { messages } = useLocale();
  const [remaining, setRemaining] = useState({ days: 0, hours: 0, minutes: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = Math.max(0, new Date(targetDate).getTime() - Date.now());
      setRemaining({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
      });
    };
    calc();
    const interval = setInterval(calc, 60_000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="flex gap-6 text-center">
      <div>
        <p className="font-display text-5xl text-[var(--color-ink)]">
          {remaining.days}
        </p>
        <p className="text-sm text-[var(--color-muted-copy)]">
          {messages.publicSite.days}
        </p>
      </div>
      <div>
        <p className="font-display text-5xl text-[var(--color-ink)]">
          {remaining.hours}
        </p>
        <p className="text-sm text-[var(--color-muted-copy)]">
          {messages.publicSite.hours}
        </p>
      </div>
      <div>
        <p className="font-display text-5xl text-[var(--color-ink)]">
          {remaining.minutes}
        </p>
        <p className="text-sm text-[var(--color-muted-copy)]">
          {messages.publicSite.minutes}
        </p>
      </div>
    </div>
  );
};

const isRateLimitError = (message: string) => {
  const normalized = message.toLowerCase();
  return normalized.includes("limit") || normalized.includes("too many");
};

const floralPanels = [
  "bg-[linear-gradient(160deg,rgba(255,255,255,0.9),rgba(255,243,247,0.82),rgba(255,248,232,0.84))]",
  "bg-[linear-gradient(135deg,rgba(255,255,255,0.88),rgba(244,247,255,0.82),rgba(255,240,246,0.78))]",
  "bg-[linear-gradient(135deg,rgba(255,255,255,0.86),rgba(245,255,244,0.82),rgba(255,249,233,0.8))]",
  "bg-[linear-gradient(135deg,rgba(255,255,255,0.86),rgba(255,245,228,0.8),rgba(255,255,255,0.78))]",
];

export const PublicSite = ({
  initialData,
  adminHref,
  adminLabel,
}: {
  initialData: PublicWeddingView;
  adminHref: string;
  adminLabel: string;
}) => {
  const { locale, messages } = useLocale();
  const [data] = useState(initialData);
  const [token, setToken] = useState("");
  const [form, setForm] = useState<PublicRsvpFormState>(emptyRsvpForm);
  const [guest, setGuest] = useState<PublicGuestLookupView | null>(null);
  const [confirmation, setConfirmation] = useState("");
  const [lookupError, setLookupError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [lookupPending, setLookupPending] = useState(false);
  const [submitPending, setSubmitPending] = useState(false);
  const isAttending = form.status === "ATTENDING";
  const isDeadlinePassed = Date.now() > new Date(data.rsvpDeadline).getTime();

  const logisticsById = useMemo(
    () =>
      new Map(data.logistics.map((item) => [item.id, item.content] as const)),
    [data.logistics],
  );
  const confirmedGuests =
    guest?.invitationGroup?.members.length ?? Math.max(form.guestCount, 1);
  const childrenCount = form.attendingChildren;
  const transportSummary = [
    form.transportToVenue ? messages.publicSite.transportToVenue : "",
    form.transportFromVenue ? messages.publicSite.transportFromVenue : "",
  ].filter(Boolean);

  const getLookupErrorMessage = (message: string) => {
    if (message === "Guest not found") {
      return messages.publicSite.tokenError;
    }
    if (isRateLimitError(message)) {
      return messages.publicSite.rateLimitError;
    }
    return messages.publicSite.lookupFailed;
  };

  const getSubmitErrorMessage = (message: string) => {
    if (message === "RSVP deadline passed") {
      return messages.publicSite.deadlinePassed;
    }
    if (isRateLimitError(message)) {
      return messages.publicSite.rateLimitError;
    }
    if (message === "Guest not found") {
      return messages.publicSite.tokenError;
    }
    return messages.publicSite.submitFailed;
  };

  const practicalInfo = [
    logisticsById.get("parking")
      ? {
          id: "parking",
          title: messages.publicSite.logisticsLabels.parking,
          content: logisticsById.get("parking")!,
        }
      : null,
    logisticsById.get("transport")
      ? {
          id: "transport",
          title: messages.publicSite.logisticsLabels.transport,
          content: logisticsById.get("transport")!,
        }
      : null,
    logisticsById.get("coordinator")
      ? {
          id: "coordinator",
          title: messages.publicSite.logisticsLabels.coordinator,
          content: logisticsById.get("coordinator")!,
        }
      : null,
    data.recommendedArrivalTime
      ? {
          id: "arrival",
          title: messages.publicSite.recommendedArrival,
          content: formatDateTime(data.recommendedArrivalTime, locale),
        }
      : null,
  ].filter((item): item is NonNullable<typeof item> => Boolean(item));

  const handleLookup = async () => {
    if (lookupPending || !token.trim()) {
      return;
    }

    setLookupPending(true);
    setLookupError("");
    setSubmitError("");
    setConfirmation("");

    try {
      const response = await apiClient<PublicGuestLookupView>(
        "/api/public/lookup",
        {
          method: "POST",
          body: JSON.stringify({ token }),
        },
      );
      setGuest(response);
      setForm({
        status: response.guest.status === "DECLINED" ? "DECLINED" : "ATTENDING",
        guestCount: response.guest.guestCount,
        attendingChildren: response.guest.attendingChildren,
        plusOneName: response.guest.plusOneName,
        mealChoice: response.guest.mealChoice,
        dietaryNotes: response.guest.dietaryNotes,
        needsAccommodation: response.guest.needsAccommodation,
        transportToVenue: response.guest.transportToVenue,
        transportFromVenue: response.guest.transportFromVenue,
        message: response.guest.message,
      });
    } catch (error) {
      setGuest(null);
      setForm(emptyRsvpForm);
      setLookupError(
        getLookupErrorMessage(
          error instanceof Error ? error.message : "Unexpected error",
        ),
      );
    } finally {
      setLookupPending(false);
    }
  };

  const handleSubmit = async () => {
    if (!guest || submitPending || isDeadlinePassed) {
      return;
    }

    setSubmitPending(true);
    setSubmitError("");
    setConfirmation("");

    try {
      const response = await apiClient<PublicGuestLookupView>(
        "/api/public/rsvp",
        {
          method: "POST",
          body: JSON.stringify({
            token,
            ...form,
          }),
        },
      );
      setGuest(response);
      setForm({
        status: response.guest.status === "DECLINED" ? "DECLINED" : "ATTENDING",
        guestCount: response.guest.guestCount,
        attendingChildren: response.guest.attendingChildren,
        plusOneName: response.guest.plusOneName,
        mealChoice: response.guest.mealChoice,
        dietaryNotes: response.guest.dietaryNotes,
        needsAccommodation: response.guest.needsAccommodation,
        transportToVenue: response.guest.transportToVenue,
        transportFromVenue: response.guest.transportFromVenue,
        message: response.guest.message,
      });
      setConfirmation(messages.publicSite.confirmation);
    } catch (error) {
      setSubmitError(
        getSubmitErrorMessage(
          error instanceof Error ? error.message : "Unexpected error",
        ),
      );
    } finally {
      setSubmitPending(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#fbf7f4_0%,#f7ede8_55%,#fbf8f5_100%)] px-4 py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-6rem] top-[-3rem] h-56 w-56 rounded-full bg-[#d89bae]/16 blur-3xl" />
        <div className="absolute right-[-2rem] top-24 h-64 w-64 rounded-full bg-[#edb8a8]/18 blur-3xl" />
        <div className="absolute left-[18%] top-[24rem] h-48 w-48 rounded-full bg-[#c8bde9]/12 blur-3xl" />
        <div className="absolute bottom-24 right-[14%] h-72 w-72 rounded-full bg-[#f4dcc4]/18 blur-3xl" />
        <div className="absolute bottom-[-4rem] left-[10%] h-64 w-64 rounded-full bg-[#dce8af]/14 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <a
            href="/api/public/calendar"
            className="inline-flex h-10 items-center justify-center rounded-full border border-white/70 bg-white/75 px-4 text-sm font-medium text-[var(--color-ink)] shadow-[0_10px_35px_rgba(49,72,216,0.08)] backdrop-blur transition-colors hover:bg-white"
          >
            {messages.publicSite.exportCalendar}
          </a>
          <LocaleSwitcher />
          <Link
            href={adminHref}
            className="inline-flex h-10 items-center justify-center rounded-full border border-white/70 bg-white/75 px-4 text-sm font-medium text-[var(--color-ink)] shadow-[0_10px_35px_rgba(49,72,216,0.08)] backdrop-blur transition-colors hover:bg-white"
          >
            {adminLabel}
          </Link>
        </div>

        <section className="relative overflow-hidden rounded-[2.8rem] border border-white/80 bg-[linear-gradient(160deg,rgba(255,255,255,0.92),rgba(255,243,247,0.82),rgba(255,248,232,0.84))] p-8 shadow-[0_35px_140px_rgba(155,90,116,0.12)] backdrop-blur sm:p-12">
          <div className="pointer-events-none absolute inset-0 opacity-80">
            <div className="absolute -left-8 top-16 h-36 w-36 rounded-full border border-[#edb8a8]/20 bg-[#edb8a8]/14" />
            <div className="absolute left-20 top-6 h-24 w-24 rounded-full border border-[#f4dcc4]/20 bg-[#f4dcc4]/18" />
            <div className="absolute right-12 top-10 h-40 w-40 rounded-full border border-[#d89bae]/20 bg-[#d89bae]/12" />
            <div className="absolute bottom-6 right-40 h-24 w-24 rounded-full border border-[#c8bde9]/20 bg-[#c8bde9]/10" />
          </div>
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm uppercase tracking-[0.4em] text-[var(--color-dusty-rose)]">
                {messages.publicSite.eyebrow}
              </p>
              <h1 className="mt-4 font-display text-6xl text-[var(--color-ink)] sm:text-7xl">
                {data.wedding.title}
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-[var(--color-muted-copy)]">
                {messages.publicSite.description.replace("{venue}", data.venue)}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:max-w-[26rem]">
              <div className="rounded-[1.6rem] border border-white/70 bg-white/78 px-5 py-4 shadow-[0_18px_50px_rgba(155,90,116,0.08)] backdrop-blur">
                <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-dusty-rose)]">
                  {messages.publicSite.rsvpDeadline}
                </p>
                <p className="mt-2 text-sm font-medium text-[var(--color-ink)]">
                  {formatDateTime(data.rsvpDeadline, locale)}
                </p>
              </div>
              <div className="rounded-[1.6rem] border border-white/70 bg-white/78 px-5 py-4 shadow-[0_18px_50px_rgba(155,90,116,0.08)] backdrop-blur">
                <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-dusty-rose)]">
                  {messages.publicSite.map}
                </p>
                <p className="mt-2 text-sm font-medium text-[var(--color-ink)]">
                  {data.venue}
                </p>
              </div>
              <div className="rounded-[1.8rem] border border-[#3b2f34]/8 bg-[linear-gradient(160deg,rgba(255,255,255,0.88),rgba(255,243,247,0.78),rgba(255,248,232,0.8))] px-5 py-5 shadow-[0_18px_50px_rgba(155,90,116,0.08)] backdrop-blur sm:col-span-2">
                <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-dusty-rose)]">
                  {messages.publicSite.moodLabel}
                </p>
                <p className="mt-3 font-display text-3xl leading-tight text-[var(--color-ink)]">
                  {messages.publicSite.moodStatement}
                </p>
              </div>
            </div>
          </div>
        </section>

        <Card className="border-white/70 bg-white/85 shadow-[0_20px_80px_rgba(155,90,116,0.08)]">
          <CardContent className="flex flex-col items-center gap-4 p-6">
            <h2 className="font-display text-4xl text-[var(--color-ink)]">
              {messages.publicSite.countdown}
            </h2>
            <p className="text-sm text-[var(--color-muted-copy)]">
              {data.coupleNames}
            </p>
            <Countdown targetDate={data.ceremonyDate} />
          </CardContent>
        </Card>

        {(data.aboutText || data.dressCode) && (
          <Card className="border-white/70 bg-white/85 shadow-[0_20px_80px_rgba(155,90,116,0.08)]">
            <CardContent className="space-y-4 p-6">
              {data.aboutText && (
                <>
                  <h2 className="font-display text-4xl text-[var(--color-ink)]">
                    {messages.publicSite.about}
                  </h2>
                  <p className="leading-7 text-[var(--color-muted-copy)]">
                    {data.aboutText}
                  </p>
                </>
              )}
              {data.dressCode && (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-[var(--color-ink)]">
                    {messages.publicSite.dressCode}:
                  </span>
                  <span className="inline-flex items-center rounded-full bg-[var(--color-card-tint)] px-3 py-1 text-sm text-[var(--color-dusty-rose)]">
                    {data.dressCode}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {practicalInfo.length > 0 ? (
          <Card className="border-white/70 bg-white/85 shadow-[0_22px_90px_rgba(155,90,116,0.08)]">
            <CardContent className="space-y-4 p-6">
              <h2 className="font-display text-4xl text-[var(--color-ink)]">
                {messages.publicSite.practicalInfo}
              </h2>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {practicalInfo.map((item, index) => (
                  <div
                    key={item.id}
                    className={`rounded-[1.6rem] border border-white/70 p-4 shadow-[0_16px_40px_rgba(59,47,52,0.05)] ${
                      floralPanels[index % floralPanels.length]
                    }`}
                  >
                    <h3 className="font-display text-2xl text-[var(--color-ink)]">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--color-muted-copy)]">
                      {item.content}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}

        {data.logistics.length > 0 ? (
          <Card className="border-white/70 bg-white/85 shadow-[0_22px_90px_rgba(155,90,116,0.08)]">
            <CardContent className="space-y-4 p-6">
              <h2 className="font-display text-4xl text-[var(--color-ink)]">
                {messages.publicSite.logistics}
              </h2>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {data.logistics.map((item, index) => (
                  <div
                    key={item.id}
                    className={`rounded-[1.6rem] border border-white/70 p-4 shadow-[0_16px_40px_rgba(59,47,52,0.05)] ${
                      floralPanels[index % floralPanels.length]
                    }`}
                  >
                    <h3 className="font-display text-2xl text-[var(--color-ink)]">
                      {messages.publicSite.logisticsLabels[item.id]}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--color-muted-copy)]">
                      {item.content}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="border-white/70 bg-white/85 shadow-[0_24px_90px_rgba(155,90,116,0.08)]">
            <CardContent className="space-y-4 p-6">
              <h2 className="font-display text-4xl text-[var(--color-ink)]">
                {messages.publicSite.schedule}
              </h2>
              {data.timeline.map((event, index) => (
                <div
                  key={event.id}
                  className={`rounded-[1.6rem] border border-white/70 p-4 shadow-[0_16px_40px_rgba(59,47,52,0.05)] ${
                    floralPanels[index % floralPanels.length]
                  }`}
                >
                  <p className="text-sm uppercase tracking-[0.25em] text-[var(--color-dusty-rose)]">
                    {formatDateTime(event.startsAt, locale)}
                  </p>
                  <h3 className="mt-2 font-display text-3xl text-[var(--color-ink)]">
                    {event.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-ink)]">
                    {event.description}
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-muted-copy)]">
                    {event.location}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/70 bg-white/85 shadow-[0_30px_110px_rgba(155,90,116,0.08)]">
            <CardContent className="space-y-5 p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-4xl text-[var(--color-ink)]">
                  {messages.publicSite.rsvp}
                </h2>
                <div className="flex gap-2 text-xs uppercase tracking-[0.2em]">
                  <span className="rounded-full bg-[var(--color-card-tint)] px-3 py-1 text-[var(--color-ink)]">
                    {messages.publicSite.stepOne}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 ${
                      guest
                        ? "bg-[var(--color-ink)] text-white"
                        : "bg-[var(--color-card-tint)] text-[var(--color-muted-copy)]"
                    }`}
                  >
                    {messages.publicSite.stepTwo}
                  </span>
                </div>
              </div>

              <div className="rounded-[1.7rem] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.7),rgba(255,244,229,0.72),rgba(255,237,244,0.72))] p-4 shadow-[0_16px_45px_rgba(255,122,33,0.08)]">
                <p className="text-sm font-medium text-[var(--color-ink)]">
                  {messages.publicSite.stepOneTitle}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--color-muted-copy)]">
                  {messages.publicSite.lookupHelp}
                </p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <Input
                    value={token}
                    onChange={(event) => {
                      setToken(event.target.value);
                      setLookupError("");
                      setSubmitError("");
                      setConfirmation("");
                    }}
                    placeholder={messages.publicSite.tokenPlaceholder}
                    disabled={lookupPending}
                  />
                  <Button
                    variant="outline"
                    className="rounded-full border-white/80 bg-white/80"
                    onClick={() => void handleLookup()}
                    disabled={lookupPending || !token.trim()}
                  >
                    {lookupPending
                      ? messages.publicSite.lookupLoading
                      : messages.publicSite.lookup}
                  </Button>
                </div>
                {lookupError ? (
                  <p className="mt-3 text-sm text-red-600">{lookupError}</p>
                ) : null}
              </div>

              {isDeadlinePassed ? (
                <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  {messages.publicSite.deadlinePassed}
                </div>
              ) : (
                <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                  {messages.publicSite.deadlineReminder.replace(
                    "{date}",
                    formatDateTime(data.rsvpDeadline, locale),
                  )}
                </div>
              )}

              {guest ? (
                <>
                  <div className="space-y-3 rounded-[1.7rem] border border-white/70 bg-[linear-gradient(135deg,rgba(255,244,229,0.76),rgba(255,255,255,0.78),rgba(255,237,244,0.78))] p-4 shadow-[0_18px_50px_rgba(233,60,172,0.08)]">
                    <div>
                      <p className="text-sm uppercase tracking-[0.25em] text-[var(--color-dusty-rose)]">
                        {messages.publicSite.stepTwoTitle}
                      </p>
                      <h3 className="mt-2 font-display text-3xl text-[var(--color-ink)]">
                        {guest.guest.name}
                      </h3>
                      <p className="mt-2 text-sm text-[var(--color-muted-copy)]">
                        {messages.publicSite.currentStatus}{" "}
                        {messages.enums.rsvpStatus[guest.guest.status]}
                      </p>
                    </div>
                    {guest.invitationGroup ? (
                      <div className="rounded-[1.35rem] border border-white/70 bg-white/76 p-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-dusty-rose)]">
                          {messages.publicSite.invitationGroup}
                        </p>
                        <h4 className="mt-2 font-display text-2xl text-[var(--color-ink)]">
                          {guest.invitationGroup.name}
                        </h4>
                        <p className="mt-2 text-sm text-[var(--color-muted-copy)]">
                          {messages.publicSite.invitationGroupHelp}
                        </p>
                        <div className="mt-3 space-y-2">
                          {guest.invitationGroup.members.map((member) => (
                            <div
                              key={member.id}
                              className="flex items-center justify-between gap-3 text-sm text-[var(--color-ink)]"
                            >
                              <span>{member.name}</span>
                              <span className="text-[var(--color-muted-copy)]">
                                {messages.enums.rsvpStatus[member.status]}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      className={`rounded-[1.7rem] border px-4 py-4 text-left shadow-[0_12px_34px_rgba(59,47,52,0.05)] transition-colors ${
                        isAttending
                          ? "border-[#4c9a32]/30 bg-[linear-gradient(135deg,rgba(76,154,50,0.14),rgba(255,255,255,0.85))] text-emerald-950"
                          : "border-white/70 bg-white/65 text-[var(--color-ink)]"
                      }`}
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          status: "ATTENDING",
                        }))
                      }
                    >
                      <p className="font-medium">
                        {messages.enums.rsvpStatus.ATTENDING}
                      </p>
                      <p className="mt-1 text-sm opacity-80">
                        {messages.publicSite.attendingHelp}
                      </p>
                    </button>
                    <button
                      type="button"
                      className={`rounded-[1.7rem] border px-4 py-4 text-left shadow-[0_12px_34px_rgba(59,47,52,0.05)] transition-colors ${
                        !isAttending
                          ? "border-[#e93cac]/30 bg-[linear-gradient(135deg,rgba(233,60,172,0.14),rgba(255,255,255,0.85))] text-rose-950"
                          : "border-white/70 bg-white/65 text-[var(--color-ink)]"
                      }`}
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          status: "DECLINED",
                        }))
                      }
                    >
                      <p className="font-medium">
                        {messages.enums.rsvpStatus.DECLINED}
                      </p>
                      <p className="mt-1 text-sm opacity-80">
                        {messages.publicSite.declinedHelp}
                      </p>
                    </button>
                  </div>

                  {isAttending ? (
                    <div className="grid gap-3">
                      <div className="rounded-[1.35rem] border border-white/70 bg-[linear-gradient(135deg,rgba(247,201,41,0.14),rgba(255,255,255,0.8),rgba(76,154,50,0.1))] p-4">
                        <p className="text-sm font-medium text-[var(--color-ink)]">
                          {messages.publicSite.confirmedGuestsLabel}
                        </p>
                        <p className="mt-1 text-sm text-[var(--color-muted-copy)]">
                          {messages.publicSite.groupConfirmationHelp.replace(
                            "{count}",
                            String(confirmedGuests),
                          )}
                        </p>
                      </div>
                      <label className="space-y-2 text-sm text-[var(--color-ink)]">
                        <span>{messages.publicSite.mealChoice}</span>
                        <Input
                          value={form.mealChoice}
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              mealChoice: event.target.value,
                            }))
                          }
                          placeholder={
                            messages.publicSite.mealChoicePlaceholder
                          }
                        />
                      </label>
                      <label className="space-y-2 text-sm text-[var(--color-ink)]">
                        <span>{messages.publicSite.dietaryNotes}</span>
                        <textarea
                          className="min-h-24 w-full rounded-xl border bg-white/88 px-3 py-2 text-sm"
                          value={form.dietaryNotes}
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              dietaryNotes: event.target.value,
                            }))
                          }
                          placeholder={
                            messages.publicSite.dietaryNotesPlaceholder
                          }
                        />
                      </label>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="flex items-center gap-3 rounded-[1.1rem] border border-white/70 bg-white/78 px-4 py-3 text-sm text-[var(--color-ink)] shadow-[0_10px_30px_rgba(59,47,52,0.04)]">
                          <input
                            type="checkbox"
                            checked={form.needsAccommodation}
                            onChange={(event) =>
                              setForm((current) => ({
                                ...current,
                                needsAccommodation: event.target.checked,
                              }))
                            }
                          />
                          <span>{messages.publicSite.needsAccommodation}</span>
                        </label>
                        <label className="flex items-center gap-3 rounded-[1.1rem] border border-white/70 bg-white/78 px-4 py-3 text-sm text-[var(--color-ink)] shadow-[0_10px_30px_rgba(59,47,52,0.04)]">
                          <input
                            type="checkbox"
                            checked={form.transportToVenue}
                            onChange={(event) =>
                              setForm((current) => ({
                                ...current,
                                transportToVenue: event.target.checked,
                              }))
                            }
                          />
                          <span>{messages.publicSite.transportToVenue}</span>
                        </label>
                        <label className="flex items-center gap-3 rounded-[1.1rem] border border-white/70 bg-white/78 px-4 py-3 text-sm text-[var(--color-ink)] shadow-[0_10px_30px_rgba(59,47,52,0.04)] sm:col-span-2">
                          <input
                            type="checkbox"
                            checked={form.transportFromVenue}
                            onChange={(event) =>
                              setForm((current) => ({
                                ...current,
                                transportFromVenue: event.target.checked,
                              }))
                            }
                          />
                          <span>{messages.publicSite.transportFromVenue}</span>
                        </label>
                      </div>
                    </div>
                  ) : null}

                  <label className="space-y-2 text-sm text-[var(--color-ink)]">
                    <span>{messages.publicSite.messageToCouple}</span>
                    <textarea
                      className="min-h-24 w-full rounded-xl border bg-white/88 px-3 py-2 text-sm"
                      value={form.message}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          message: event.target.value,
                        }))
                      }
                      placeholder={messages.publicSite.messagePlaceholder}
                    />
                  </label>

                  <div className="rounded-[1.7rem] border border-white/70 bg-[linear-gradient(135deg,rgba(49,72,216,0.08),rgba(255,255,255,0.84),rgba(233,60,172,0.08))] p-4 shadow-[0_16px_45px_rgba(49,72,216,0.08)]">
                    <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-dusty-rose)]">
                      {messages.publicSite.summaryTitle}
                    </p>
                    <div className="mt-3 space-y-2 text-sm text-[var(--color-ink)]">
                      <p>
                        {messages.publicSite.summaryGuests.replace(
                          "{count}",
                          String(confirmedGuests),
                        )}
                      </p>
                      {isAttending ? (
                        <>
                          <p>
                            {childrenCount > 0
                              ? messages.publicSite.summaryChildren.replace(
                                  "{count}",
                                  String(childrenCount),
                                )
                              : messages.publicSite.summaryChildrenNone}
                          </p>
                          <p>
                            {transportSummary.length > 0
                              ? messages.publicSite.summaryTransport.replace(
                                  "{value}",
                                  transportSummary.join(", "),
                                )
                              : messages.publicSite.summaryTransportNone}
                          </p>
                        </>
                      ) : (
                        <p>{messages.publicSite.summaryDeclined}</p>
                      )}
                    </div>
                  </div>

                  <Button
                    className="rounded-full bg-[linear-gradient(135deg,#ff7a21,#e93cac)] px-5 text-white shadow-[0_14px_30px_rgba(233,60,172,0.28)] hover:opacity-95"
                    onClick={() => void handleSubmit()}
                    disabled={!guest || submitPending || isDeadlinePassed}
                  >
                    {submitPending
                      ? messages.publicSite.submitLoading
                      : messages.publicSite.submit}
                  </Button>
                  {confirmation ? (
                    <p className="text-sm text-emerald-700">{confirmation}</p>
                  ) : null}
                  {submitError ? (
                    <p className="text-sm text-red-600">{submitError}</p>
                  ) : null}
                </>
              ) : null}
            </CardContent>
          </Card>
        </div>

        {data.faqItems.length > 0 && (
          <Card className="border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.88),rgba(245,248,255,0.82),rgba(255,244,229,0.78))] shadow-[0_20px_80px_rgba(49,72,216,0.07)]">
            <CardContent className="space-y-4 p-6">
              <h2 className="font-display text-4xl text-[var(--color-ink)]">
                {messages.publicSite.faq}
              </h2>
              <Accordion className="w-full">
                {data.faqItems.map((item, index) => (
                  <AccordionItem key={index} value={`faq-${index}`}>
                    <AccordionTrigger className="text-left text-[var(--color-ink)]">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-[var(--color-muted-copy)]">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        )}

        {data.venue && (
          <Card className="border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.88),rgba(255,240,246,0.8),rgba(255,249,233,0.78))] shadow-[0_22px_80px_rgba(255,122,33,0.08)]">
            <CardContent className="flex items-center justify-between p-6">
              <h2 className="font-display text-4xl text-[var(--color-ink)]">
                {messages.publicSite.map}
              </h2>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.venue)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center justify-center rounded-full border border-white/70 bg-white/80 px-4 text-sm font-medium text-[var(--color-ink)] shadow-[0_10px_35px_rgba(255,122,33,0.1)] transition-colors hover:bg-white"
              >
                {messages.publicSite.viewOnMap}
              </a>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
};
