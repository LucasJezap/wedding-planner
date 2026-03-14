import {
  assignGuestToSeat,
  getSeatingBoard,
  updateTablePosition,
} from "@/services/seating-service";

describe("seating-service", () => {
  it("returns tables and unassigned guests", async () => {
    const board = await getSeatingBoard();
    expect(board.tables).toHaveLength(3);
    expect(board.unassignedGuests.length).toBeGreaterThan(0);
  });

  it("assigns a guest to a seat", async () => {
    const board = await getSeatingBoard();
    const guest = board.unassignedGuests[0]!;
    const seat = board.tables[0]!.seats.find(
      (candidate) => !candidate.guestId,
    )!;

    const updated = await assignGuestToSeat({
      guestId: guest.id,
      seatId: seat.id,
    });
    expect(
      updated.tables[0]!.seats.find((candidate) => candidate.id === seat.id)
        ?.guestName,
    ).toBe(guest.fullName);
  });

  it("persists table positions", async () => {
    const board = await getSeatingBoard();
    const table = board.tables[0]!;

    const updated = await updateTablePosition({
      tableId: table.id,
      positionX: 480,
      positionY: 260,
    });

    const movedTable = updated.tables.find(
      (candidate) => candidate.id === table.id,
    )!;
    expect(movedTable.positionX).toBe(480);
    expect(movedTable.positionY).toBe(260);
  });
});
