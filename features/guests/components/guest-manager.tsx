"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { useLocale } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGuestFilters } from "@/features/guests/hooks/use-guest-filters";
import type { GuestInput } from "@/features/guests/types/guest";
import { canEditGuests } from "@/lib/access-control";
import type { GuestView, UserRole } from "@/lib/planner-domain";
import { apiClient } from "@/lib/api-client";

type GuestFormValues = GuestInput & {
  dietaryRestriction: "NONE" | "VEGETARIAN" | "VEGAN";
};

const emptyGuestForm: GuestFormValues = {
  firstName: "",
  lastName: "",
  side: "BRIDE",
  rsvpStatus: "PENDING",
  paymentCoverage: "FULL",
  invitationReceived: false,
  transportToVenue: false,
  transportFromVenue: false,
  dietaryRestrictions: ["NONE"],
  dietaryRestriction: "NONE",
  email: "",
  phone: "",
  notes: "",
};

export const GuestManager = ({
  initialGuests,
  viewerRole,
}: {
  initialGuests: GuestView[];
  viewerRole: UserRole;
}) => {
  const { messages } = useLocale();
  const canEdit = canEditGuests(viewerRole);
  const [guests, setGuests] = useState(initialGuests);
  const [selectedGuest, setSelectedGuest] = useState<GuestView | null>(null);
  const [search, setSearch] = useState("");
  const [side, setSide] = useState("ALL");
  const formRef = useRef<HTMLDivElement | null>(null);
  const filteredGuests = useGuestFilters(guests, search, side);
  const { register, handleSubmit, reset } = useForm<GuestFormValues>({
    defaultValues: emptyGuestForm,
  });

  const onSubmit = handleSubmit(async (values) => {
    const payload: GuestInput = {
      ...values,
      dietaryRestrictions: [values.dietaryRestriction],
    };

    if (selectedGuest) {
      const updated = await apiClient<GuestView>(
        `/api/guests/${selectedGuest.id}`,
        {
          method: "PATCH",
          body: JSON.stringify(payload),
        },
      );
      setGuests((current) =>
        current.map((guest) => (guest.id === updated.id ? updated : guest)),
      );
    } else {
      const created = await apiClient<GuestView>("/api/guests", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setGuests((current) => [...current, created]);
    }

    setSelectedGuest(null);
    reset(emptyGuestForm);
  });

  const handleEdit = (guest: GuestView) => {
    setSelectedGuest(guest);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.scrollTo({ top: 0, behavior: "smooth" });
    reset({
      firstName: guest.firstName,
      lastName: guest.lastName,
      side: guest.side,
      rsvpStatus: guest.rsvpStatus,
      paymentCoverage: guest.paymentCoverage,
      invitationReceived: guest.invitationReceived,
      transportToVenue: guest.transportToVenue,
      transportFromVenue: guest.transportFromVenue,
      dietaryRestrictions: guest.dietaryRestrictions as Array<
        "NONE" | "VEGETARIAN" | "VEGAN"
      >,
      dietaryRestriction:
        (guest.dietaryRestrictions[0] as "NONE" | "VEGETARIAN" | "VEGAN") ??
        "NONE",
      email: guest.email,
      phone: guest.phone,
      notes: guest.notes,
    });
  };

  const handleDelete = async (guestId: string) => {
    if (!window.confirm(messages.common.confirmDelete)) {
      return;
    }
    await apiClient<{ guestId: string }>(`/api/guests/${guestId}`, {
      method: "DELETE",
    });
    setGuests((current) => current.filter((guest) => guest.id !== guestId));
  };

  const handleRsvpToggle = async (guest: GuestView) => {
    const updated = await apiClient<GuestView>(`/api/guests/${guest.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        ...guest,
        rsvpStatus: guest.rsvpStatus === "ATTENDING" ? "PENDING" : "ATTENDING",
      }),
    });
    setGuests((current) =>
      current.map((candidate) =>
        candidate.id === updated.id ? updated : candidate,
      ),
    );
  };

  return (
    <div
      className={`grid gap-6 ${canEdit ? "xl:grid-cols-[0.8fr_1.2fr]" : "grid-cols-1"}`}
    >
      {canEdit ? (
        <Card className="border-white/70 bg-white/85" ref={formRef}>
          <CardHeader>
            <CardTitle className="font-display text-3xl text-[var(--color-ink)]">
              {selectedGuest ? messages.guests.edit : messages.guests.add}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={onSubmit}>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1 text-sm text-[var(--color-ink)]">
                  <span>{messages.guests.firstName}</span>
                  <Input
                    placeholder={messages.guests.firstName}
                    {...register("firstName")}
                  />
                </label>
                <label className="space-y-1 text-sm text-[var(--color-ink)]">
                  <span>{messages.guests.lastName}</span>
                  <Input
                    placeholder={messages.guests.lastName}
                    {...register("lastName")}
                  />
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1 text-sm text-[var(--color-ink)]">
                  <span>{messages.guests.side}</span>
                  <select
                    className="h-10 w-full rounded-xl border px-3"
                    {...register("side")}
                  >
                    <option value="BRIDE">
                      {messages.enums.guestSide.BRIDE}
                    </option>
                    <option value="GROOM">
                      {messages.enums.guestSide.GROOM}
                    </option>
                    <option value="FAMILY">
                      {messages.enums.guestSide.FAMILY}
                    </option>
                    <option value="FRIENDS">
                      {messages.enums.guestSide.FRIENDS}
                    </option>
                  </select>
                </label>
                <label className="space-y-1 text-sm text-[var(--color-ink)]">
                  <span>{messages.guests.rsvp}</span>
                  <select
                    className="h-10 w-full rounded-xl border px-3"
                    {...register("rsvpStatus")}
                  >
                    <option value="PENDING">
                      {messages.enums.rsvpStatus.PENDING}
                    </option>
                    <option value="ATTENDING">
                      {messages.enums.rsvpStatus.ATTENDING}
                    </option>
                    <option value="DECLINED">
                      {messages.enums.rsvpStatus.DECLINED}
                    </option>
                  </select>
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1 text-sm text-[var(--color-ink)]">
                  <span>{messages.guests.payment}</span>
                  <select
                    className="h-10 w-full rounded-xl border px-3"
                    {...register("paymentCoverage")}
                  >
                    <option value="FULL">{messages.guests.fullPayment}</option>
                    <option value="HALF">{messages.guests.halfPayment}</option>
                  </select>
                </label>
                <div className="grid grid-cols-2 gap-3 rounded-xl border px-3 py-2 text-sm text-[var(--color-ink)]">
                  <label className="col-span-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      {...register("invitationReceived")}
                    />
                    {messages.guests.invitationReceived}
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" {...register("transportToVenue")} />
                    {messages.guests.transportTo}
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      {...register("transportFromVenue")}
                    />
                    {messages.guests.transportFrom}
                  </label>
                </div>
              </div>
              <label className="space-y-1 text-sm text-[var(--color-ink)]">
                <span>{messages.guests.email}</span>
                <Input
                  placeholder={messages.guests.email}
                  {...register("email")}
                />
              </label>
              <label className="space-y-1 text-sm text-[var(--color-ink)]">
                <span>{messages.guests.phone}</span>
                <Input
                  placeholder={messages.guests.phone}
                  {...register("phone")}
                />
              </label>
              <label className="space-y-1 text-sm text-[var(--color-ink)]">
                <span>{messages.guests.dietaryLabel}</span>
                <select
                  className="h-10 w-full rounded-xl border px-3"
                  {...register("dietaryRestriction")}
                >
                  <option value="NONE">{messages.guests.noDiet}</option>
                  <option value="VEGETARIAN">
                    {messages.guests.vegetarian}
                  </option>
                  <option value="VEGAN">{messages.guests.vegan}</option>
                </select>
              </label>
              <label className="space-y-1 text-sm text-[var(--color-ink)]">
                <span>{messages.guests.notesLabel}</span>
                <Input
                  placeholder={messages.guests.notes}
                  {...register("notes")}
                />
              </label>
              <div className="flex gap-3">
                <Button className="rounded-full" type="submit">
                  {selectedGuest
                    ? messages.guests.save
                    : messages.guests.create}
                </Button>
                {selectedGuest ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => {
                      setSelectedGuest(null);
                      reset(emptyGuestForm);
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
      <Card className="border-white/70 bg-white/85">
        <CardHeader className="gap-4">
          <CardTitle className="font-display text-3xl text-[var(--color-ink)]">
            {messages.guests.list}
          </CardTitle>
          <div className="grid gap-3 sm:grid-cols-[1fr_160px]">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={messages.guests.search}
            />
            <select
              className="h-10 rounded-xl border px-3"
              value={side}
              onChange={(event) => setSide(event.target.value)}
            >
              <option value="ALL">{messages.guests.allSides}</option>
              <option value="BRIDE">{messages.enums.guestSide.BRIDE}</option>
              <option value="GROOM">{messages.enums.guestSide.GROOM}</option>
              <option value="FAMILY">{messages.enums.guestSide.FAMILY}</option>
              <option value="FRIENDS">
                {messages.enums.guestSide.FRIENDS}
              </option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{messages.guests.name}</TableHead>
                  <TableHead>{messages.guests.rsvp}</TableHead>
                  <TableHead>{messages.guests.diet}</TableHead>
                  <TableHead>{messages.guests.notesLabel}</TableHead>
                  <TableHead>{messages.guests.token}</TableHead>
                  <TableHead>{messages.guests.payment}</TableHead>
                  <TableHead>{messages.guests.invitationReceived}</TableHead>
                  <TableHead>{messages.guests.transport}</TableHead>
                  <TableHead>{messages.guests.table}</TableHead>
                  <TableHead>{messages.guests.contact}</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGuests.map((guest) => {
                  return (
                    <TableRow
                      key={guest.id}
                      onDoubleClick={() => canEdit && handleEdit(guest)}
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium text-[var(--color-ink)]">
                            {guest.fullName}
                          </p>
                          <p className="text-sm text-[var(--color-muted-copy)]">
                            {messages.enums.guestSide[guest.side]}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <label className="flex items-center gap-2 text-sm text-[var(--color-ink)]">
                          <input
                            type="checkbox"
                            checked={guest.rsvpStatus === "ATTENDING"}
                            onChange={() => void handleRsvpToggle(guest)}
                          />
                          {messages.enums.rsvpStatus[guest.rsvpStatus]}
                        </label>
                      </TableCell>
                      <TableCell>
                        {guest.dietaryRestrictions[0] === "VEGETARIAN"
                          ? messages.guests.vegetarian
                          : guest.dietaryRestrictions[0] === "VEGAN"
                            ? messages.guests.vegan
                            : messages.guests.noDiet}
                      </TableCell>
                      <TableCell>
                        {guest.notes || messages.guests.none}
                      </TableCell>
                      <TableCell>{guest.rsvpToken}</TableCell>
                      <TableCell>
                        {guest.paymentCoverage === "HALF"
                          ? messages.guests.halfPayment
                          : messages.guests.fullPayment}
                      </TableCell>
                      <TableCell>
                        {guest.invitationReceived ? "Tak" : "Nie"}
                      </TableCell>
                      <TableCell>
                        {[
                          guest.transportToVenue
                            ? messages.guests.transportTo
                            : "",
                          guest.transportFromVenue
                            ? messages.guests.transportFrom
                            : "",
                        ]
                          .filter(Boolean)
                          .join(" / ") || messages.guests.none}
                      </TableCell>
                      <TableCell>
                        {guest.tableName ?? messages.guests.unassigned}
                      </TableCell>
                      <TableCell>{guest.email}</TableCell>
                      <TableCell className="space-x-2 text-right">
                        {canEdit ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(guest)}
                            >
                              {messages.guests.editButton}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(guest.id)}
                            >
                              {messages.guests.delete}
                            </Button>
                          </>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
