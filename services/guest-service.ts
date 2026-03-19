import { getRepository } from "@/db/repositories";
import type { GuestView } from "@/lib/planner-domain";
import {
  guestInputSchema,
  type GuestInput,
} from "@/features/guests/types/guest";
import { createRsvpToken } from "@/lib/rsvp-token";

const buildGuestView = async (): Promise<GuestView[]> => {
  const repository = getRepository();
  const [guests, contacts, notes, tables] = await Promise.all([
    repository.listGuests(),
    repository.listContacts(),
    repository.listNotes(),
    repository.listTables(),
  ]);

  return guests
    .map((guest) => {
      const contact = contacts.find(
        (candidate) => candidate.guestId === guest.id,
      );
      const note = notes.find((candidate) => candidate.guestId === guest.id);
      const table = tables.find((candidate) => candidate.id === guest.tableId);

      return {
        ...guest,
        fullName: `${guest.firstName} ${guest.lastName}`,
        email: contact?.email ?? "",
        phone: contact?.phone ?? "",
        notes: note?.content ?? "",
        tableName: table?.name,
      };
    })
    .sort((left, right) => left.lastName.localeCompare(right.lastName));
};

export const listGuests = async (): Promise<GuestView[]> => buildGuestView();

export const createGuest = async (input: GuestInput): Promise<GuestView> => {
  const repository = getRepository();
  const wedding = await repository.getWedding();
  const data = guestInputSchema.parse(input);

  const guest = await repository.createGuest(
    {
      weddingId: wedding.id,
      firstName: data.firstName,
      lastName: data.lastName,
      side: data.side,
      rsvpStatus: data.rsvpStatus,
      rsvpToken: createRsvpToken(
        `${wedding.id}:${data.firstName}:${data.lastName}:${Date.now()}`,
      ),
      dietaryRestrictions: data.dietaryRestrictions,
      paymentCoverage: data.paymentCoverage,
      invitationReceived: data.invitationReceived,
      transportToVenue: data.transportToVenue,
      transportFromVenue: data.transportFromVenue,
      groupName: data.groupName,
    },
    {
      weddingId: wedding.id,
      email: data.email,
      phone: data.phone,
    },
    {
      weddingId: wedding.id,
      content: data.notes,
    },
  );

  return (await buildGuestView()).find(
    (candidate) => candidate.id === guest.id,
  )!;
};

export const updateGuest = async (
  guestId: string,
  input: Partial<GuestInput>,
): Promise<GuestView> => {
  const repository = getRepository();
  const current = (await buildGuestView()).find(
    (candidate) => candidate.id === guestId,
  );
  if (!current) {
    throw new Error("Guest not found");
  }

  const data = guestInputSchema.parse({
    ...current,
    ...input,
  });

  await repository.updateGuest(
    guestId,
    {
      firstName: data.firstName,
      lastName: data.lastName,
      side: data.side,
      rsvpStatus: data.rsvpStatus,
      rsvpToken: current.rsvpToken,
      dietaryRestrictions: data.dietaryRestrictions,
      paymentCoverage: data.paymentCoverage,
      invitationReceived: data.invitationReceived,
      transportToVenue: data.transportToVenue,
      transportFromVenue: data.transportFromVenue,
      groupName: data.groupName,
    },
    {
      email: data.email,
      phone: data.phone,
    },
    {
      content: data.notes,
    },
  );

  return (await buildGuestView()).find(
    (candidate) => candidate.id === guestId,
  )!;
};

export const deleteGuest = async (guestId: string): Promise<void> => {
  const repository = getRepository();
  await repository.deleteGuest(guestId);
};

export const bulkUpdateGuests = async (
  guestIds: string[],
  updates: {
    rsvpStatus?: "PENDING" | "ATTENDING" | "DECLINED";
    groupName?: string;
  },
): Promise<GuestView[]> => {
  const repository = getRepository();
  await Promise.all(
    guestIds.map((id) => repository.updateGuest(id, updates, {}, {})),
  );
  return buildGuestView();
};

export const bulkDeleteGuests = async (guestIds: string[]): Promise<void> => {
  const repository = getRepository();
  await Promise.all(guestIds.map((id) => repository.deleteGuest(id)));
};
