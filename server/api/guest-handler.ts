import type { GuestInput } from "@/features/guests/types/guest";
import {
  createGuest,
  deleteGuest,
  listGuests,
  updateGuest,
} from "@/services/guest-service";

export const getGuestsHandler = async () => listGuests();
export const createGuestHandler = async (input: GuestInput) =>
  createGuest(input);
export const updateGuestHandler = async (
  guestId: string,
  input: Partial<GuestInput>,
) => updateGuest(guestId, input);
export const deleteGuestHandler = async (guestId: string) =>
  deleteGuest(guestId);
