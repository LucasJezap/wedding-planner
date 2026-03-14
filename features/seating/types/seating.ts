import { z } from "zod";

import type { GuestView, SeatingTableView } from "@/lib/planner-domain";

export const seatingAssignmentSchema = z.object({
  guestId: z.string().min(1),
  seatId: z.string().optional(),
});

export const seatingTablePositionSchema = z.object({
  tableId: z.string().min(1),
  positionX: z.number().int(),
  positionY: z.number().int(),
});

export const seatingMutationSchema = z.union([
  z.object({
    type: z.literal("ASSIGN_GUEST"),
    guestId: z.string().min(1),
    seatId: z.string().optional(),
  }),
  z.object({
    type: z.literal("MOVE_TABLE"),
    tableId: z.string().min(1),
    positionX: z.number().int(),
    positionY: z.number().int(),
  }),
]);

export type SeatingAssignment = z.infer<typeof seatingAssignmentSchema>;
export type SeatingTablePosition = z.infer<typeof seatingTablePositionSchema>;
export type SeatingMutation = z.infer<typeof seatingMutationSchema>;

export type SeatingBoard = {
  tables: SeatingTableView[];
  unassignedGuests: GuestView[];
};
