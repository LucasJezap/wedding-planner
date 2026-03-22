import { getRepository } from "@/db/repositories";
import type { GuestView, InvitationGroupView } from "@/lib/planner-domain";
import {
  guestInputSchema,
  type GuestInput,
} from "@/features/guests/types/guest";
import { sortGuestsForList } from "@/features/guests/lib/guest-list-order";
import { createRsvpToken } from "@/lib/rsvp-token";

const buildGuestView = async (): Promise<GuestView[]> => {
  const repository = getRepository();
  const [guests, contacts, notes, tables, invitationGroups] = await Promise.all(
    [
      repository.listGuests(),
      repository.listContacts(),
      repository.listNotes(),
      repository.listTables(),
      repository.listInvitationGroups(),
    ],
  );

  return sortGuestsForList(
    guests.map((guest) => {
      const contact = contacts.find(
        (candidate) => candidate.guestId === guest.id,
      );
      const note = notes.find((candidate) => candidate.guestId === guest.id);
      const table = tables.find((candidate) => candidate.id === guest.tableId);
      const invitationGroup = invitationGroups.find(
        (candidate) => candidate.id === guest.invitationGroupId,
      );

      return {
        ...guest,
        fullName: `${guest.firstName} ${guest.lastName}`,
        email: contact?.email ?? "",
        phone: contact?.phone ?? "",
        notes: note?.content ?? "",
        tableName: table?.name,
        groupName: invitationGroup?.name ?? guest.groupName,
        invitedGuestCount: invitationGroup?.invitedGuestCount,
        allowsPlusOne: invitationGroup?.allowsPlusOne,
        groupNotes: invitationGroup?.notes,
        rsvpStatus: invitationGroup?.sharedRsvpStatus ?? guest.rsvpStatus,
      };
    }),
  );
};

const syncInvitationGroup = async (input: {
  name?: string;
  invitedGuestCount?: number;
  allowsPlusOne?: boolean;
  notes?: string;
  sharedRsvpStatus?: GuestView["rsvpStatus"];
}) => {
  const repository = getRepository();
  const groupName = input.name?.trim() ?? "";

  if (!groupName) {
    return { invitationGroupId: undefined, groupName: "" };
  }

  const groups = await repository.listInvitationGroups();
  const existing = groups.find((group) => group.name === groupName);

  if (existing) {
    await repository.updateInvitationGroup(existing.id, {
      invitedGuestCount: input.invitedGuestCount ?? existing.invitedGuestCount,
      allowsPlusOne: input.allowsPlusOne ?? existing.allowsPlusOne,
      notes: input.notes ?? existing.notes,
      sharedRsvpStatus: input.sharedRsvpStatus ?? existing.sharedRsvpStatus,
      attendingChildren: existing.attendingChildren,
      plusOneName: existing.plusOneName,
      mealChoice: existing.mealChoice,
      dietaryNotes: existing.dietaryNotes,
      needsAccommodation: existing.needsAccommodation,
      transportToVenue: existing.transportToVenue,
      transportFromVenue: existing.transportFromVenue,
      message: existing.message,
    });
    return { invitationGroupId: existing.id, groupName };
  }

  const wedding = await repository.getWedding();
  const created = await repository.createInvitationGroup({
    weddingId: wedding.id,
    name: groupName,
    invitedGuestCount: input.invitedGuestCount ?? 1,
    allowsPlusOne: input.allowsPlusOne ?? false,
    notes: input.notes ?? "",
    sharedRsvpStatus: input.sharedRsvpStatus ?? "PENDING",
    attendingChildren: 0,
    plusOneName: "",
    mealChoice: "",
    dietaryNotes: "",
    needsAccommodation: false,
    transportToVenue: false,
    transportFromVenue: false,
    message: "",
  });

  return { invitationGroupId: created.id, groupName };
};

const cleanupInvitationGroupIfEmpty = async (groupId?: string) => {
  if (!groupId) {
    return;
  }

  const repository = getRepository();
  const guests = await repository.listGuests();
  const hasMembers = guests.some(
    (guest) => guest.invitationGroupId === groupId,
  );

  if (!hasMembers) {
    await repository.deleteInvitationGroup(groupId);
  }
};

export const listGuests = async (): Promise<GuestView[]> => buildGuestView();

export const listInvitationGroups = async (): Promise<
  InvitationGroupView[]
> => {
  const repository = getRepository();
  const [groups, guests] = await Promise.all([
    repository.listInvitationGroups(),
    buildGuestView(),
  ]);

  return groups
    .map((group) => {
      const members = guests.filter(
        (guest) => guest.invitationGroupId === group.id,
      );

      return {
        ...group,
        memberCount: members.length,
        pendingCount: members.filter((guest) => guest.rsvpStatus === "PENDING")
          .length,
        attendingCount: members.filter(
          (guest) => guest.rsvpStatus === "ATTENDING",
        ).length,
        declinedCount: members.filter(
          (guest) => guest.rsvpStatus === "DECLINED",
        ).length,
        memberNames: members.map((guest) => guest.fullName),
      };
    })
    .sort((left, right) => left.name.localeCompare(right.name));
};

export const createGuest = async (input: GuestInput): Promise<GuestView> => {
  const repository = getRepository();
  const wedding = await repository.getWedding();
  const data = guestInputSchema.parse(input);
  const invitationGroup = await syncInvitationGroup({
    name: data.groupName,
    invitedGuestCount: data.invitedGuestCount,
    allowsPlusOne: data.allowsPlusOne,
    notes: data.groupNotes,
    sharedRsvpStatus: data.rsvpStatus,
  });

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
      invitationGroupId: invitationGroup.invitationGroupId,
      groupName: invitationGroup.groupName,
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
  const previousGroupId = current.invitationGroupId;

  const data = guestInputSchema.parse({
    ...current,
    ...input,
  });
  const invitationGroup = await syncInvitationGroup({
    name: data.groupName,
    invitedGuestCount: data.invitedGuestCount,
    allowsPlusOne: data.allowsPlusOne,
    notes: data.groupNotes,
    sharedRsvpStatus: data.rsvpStatus,
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
      invitationGroupId: invitationGroup.invitationGroupId,
      groupName: invitationGroup.groupName,
    },
    {
      email: data.email,
      phone: data.phone,
    },
    {
      content: data.notes,
    },
  );
  if (previousGroupId !== invitationGroup.invitationGroupId) {
    await cleanupInvitationGroupIfEmpty(previousGroupId);
  }

  return (await buildGuestView()).find(
    (candidate) => candidate.id === guestId,
  )!;
};

export const deleteGuest = async (guestId: string): Promise<void> => {
  const repository = getRepository();
  const current = (await buildGuestView()).find(
    (candidate) => candidate.id === guestId,
  );
  await repository.deleteGuest(guestId);
  await cleanupInvitationGroupIfEmpty(current?.invitationGroupId);
};

export const bulkUpdateGuests = async (
  guestIds: string[],
  updates: {
    rsvpStatus?: "PENDING" | "ATTENDING" | "DECLINED";
    groupName?: string;
    invitedGuestCount?: number;
    allowsPlusOne?: boolean;
    groupNotes?: string;
  },
): Promise<GuestView[]> => {
  const repository = getRepository();
  const currentGuests = await buildGuestView();
  const invitationGroup =
    updates.groupName !== undefined
      ? await syncInvitationGroup({
          name: updates.groupName,
          invitedGuestCount: updates.invitedGuestCount,
          allowsPlusOne: updates.allowsPlusOne,
          notes: updates.groupNotes,
        })
      : null;
  await Promise.all(
    guestIds.map((id) =>
      repository.updateGuest(
        id,
        {
          rsvpStatus: updates.rsvpStatus,
          invitationGroupId: invitationGroup?.invitationGroupId,
          groupName: invitationGroup?.groupName,
        },
        {},
        {},
      ),
    ),
  );
  const previousGroupIds = new Set(
    currentGuests
      .filter((guest) => guestIds.includes(guest.id))
      .map((guest) => guest.invitationGroupId)
      .filter((groupId): groupId is string => Boolean(groupId)),
  );
  await Promise.all(
    [...previousGroupIds]
      .filter((groupId) => groupId !== invitationGroup?.invitationGroupId)
      .map((groupId) => cleanupInvitationGroupIfEmpty(groupId)),
  );
  return buildGuestView();
};

export const bulkDeleteGuests = async (guestIds: string[]): Promise<void> => {
  const guests = await buildGuestView();
  const repository = getRepository();
  await Promise.all(guestIds.map((id) => repository.deleteGuest(id)));
  const affectedGroupIds = new Set(
    guests
      .filter((guest) => guestIds.includes(guest.id))
      .map((guest) => guest.invitationGroupId)
      .filter((groupId): groupId is string => Boolean(groupId)),
  );
  await Promise.all(
    [...affectedGroupIds].map((groupId) =>
      cleanupInvitationGroupIfEmpty(groupId),
    ),
  );
};
