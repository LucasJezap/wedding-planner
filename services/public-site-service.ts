import { getRepository } from "@/db/repositories";
import {
  publicGuestLookupSchema,
  publicRsvpSchema,
  type PublicGuestLookupInput,
  type PublicRsvpInput,
} from "@/features/public/types/public";
import type {
  PublicGuestLookupView,
  PublicWeddingView,
} from "@/lib/planner-domain";

export const getPublicWeddingView = async (): Promise<PublicWeddingView> => {
  const repository = getRepository();
  const [wedding, timeline] = await Promise.all([
    repository.getWedding(),
    repository.listTimelineEvents(),
  ]);

  return {
    wedding,
    timeline: timeline
      .filter((event) => event.visibleToGuests)
      .sort((left, right) => left.startsAt.localeCompare(right.startsAt)),
    venue: `${wedding.venueName}, ${wedding.venueAddress}`,
  };
};

export const lookupPublicGuest = async (
  input: PublicGuestLookupInput,
): Promise<PublicGuestLookupView> => {
  const repository = getRepository();
  const data = publicGuestLookupSchema.parse(input);
  const guest = await repository.getGuestByRsvpToken(data.token);

  if (!guest) {
    throw new Error("Guest not found");
  }

  return {
    guest: {
      id: guest.id,
      name: `${guest.firstName} ${guest.lastName}`,
      status: guest.rsvpStatus,
      dietaryRestrictions: guest.dietaryRestrictions,
      transportToVenue: guest.transportToVenue,
      transportFromVenue: guest.transportFromVenue,
    },
    message: "RSVP updated",
  };
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

  await repository.upsertRsvp({
    weddingId: wedding.id,
    guestId: guest.id,
    status: data.status,
    guestCount: data.guestCount,
  });
  return lookupPublicGuest({ token: data.token });
};
