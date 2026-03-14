import type { ImportPayload } from "@/features/import/types/import";
import { importGuests } from "@/services/import-service";

export const importGuestsHandler = async (payload: ImportPayload) =>
  importGuests(payload);
