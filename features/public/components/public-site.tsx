"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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
  status: "ATTENDING" | "DECLINED" | "PENDING";
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
  const [error, setError] = useState("");
  const isAttending = form.status === "ATTENDING";

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_rgba(255,248,245,0.96),_rgba(252,238,235,0.96),_rgba(244,233,223,0.95))] px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <a
            href="/api/public/calendar"
            className="inline-flex h-10 items-center justify-center rounded-full border border-white/70 bg-white/80 px-4 text-sm font-medium text-[var(--color-ink)] shadow-sm transition-colors hover:bg-white"
          >
            {messages.publicSite.exportCalendar}
          </a>
          <LocaleSwitcher />
          <Link
            href={adminHref}
            className="inline-flex h-10 items-center justify-center rounded-full border border-white/70 bg-white/80 px-4 text-sm font-medium text-[var(--color-ink)] shadow-sm transition-colors hover:bg-white"
          >
            {adminLabel}
          </Link>
        </div>

        {/* Hero */}
        <section className="rounded-[2.5rem] border border-white/80 bg-white/80 p-8 shadow-[0_30px_120px_rgba(155,90,116,0.15)] backdrop-blur sm:p-12">
          <p className="text-sm uppercase tracking-[0.4em] text-[var(--color-dusty-rose)]">
            {messages.publicSite.eyebrow}
          </p>
          <h1 className="mt-4 font-display text-6xl text-[var(--color-ink)] sm:text-7xl">
            {data.wedding.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-[var(--color-muted-copy)]">
            {messages.publicSite.description.replace("{venue}", data.venue)}
          </p>
        </section>

        {/* Countdown */}
        <Card className="border-white/70 bg-white/85">
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

        {/* About & Dress Code */}
        {(data.aboutText || data.dressCode) && (
          <Card className="border-white/70 bg-white/85">
            <CardContent className="space-y-4 p-6">
              {data.aboutText && (
                <>
                  <h2 className="font-display text-4xl text-[var(--color-ink)]">
                    {messages.publicSite.about}
                  </h2>
                  <p className="text-[var(--color-muted-copy)] leading-7">
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

        {data.logistics.length > 0 ? (
          <Card className="border-white/70 bg-white/85">
            <CardContent className="space-y-4 p-6">
              <h2 className="font-display text-4xl text-[var(--color-ink)]">
                {messages.publicSite.logistics}
              </h2>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {data.logistics.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[1.5rem] bg-[var(--color-card-tint)]/75 p-4"
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

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Schedule */}
          <Card className="border-white/70 bg-white/85">
            <CardContent className="space-y-4 p-6">
              <h2 className="font-display text-4xl text-[var(--color-ink)]">
                {messages.publicSite.schedule}
              </h2>
              {data.timeline.map((event) => (
                <div
                  key={event.id}
                  className="rounded-[1.5rem] bg-[var(--color-card-tint)]/75 p-4"
                >
                  <p className="text-sm uppercase tracking-[0.25em] text-[var(--color-dusty-rose)]">
                    {formatDateTime(event.startsAt, locale)}
                  </p>
                  <h3 className="mt-2 font-display text-3xl text-[var(--color-ink)]">
                    {event.title}
                  </h3>
                  <p className="mt-1 text-sm text-[var(--color-muted-copy)]">
                    {event.location}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* RSVP */}
          <Card className="border-white/70 bg-white/85">
            <CardContent className="space-y-4 p-6">
              <h2 className="font-display text-4xl text-[var(--color-ink)]">
                {messages.publicSite.rsvp}
              </h2>
              <p className="text-sm leading-6 text-[var(--color-muted-copy)]">
                {messages.publicSite.lookupHelp}
              </p>
              <Input
                value={token}
                onChange={(event) => {
                  setToken(event.target.value);
                  setError("");
                  setConfirmation("");
                }}
                placeholder={messages.publicSite.tokenPlaceholder}
              />
              <Button
                variant="outline"
                className="rounded-full"
                onClick={async () => {
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
                      status: response.guest.status,
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
                    setError("");
                    setConfirmation("");
                  } catch {
                    setGuest(null);
                    setForm(emptyRsvpForm);
                    setError(messages.publicSite.tokenError);
                  }
                }}
              >
                {messages.publicSite.lookup}
              </Button>
              {guest ? (
                <div className="space-y-3 rounded-[1.5rem] bg-[var(--color-card-tint)]/75 p-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.25em] text-[var(--color-dusty-rose)]">
                      {messages.publicSite.personalizedGuest}
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
                    <div className="rounded-[1.25rem] bg-white/70 p-4">
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
              ) : null}
              <select
                className="h-10 w-full rounded-xl border px-3"
                value={form.status}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    status: event.target.value as
                      | "ATTENDING"
                      | "DECLINED"
                      | "PENDING",
                  }))
                }
                disabled={!guest}
                aria-label={messages.publicSite.rsvpStatus}
              >
                <option value="ATTENDING">
                  {messages.enums.rsvpStatus.ATTENDING}
                </option>
                <option value="DECLINED">
                  {messages.enums.rsvpStatus.DECLINED}
                </option>
                <option value="PENDING">
                  {messages.enums.rsvpStatus.PENDING}
                </option>
              </select>
              {guest ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-2 text-sm text-[var(--color-ink)]">
                    <span>{messages.publicSite.guestCount}</span>
                    <select
                      className="h-10 w-full rounded-xl border px-3"
                      value={form.guestCount}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          guestCount: Number(event.target.value),
                        }))
                      }
                      disabled={!isAttending}
                      aria-label={messages.publicSite.guestCount}
                    >
                      {[1, 2, 3, 4, 5, 6].map((count) => (
                        <option key={count} value={count}>
                          {count}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2 text-sm text-[var(--color-ink)]">
                    <span>{messages.publicSite.attendingChildren}</span>
                    <select
                      className="h-10 w-full rounded-xl border px-3"
                      value={form.attendingChildren}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          attendingChildren: Number(event.target.value),
                        }))
                      }
                      disabled={!isAttending}
                      aria-label={messages.publicSite.attendingChildren}
                    >
                      {[0, 1, 2, 3, 4].map((count) => (
                        <option key={count} value={count}>
                          {count}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2 text-sm text-[var(--color-ink)] sm:col-span-2">
                    <span>{messages.publicSite.plusOneName}</span>
                    <Input
                      value={form.plusOneName}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          plusOneName: event.target.value,
                        }))
                      }
                      placeholder={messages.publicSite.plusOnePlaceholder}
                      disabled={!isAttending}
                    />
                  </label>
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
                      placeholder={messages.publicSite.mealChoicePlaceholder}
                      disabled={!isAttending}
                    />
                  </label>
                  <label className="space-y-2 text-sm text-[var(--color-ink)] sm:col-span-2">
                    <span>{messages.publicSite.dietaryNotes}</span>
                    <textarea
                      className="min-h-24 w-full rounded-xl border px-3 py-2 text-sm"
                      value={form.dietaryNotes}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          dietaryNotes: event.target.value,
                        }))
                      }
                      placeholder={messages.publicSite.dietaryNotesPlaceholder}
                      disabled={!isAttending}
                    />
                  </label>
                  <label className="flex items-center gap-3 rounded-[1rem] border border-[var(--color-card-tint)] bg-white/70 px-4 py-3 text-sm text-[var(--color-ink)]">
                    <input
                      type="checkbox"
                      checked={form.needsAccommodation}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          needsAccommodation: event.target.checked,
                        }))
                      }
                      disabled={!isAttending}
                    />
                    <span>{messages.publicSite.needsAccommodation}</span>
                  </label>
                  <label className="flex items-center gap-3 rounded-[1rem] border border-[var(--color-card-tint)] bg-white/70 px-4 py-3 text-sm text-[var(--color-ink)]">
                    <input
                      type="checkbox"
                      checked={form.transportToVenue}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          transportToVenue: event.target.checked,
                        }))
                      }
                      disabled={!isAttending}
                    />
                    <span>{messages.publicSite.transportToVenue}</span>
                  </label>
                  <label className="flex items-center gap-3 rounded-[1rem] border border-[var(--color-card-tint)] bg-white/70 px-4 py-3 text-sm text-[var(--color-ink)] sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={form.transportFromVenue}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          transportFromVenue: event.target.checked,
                        }))
                      }
                      disabled={!isAttending}
                    />
                    <span>{messages.publicSite.transportFromVenue}</span>
                  </label>
                  <label className="space-y-2 text-sm text-[var(--color-ink)] sm:col-span-2">
                    <span>{messages.publicSite.messageToCouple}</span>
                    <textarea
                      className="min-h-24 w-full rounded-xl border px-3 py-2 text-sm"
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
                </div>
              ) : null}
              <Button
                className="rounded-full"
                onClick={async () => {
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
                      status: response.guest.status,
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
                    setError("");
                  } catch {
                    setConfirmation("");
                    setError(messages.publicSite.tokenError);
                  }
                }}
                disabled={!guest}
              >
                {messages.publicSite.submit}
              </Button>
              {confirmation ? (
                <p className="text-sm text-emerald-700">{confirmation}</p>
              ) : null}
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
            </CardContent>
          </Card>
        </div>

        {/* FAQ */}
        {data.faqItems.length > 0 && (
          <Card className="border-white/70 bg-white/85">
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

        {/* Map */}
        {data.venue && (
          <Card className="border-white/70 bg-white/85">
            <CardContent className="flex items-center justify-between p-6">
              <h2 className="font-display text-4xl text-[var(--color-ink)]">
                {messages.publicSite.map}
              </h2>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.venue)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center justify-center rounded-full border border-white/70 bg-white/80 px-4 text-sm font-medium text-[var(--color-ink)] shadow-sm transition-colors hover:bg-white"
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
