"use client";

import { Circle, Group, Rect, Text } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";

import {
  CHAIR_RADIUS,
  SEATING_TABLE_BOX,
  TABLE_CENTER,
  TABLE_RADIUS,
  getChairPosition,
  type TableShape,
} from "@/features/seating/lib/seating-canvas";
import { getTableDisplayName } from "@/features/seating/lib/seating-table-order";
import { SEATS_PER_TABLE } from "@/features/seating/lib/seating-seat";
import type { SeatingTableView } from "@/lib/planner-domain";

type SeatingCanvasTableProps = {
  table: SeatingTableView;
  position: { x: number; y: number };
  shape: TableShape;
  canEdit: boolean;
  allowTableDrag: boolean;
  onDragStart?: () => void;
  onDragMove?: (position: { x: number; y: number }) => void;
  onMove: (
    tableId: string,
    nextPosition: { x: number; y: number },
    sourcePosition: { x: number; y: number },
    eventTarget: { position: (value: { x: number; y: number }) => void },
  ) => void;
  onSeatClick: (
    seatId: string,
    position: { x: number; y: number },
    guestName?: string,
    guestId?: string,
  ) => void;
  onGuestDrop: (
    guestId: string,
    guestName: string,
    position: { x: number; y: number },
  ) => void;
};

const getSeatNameBlockPosition = (
  chairPosition: { x: number; y: number },
  shape: TableShape,
) => {
  if (shape === "RECTANGULAR") {
    if (chairPosition.y < TABLE_CENTER.y) {
      return {
        x: chairPosition.x - 76,
        y: chairPosition.y - 72,
      };
    }
    if (chairPosition.y > TABLE_CENTER.y) {
      return {
        x: chairPosition.x - 76,
        y: chairPosition.y + 32,
      };
    }
    if (chairPosition.x < TABLE_CENTER.x) {
      return {
        x: chairPosition.x - 150,
        y: chairPosition.y - 18,
      };
    }
    return {
      x: chairPosition.x + 40,
      y: chairPosition.y - 18,
    };
  }

  const horizontalOffset = chairPosition.x < TABLE_CENTER.x ? -166 : 14;
  const verticalOffset =
    chairPosition.y < TABLE_CENTER.y
      ? -66
      : chairPosition.y > TABLE_CENTER.y
        ? 30
        : -18;

  return {
    x: chairPosition.x + horizontalOffset,
    y: chairPosition.y + verticalOffset,
  };
};

export const SeatingCanvasTable = ({
  table,
  position,
  shape,
  canEdit,
  allowTableDrag,
  onDragStart,
  onDragMove,
  onMove,
  onSeatClick,
  onGuestDrop,
}: SeatingCanvasTableProps) => {
  const blockTableDrag = (event: KonvaEventObject<MouseEvent | TouchEvent>) => {
    event.cancelBubble = true;
  };

  const handleSeatClick =
    (seatIndex: number) =>
    (event: KonvaEventObject<MouseEvent | TouchEvent>) => {
      event.cancelBubble = true;
      const seat = table.seats[seatIndex];
      if (!seat) {
        return;
      }

      onSeatClick(
        seat.id,
        event.target.absolutePosition(),
        seat.guestName,
        seat.guestId,
      );
    };

  const handleGuestDragStart =
    (guestId: string, guestName: string) =>
    (event: KonvaEventObject<MouseEvent | TouchEvent>) => {
      event.cancelBubble = true;
      onGuestDrop(guestId, guestName, event.target.getAbsolutePosition());
    };

  return (
    <Group
      x={position.x}
      y={position.y}
      draggable={canEdit && allowTableDrag}
      onDragStart={onDragStart}
      onDragMove={(event) =>
        onDragMove?.({
          x: Math.round(event.target.x()),
          y: Math.round(event.target.y()),
        })
      }
      onDragEnd={(event) =>
        onMove(
          table.id,
          {
            x: Math.round(event.target.x()),
            y: Math.round(event.target.y()),
          },
          position,
          event.target,
        )
      }
      aria-label={table.name}
    >
      <Rect
        x={0}
        y={0}
        width={SEATING_TABLE_BOX.width}
        height={SEATING_TABLE_BOX.height}
        cornerRadius={28}
        fill="rgba(255,255,255,0.26)"
        stroke="#ead3d8"
        strokeWidth={2}
        dash={[10, 12]}
      />

      {shape === "RECTANGULAR" ? (
        <Rect
          x={90}
          y={130}
          width={SEATING_TABLE_BOX.width - 180}
          height={SEATING_TABLE_BOX.height - 260}
          cornerRadius={28}
          fill="#fef6f3"
          stroke="#c98b92"
          strokeWidth={3}
          shadowBlur={18}
          shadowColor="rgba(132, 71, 78, 0.16)"
        />
      ) : (
        <Circle
          x={TABLE_CENTER.x}
          y={TABLE_CENTER.y}
          radius={TABLE_RADIUS}
          fill="#fef6f3"
          stroke="#c98b92"
          strokeWidth={3}
          shadowBlur={18}
          shadowColor="rgba(132, 71, 78, 0.16)"
        />
      )}

      <Text
        x={32}
        y={TABLE_CENTER.y - 18}
        width={SEATING_TABLE_BOX.width - 64}
        align="center"
        verticalAlign="middle"
        text={getTableDisplayName(table.name)}
        fill="#4f3340"
        fontSize={22}
        fontStyle="700"
      />

      {Array.from({ length: SEATS_PER_TABLE }, (_, seatIndex) => {
        const seat = table.seats[seatIndex];
        const chair = getChairPosition(seatIndex, shape);
        const isFilled = Boolean(seat?.guestId);
        const namePosition = getSeatNameBlockPosition(chair, shape);

        return (
          <Group
            key={seat?.id ?? `${table.id}-chair-${seatIndex}`}
            onMouseDown={blockTableDrag}
            onTouchStart={blockTableDrag}
          >
            <Circle
              x={chair.x}
              y={chair.y}
              radius={CHAIR_RADIUS}
              fill={isFilled ? "#d89bae" : "#fffaf8"}
              stroke={isFilled ? "#b66f87" : "#d8c0c6"}
              strokeWidth={2}
              onMouseDown={
                seat?.guestId && seat.guestName && canEdit
                  ? handleGuestDragStart(seat.guestId, seat.guestName)
                  : blockTableDrag
              }
              onTouchStart={
                seat?.guestId && seat.guestName && canEdit
                  ? handleGuestDragStart(seat.guestId, seat.guestName)
                  : blockTableDrag
              }
              onClick={handleSeatClick(seatIndex)}
              onTap={handleSeatClick(seatIndex)}
            />
            <Text
              x={chair.x - 18}
              y={chair.y - 8}
              width={36}
              align="center"
              text={seat?.label ?? String(seatIndex + 1)}
              fill={isFilled ? "#ffffff" : "#7a5b65"}
              fontSize={11}
              fontStyle="700"
              listening={false}
            />
            <Text
              x={namePosition.x}
              y={namePosition.y}
              width={152}
              align="center"
              wrap="word"
              text={seat?.guestName ?? ""}
              fill="#5f4450"
              fontSize={13}
              lineHeight={1.15}
              listening={false}
            />
          </Group>
        );
      })}
    </Group>
  );
};
