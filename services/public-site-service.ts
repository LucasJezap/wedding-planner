import { getRepository } from "@/db/repositories";
import {
  publicGuestLookupSchema,
  publicRsvpSchema,
  type PublicGuestLookupInput,
  type PublicRsvpInput,
} from "@/features/public/types/public";
import type {
  FaqItem,
  PublicGuestLookupView,
  PublicWeddingView,
} from "@/lib/planner-domain";

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const MINUTE_IN_MS = 60 * 1000;

export const getPublicWeddingView = async (): Promise<PublicWeddingView> => {
  const repository = getRepository();
  const [wedding, timeline] = await Promise.all([
    repository.getWedding(),
    repository.listTimelineEvents(),
  ]);

  let faqItems: FaqItem[] = [];
  if (wedding.faqItems) {
    try {
      faqItems = JSON.parse(wedding.faqItems) as FaqItem[];
    } catch {
      faqItems = [];
    }
  }

  const logistics = [
    wedding.parkingInfo
      ? {
          id: "parking" as const,
          content: wedding.parkingInfo,
        }
      : null,
    wedding.accommodationInfo
      ? {
          id: "accommodation" as const,
          content: wedding.accommodationInfo,
        }
      : null,
    wedding.registryInfo
      ? {
          id: "registry" as const,
          content: wedding.registryInfo,
        }
      : null,
    wedding.transportInfo
      ? {
          id: "transport" as const,
          content: wedding.transportInfo,
        }
      : null,
    wedding.coordinatorName ||
    wedding.coordinatorPhone ||
    wedding.coordinatorEmail
      ? {
          id: "coordinator" as const,
          content: [
            wedding.coordinatorName,
            wedding.coordinatorPhone,
            wedding.coordinatorEmail,
          ]
            .filter(Boolean)
            .join(" · "),
        }
      : null,
  ].filter((item): item is NonNullable<typeof item> => Boolean(item));

  const visibleTimeline = timeline
    .filter((event) => event.visibleToGuests)
    .sort((left, right) => left.startsAt.localeCompare(right.startsAt));
  const firstVisibleEvent = visibleTimeline[0];
  const referenceStart = firstVisibleEvent?.startsAt ?? wedding.ceremonyDate;
  const recommendedArrivalTime = new Date(
    new Date(referenceStart).getTime() - 30 * MINUTE_IN_MS,
  ).toISOString();
  const rsvpDeadline = new Date(
    new Date(wedding.ceremonyDate).getTime() - 30 * DAY_IN_MS,
  ).toISOString();

  return {
    wedding,
    timeline: visibleTimeline,
    venue: `${wedding.venueName}, ${wedding.venueAddress}`,
    aboutText: wedding.aboutText,
    dressCode: wedding.dressCode,
    faqItems,
    ceremonyDate: wedding.ceremonyDate,
    rsvpDeadline,
    coupleNames: `${wedding.coupleOneName} & ${wedding.coupleTwoName}`,
    recommendedArrivalTime,
    logistics,
  };
};

const buildPublicGuestLookupView = async (
  token: string,
): Promise<PublicGuestLookupView> => {
  const repository = getRepository();
  const [guest, rsvps, invitationGroups, guests] = await Promise.all([
    repository.getGuestByRsvpToken(token),
    repository.listRsvps(),
    repository.listInvitationGroups(),
    repository.listGuests(),
  ]);

  if (!guest) {
    throw new Error("Guest not found");
  }

  const rsvp = rsvps.find((candidate) => candidate.guestId === guest.id);
  const invitationGroup = invitationGroups.find(
    (candidate) => candidate.id === guest.invitationGroupId,
  );
  const groupMembers = invitationGroup
    ? guests.filter(
        (candidate) => candidate.invitationGroupId === invitationGroup.id,
      )
    : [];
  const sharedStatus = invitationGroup?.sharedRsvpStatus;

  return {
    guest: {
      id: guest.id,
      name: `${guest.firstName} ${guest.lastName}`,
      status: sharedStatus ?? rsvp?.status ?? guest.rsvpStatus,
      guestCount: invitationGroup?.invitedGuestCount ?? rsvp?.guestCount ?? 1,
      attendingChildren:
        invitationGroup?.attendingChildren ?? rsvp?.attendingChildren ?? 0,
      plusOneName: invitationGroup?.plusOneName ?? rsvp?.plusOneName ?? "",
      mealChoice: invitationGroup?.mealChoice ?? rsvp?.mealChoice ?? "",
      dietaryNotes:
        invitationGroup?.dietaryNotes ??
        rsvp?.dietaryNotes ??
        guest.dietaryRestrictions.join(", ").trim(),
      needsAccommodation:
        invitationGroup?.needsAccommodation ??
        rsvp?.needsAccommodation ??
        false,
      dietaryRestrictions: guest.dietaryRestrictions,
      transportToVenue:
        invitationGroup?.transportToVenue ??
        rsvp?.transportToVenue ??
        guest.transportToVenue,
      transportFromVenue:
        invitationGroup?.transportFromVenue ??
        rsvp?.transportFromVenue ??
        guest.transportFromVenue,
      message: invitationGroup?.message ?? rsvp?.message ?? "",
    },
    invitationGroup: invitationGroup
      ? {
          id: invitationGroup.id,
          name: invitationGroup.name,
          invitedGuestCount: invitationGroup.invitedGuestCount,
          allowsPlusOne: invitationGroup.allowsPlusOne,
          sharedResponse: true,
          members: groupMembers.map((member) => ({
            id: member.id,
            name: `${member.firstName} ${member.lastName}`,
            status: invitationGroup.sharedRsvpStatus,
          })),
        }
      : undefined,
    message: "Guest found",
  };
};

export const lookupPublicGuest = async (
  input: PublicGuestLookupInput,
): Promise<PublicGuestLookupView> => {
  const data = publicGuestLookupSchema.parse(input);
  return buildPublicGuestLookupView(data.token);
};

export const submitPublicRsvp = async (
  input: PublicRsvpInput,
): Promise<PublicGuestLookupView> => {
  const repository = getRepository();
  const data = publicRsvpSchema.parse(input);
  const [wedding, guest] = await Promise.all([
    repository.getWedding(),
    repository.getGuestByRsvpToken(data.token),
  ]);

  if (!guest) {
    throw new Error("Guest not found");
  }

  const rsvpDeadline = new Date(
    new Date(wedding.ceremonyDate).getTime() - 30 * DAY_IN_MS,
  );
  if (Date.now() > rsvpDeadline.getTime()) {
    throw new Error("RSVP deadline passed");
  }

  if (guest.invitationGroupId) {
    const groups = await repository.listInvitationGroups();
    const invitationGroup = groups.find(
      (candidate) => candidate.id === guest.invitationGroupId,
    );
    if (!invitationGroup) {
      throw new Error("Invitation group not found");
    }

    await repository.updateInvitationGroup(invitationGroup.id, {
      invitedGuestCount: invitationGroup.invitedGuestCount,
      allowsPlusOne: invitationGroup.allowsPlusOne,
      notes: invitationGroup.notes,
      sharedRsvpStatus: data.status,
      attendingChildren: data.attendingChildren,
      plusOneName: data.plusOneName,
      mealChoice: data.mealChoice,
      dietaryNotes: data.dietaryNotes,
      needsAccommodation: data.needsAccommodation,
      transportToVenue: data.transportToVenue,
      transportFromVenue: data.transportFromVenue,
      message: data.message,
    });

    const guests = await repository.listGuests();
    const groupMembers = guests.filter(
      (candidate) => candidate.invitationGroupId === invitationGroup.id,
    );
    await Promise.all(
      groupMembers.map((member) =>
        repository.updateGuest(
          member.id,
          {
            rsvpStatus: data.status,
            transportToVenue: data.transportToVenue,
            transportFromVenue: data.transportFromVenue,
          },
          {},
          {},
        ),
      ),
    );
  } else {
    await repository.upsertRsvp({
      weddingId: wedding.id,
      guestId: guest.id,
      status: data.status,
      guestCount: data.guestCount,
      attendingChildren: data.attendingChildren,
      plusOneName: data.plusOneName,
      mealChoice: data.mealChoice,
      dietaryNotes: data.dietaryNotes,
      needsAccommodation: data.needsAccommodation,
      transportToVenue: data.transportToVenue,
      transportFromVenue: data.transportFromVenue,
      message: data.message,
    });
  }
  const response = await buildPublicGuestLookupView(data.token);

  return {
    ...response,
    message: "RSVP updated",
  };
};
