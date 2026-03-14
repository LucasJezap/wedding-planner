import type {
  PublicGuestLookupInput,
  PublicRsvpInput,
} from "@/features/public/types/public";
import {
  getPublicWeddingView,
  lookupPublicGuest,
  submitPublicRsvp,
} from "@/services/public-site-service";

export const getPublicWeddingHandler = async () => getPublicWeddingView();
export const lookupPublicGuestHandler = async (input: PublicGuestLookupInput) =>
  lookupPublicGuest(input);
export const submitPublicRsvpHandler = async (input: PublicRsvpInput) =>
  submitPublicRsvp(input);
