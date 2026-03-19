import type { GuestInput, BulkGuestInput } from "@/features/guests/types/guest";
import { bulkGuestInputSchema } from "@/features/guests/types/guest";
import {
  createGuest,
  deleteGuest,
  listGuests,
  updateGuest,
  bulkUpdateGuests,
  bulkDeleteGuests,
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

export const bulkGuestHandler = async (input: unknown) => {
  const data = bulkGuestInputSchema.parse(input);
  if (data.action === "delete") {
    await bulkDeleteGuests(data.guestIds);
    return { deleted: data.guestIds.length };
  }
  const guests = await bulkUpdateGuests(data.guestIds, data.updates);
  return guests;
};
