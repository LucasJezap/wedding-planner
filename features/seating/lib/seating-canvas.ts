import type { SeatingTableView } from "@/lib/planner-domain";

import { SEATS_PER_TABLE } from "@/features/seating/lib/seating-seat";

export const SEATING_TABLE_BOX = {
  width: 520,
  height: 420,
} as const;

export const TABLE_CENTER = {
  x: SEATING_TABLE_BOX.width / 2,
  y: SEATING_TABLE_BOX.height / 2,
} as const;

export const TABLE_RADIUS = 88;
export const CHAIR_RADIUS = 28;
export const CHAIR_RING_RADIUS = 154;
export const SEATING_STAGE_PADDING = 64;
export const SLOT_COLUMNS = 3;
export const SLOT_ROWS = 4;
export const SLOT_GAP_X = 46;
export const SLOT_GAP_Y = 34;

export type CanvasPoint = {
  x: number;
  y: number;
};

export type TablePositionMap = Record<string, CanvasPoint>;
export type TableShape = "ROUND" | "RECTANGULAR";

export const getChairAngle = (index: number) =>
  (index * 2 * Math.PI) / SEATS_PER_TABLE;

const getRoundChairPosition = (index: number): CanvasPoint => {
  const angle = getChairAngle(index);

  return {
    x: TABLE_CENTER.x + CHAIR_RING_RADIUS * Math.cos(angle),
    y: TABLE_CENTER.y + CHAIR_RING_RADIUS * Math.sin(angle),
  };
};

const RECTANGULAR_CHAIR_POSITIONS: CanvasPoint[] = [
  { x: 110, y: 88 },
  { x: 205, y: 88 },
  { x: 315, y: 88 },
  { x: 410, y: 88 },
  { x: 470, y: TABLE_CENTER.y },
  { x: 410, y: 332 },
  { x: 315, y: 332 },
  { x: 205, y: 332 },
  { x: 110, y: 332 },
  { x: 50, y: TABLE_CENTER.y },
];

export const getChairPosition = (
  index: number,
  shape: TableShape,
): CanvasPoint =>
  shape === "RECTANGULAR"
    ? (RECTANGULAR_CHAIR_POSITIONS[index] ?? RECTANGULAR_CHAIR_POSITIONS[0]!)
    : getRoundChairPosition(index);

export const getAbsoluteChairPosition = (
  tablePosition: CanvasPoint,
  chairIndex: number,
  shape: TableShape,
): CanvasPoint => {
  const chair = getChairPosition(chairIndex, shape);

  return {
    x: tablePosition.x + chair.x,
    y: tablePosition.y + chair.y,
  };
};

export const getBoardBounds = () => ({
  width:
    SEATING_STAGE_PADDING * 2 +
    SLOT_COLUMNS * SEATING_TABLE_BOX.width +
    (SLOT_COLUMNS - 1) * SLOT_GAP_X,
  height:
    SEATING_STAGE_PADDING * 2 +
    SLOT_ROWS * SEATING_TABLE_BOX.height +
    (SLOT_ROWS - 1) * SLOT_GAP_Y,
});

export const getTableSlots = () =>
  Array.from({ length: SLOT_ROWS * SLOT_COLUMNS }, (_, index) => {
    const column = index % SLOT_COLUMNS;
    const row = Math.floor(index / SLOT_COLUMNS);

    return {
      x:
        SEATING_STAGE_PADDING + column * (SEATING_TABLE_BOX.width + SLOT_GAP_X),
      y: SEATING_STAGE_PADDING + row * (SEATING_TABLE_BOX.height + SLOT_GAP_Y),
    };
  });

export const getNearestSlotIndex = (
  point: CanvasPoint,
  slots = getTableSlots(),
) =>
  slots.reduce(
    (closest, slot, index) => {
      const distance = Math.hypot(point.x - slot.x, point.y - slot.y);
      if (distance < closest.distance) {
        return { index, distance };
      }
      return closest;
    },
    { index: 0, distance: Number.POSITIVE_INFINITY },
  ).index;

export const findSeatAtPoint = (
  tables: SeatingTableView[],
  tablePositions: TablePositionMap,
  point: CanvasPoint,
  shape: TableShape,
) => {
  for (const table of tables) {
    const tablePosition = tablePositions[table.id] ?? { x: 0, y: 0 };

    for (let index = 0; index < SEATS_PER_TABLE; index += 1) {
      const seat = table.seats[index];
      if (!seat) {
        continue;
      }

      const chairPosition = getAbsoluteChairPosition(
        tablePosition,
        index,
        shape,
      );
      const distance = Math.hypot(
        point.x - chairPosition.x,
        point.y - chairPosition.y,
      );

      if (distance <= CHAIR_RADIUS + 10) {
        return seat;
      }
    }
  }

  return undefined;
};
