"use client";

import type { SeatingBoard } from "@/features/seating/types/seating";

export const useSeatingSummary = (board: SeatingBoard) => ({
  assigned: board.tables
    .flatMap((table) => table.seats)
    .filter((seat) => seat.guestId).length,
  openSeats: board.tables
    .flatMap((table) => table.seats)
    .filter((seat) => !seat.guestId).length,
  unassigned: board.unassignedGuests.length,
});
