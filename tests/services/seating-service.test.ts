import {
  assignGuestToSeat,
  getSeatingBoard,
  swapTableAssignments,
  updateTablePosition,
} from "@/services/seating-service";

describe("seating-service", () => {
  it("returns tables and unassigned guests", async () => {
    const board = await getSeatingBoard();
    expect(board.tables).toHaveLength(3);
    expect(board.unassignedGuests.length).toBeGreaterThan(0);
    expect(board.tables.map((table) => table.name)).toEqual([
      "Garden Table",
      "Conservatory Table",
      "Champagne Table",
    ]);
    expect(board.tables.every((table) => table.seats.length > 0)).toBe(true);
    expect(board.tables.every((table) => table.seats.length === 10)).toBe(true);
    expect(board.tables[0]?.seats.map((seat) => seat.label)).toEqual([
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
    ]);
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

  it("swaps guests when target seat is occupied", async () => {
    const board = await getSeatingBoard();
    const sourceSeat = board.tables[0]!.seats.find((seat) => seat.guestId)!;
    const targetSeat = board.tables[1]!.seats.find((seat) => seat.guestId)!;

    const updated = await assignGuestToSeat({
      guestId: sourceSeat.guestId!,
      seatId: targetSeat.id,
    });

    expect(
      updated.tables[1]!.seats.find((seat) => seat.id === targetSeat.id)
        ?.guestId,
    ).toBe(sourceSeat.guestId);
    expect(
      updated.tables[0]!.seats.find((seat) => seat.id === sourceSeat.id)
        ?.guestId,
    ).toBe(targetSeat.guestId);
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

  it("swaps full table assignments without changing table labels", async () => {
    const board = await getSeatingBoard();
    const firstTable = board.tables[0]!;
    const secondTable = board.tables[1]!;
    const firstTableFirstGuest = firstTable.seats[0]?.guestId;
    const secondTableFirstGuest = secondTable.seats[0]?.guestId;

    const updated = await swapTableAssignments({
      sourceTableId: firstTable.id,
      targetTableId: secondTable.id,
    });

    expect(updated.tables[0]?.seats[0]?.guestId).toBe(secondTableFirstGuest);
    expect(updated.tables[1]?.seats[0]?.guestId).toBe(firstTableFirstGuest);
    expect(updated.tables[0]?.seats.map((seat) => seat.label)).toEqual([
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
    ]);
  });
});
