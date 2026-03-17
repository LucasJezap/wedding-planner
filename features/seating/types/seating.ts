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

export const seatingTableSwapSchema = z.object({
  sourceTableId: z.string().min(1),
  targetTableId: z.string().min(1),
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
  z.object({
    type: z.literal("SWAP_TABLES"),
    sourceTableId: z.string().min(1),
    targetTableId: z.string().min(1),
  }),
]);

export type SeatingAssignment = z.infer<typeof seatingAssignmentSchema>;
export type SeatingTablePosition = z.infer<typeof seatingTablePositionSchema>;
export type SeatingTableSwap = z.infer<typeof seatingTableSwapSchema>;
export type SeatingMutation = z.infer<typeof seatingMutationSchema>;

export type SeatingBoard = {
  tables: SeatingTableView[];
  unassignedGuests: GuestView[];
};
