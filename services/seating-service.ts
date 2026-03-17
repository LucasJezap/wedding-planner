import { getRepository } from "@/db/repositories";
import { sortWeddingTables } from "@/features/seating/lib/seating-table-order";
import type { SeatingTableView } from "@/lib/planner-domain";
import { ensureTableSeats } from "@/features/seating/lib/seating-seat";
import {
  seatingAssignmentSchema,
  seatingTableSwapSchema,
  seatingTablePositionSchema,
  type SeatingBoard,
} from "@/features/seating/types/seating";
import { listGuests } from "@/services/guest-service";

const buildTables = async (): Promise<SeatingTableView[]> => {
  const repository = getRepository();
  const [tables, seats, guests] = await Promise.all([
    repository.listTables(),
    repository.listSeats(),
    listGuests(),
  ]);

  return sortWeddingTables(tables).map((table) => ({
    ...table,
    seats: ensureTableSeats(
      table.id,
      seats
        .filter((seat) => seat.tableId === table.id)
        .sort((left, right) => left.position - right.position),
    ).map((seat) => ({
      ...seat,
      guestName: guests.find((candidate) => candidate.id === seat.guestId)
        ?.fullName,
    })),
  }));
};

export const getSeatingBoard = async (): Promise<SeatingBoard> => {
  const guests = await listGuests();
  const tables = await buildTables();
  const assignedGuestIds = new Set(
    tables
      .flatMap((table) => table.seats.map((seat) => seat.guestId))
      .filter(Boolean),
  );

  return {
    tables,
    unassignedGuests: guests.filter(
      (guest) =>
        guest.rsvpStatus !== "DECLINED" && !assignedGuestIds.has(guest.id),
    ),
  };
};

export const assignGuestToSeat = async (input: {
  guestId: string;
  seatId?: string;
}): Promise<SeatingBoard> => {
  const data = seatingAssignmentSchema.parse(input);
  const repository = getRepository();
  await repository.assignGuestToSeat(data.guestId, data.seatId);
  return getSeatingBoard();
};

export const updateTablePosition = async (input: {
  tableId: string;
  positionX: number;
  positionY: number;
}): Promise<SeatingBoard> => {
  const data = seatingTablePositionSchema.parse(input);
  const repository = getRepository();
  await repository.updateTablePosition(data.tableId, {
    positionX: data.positionX,
    positionY: data.positionY,
  });
  return getSeatingBoard();
};

export const swapTableAssignments = async (input: {
  sourceTableId: string;
  targetTableId: string;
}): Promise<SeatingBoard> => {
  const data = seatingTableSwapSchema.parse(input);
  const repository = getRepository();
  await repository.swapTableAssignments(data.sourceTableId, data.targetTableId);
  return getSeatingBoard();
};
