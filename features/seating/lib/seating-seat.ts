import type { SeatRecord } from "@/lib/planner-domain";

export const SEATS_PER_TABLE = 10;
const SYNTHETIC_SEAT_MARKER = "::seat-";

export const createSyntheticSeatId = (tableId: string, position: number) =>
  `${tableId}${SYNTHETIC_SEAT_MARKER}${position}`;

export const isSyntheticSeatId = (seatId: string) =>
  seatId.includes(SYNTHETIC_SEAT_MARKER);

export const parseSyntheticSeatId = (seatId: string) => {
  const [tableId, rawPosition] = seatId.split(SYNTHETIC_SEAT_MARKER);
  const position = Number.parseInt(rawPosition ?? "", 10);

  if (!tableId || !Number.isInteger(position) || position < 1) {
    return null;
  }

  return { tableId, position };
};

export const buildSeatLabel = (position: number) => String(position);

export const ensureTableSeats = (
  tableId: string,
  seats: SeatRecord[],
): SeatRecord[] => {
  const seatsByPosition = new Map(seats.map((seat) => [seat.position, seat]));
  const fallbackSeat = seats[0];

  return Array.from({ length: SEATS_PER_TABLE }, (_, index) => {
    const position = index + 1;
    const existingSeat = seatsByPosition.get(position);

    if (existingSeat) {
      return {
        ...existingSeat,
        label: buildSeatLabel(position),
      };
    }

    return {
      id: createSyntheticSeatId(tableId, position),
      weddingId: fallbackSeat?.weddingId ?? "virtual-seating",
      tableId,
      label: buildSeatLabel(position),
      position,
      createdAt: fallbackSeat?.createdAt ?? "",
      updatedAt: fallbackSeat?.updatedAt ?? "",
    };
  });
};
