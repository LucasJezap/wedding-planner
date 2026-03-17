import {
  CHAIR_RADIUS,
  findSeatAtPoint,
  getAbsoluteChairPosition,
  getBoardBounds,
  getChairPosition,
  getNearestSlotIndex,
  getTableSlots,
} from "@/features/seating/lib/seating-canvas";
import { getSeatingBoard } from "@/services/seating-service";

describe("seating-canvas helpers", () => {
  it("spreads chairs evenly on the ring", () => {
    const first = getChairPosition(0, "ROUND");
    const opposite = getChairPosition(5, "ROUND");

    expect(first.x).toBeGreaterThan(opposite.x);
    expect(first.y).toBeCloseTo(opposite.y, 4);
  });

  it("returns stage bounds for a 4x3 slot board", () => {
    const bounds = getBoardBounds();

    expect(bounds.width).toBeGreaterThan(1500);
    expect(bounds.height).toBeGreaterThan(1700);
  });

  it("finds nearest table slot", () => {
    const slots = getTableSlots();
    const slotIndex = getNearestSlotIndex(
      {
        x: slots[4]!.x + 20,
        y: slots[4]!.y + 10,
      },
      slots,
    );

    expect(slotIndex).toBe(4);
  });

  it("detects the seat under a drop point", async () => {
    const board = await getSeatingBoard();
    const table = board.tables[0]!;
    const tablePosition = { x: 120, y: 140 };
    const hitPoint = getAbsoluteChairPosition(tablePosition, 0, "ROUND");
    const seat = findSeatAtPoint(
      [table],
      { [table.id]: tablePosition },
      {
        x: hitPoint.x + CHAIR_RADIUS / 3,
        y: hitPoint.y,
      },
      "ROUND",
    );

    expect(seat?.id).toBe(table.seats[0]?.id);
  });
});
