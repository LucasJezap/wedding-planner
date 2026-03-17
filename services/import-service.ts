import {
  importPayloadSchema,
  type ImportPayload,
} from "@/features/import/types/import";
import type { GuestView } from "@/lib/planner-domain";
import { createGuest, listGuests } from "@/services/guest-service";

export const importGuests = async (
  payload: ImportPayload,
): Promise<GuestView[]> => {
  const data = importPayloadSchema.parse(payload);

  for (const row of data.rows) {
    await createGuest({
      firstName: row.firstName,
      lastName: row.lastName,
      side: row.side,
      rsvpStatus: row.rsvpStatus ?? "PENDING",
      dietaryRestrictions:
        row.dietaryRestrictions.length > 0
          ? (row.dietaryRestrictions as Array<"NONE" | "VEGETARIAN" | "VEGAN">)
          : ["NONE"],
      paymentCoverage: row.paymentCoverage ?? "FULL",
      invitationReceived: row.invitationReceived ?? false,
      transportToVenue: row.transportToVenue ?? false,
      transportFromVenue: row.transportFromVenue ?? false,
      email: row.email,
      phone: row.phone,
      notes: row.notes,
    });
  }

  return listGuests();
};
