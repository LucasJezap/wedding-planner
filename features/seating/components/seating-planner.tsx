"use client";

import {
  DndContext,
  useDraggable,
  useDroppable,
  type DragEndEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";

import { useLocale } from "@/components/locale-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSeatingSummary } from "@/features/seating/hooks/use-seating-summary";
import type { SeatingBoard } from "@/features/seating/types/seating";
import { canEditSeating } from "@/lib/access-control";
import { apiClient } from "@/lib/api-client";
import type { UserRole } from "@/lib/planner-domain";

const buildDefaultPositions = (
  layout: "ROUND" | "U_SHAPE",
  tables: Array<{ id: string; positionX: number; positionY: number }>,
) =>
  Object.fromEntries(
    tables.map((table, index) => {
      if (table.positionX !== 0 || table.positionY !== 0) {
        return [table.id, { x: table.positionX, y: table.positionY }];
      }
      if (layout === "U_SHAPE") {
        const presets = [
          { x: 30, y: 30 },
          { x: 30, y: 300 },
          { x: 340, y: 460 },
          { x: 650, y: 300 },
          { x: 650, y: 30 },
          { x: 340, y: 30 },
        ];
        return [
          table.id,
          presets[index] ?? { x: 60 + index * 40, y: 80 + index * 30 },
        ];
      }

      const column = index % 3;
      const row = Math.floor(index / 3);
      return [table.id, { x: column * 320 + 20, y: row * 280 + 20 }];
    }),
  );

const DraggableGuest = ({
  guestId,
  name,
}: {
  guestId: string;
  name: string;
}) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: guestId,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className="rounded-full bg-[var(--color-dusty-rose)] px-4 py-2 text-sm text-white"
      {...listeners}
      {...attributes}
    >
      {name}
    </div>
  );
};

const DraggableTable = ({
  tableId,
  position,
  children,
}: {
  tableId: string;
  position: { x: number; y: number };
  children: React.ReactNode;
}) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `table:${tableId}`,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        width: 300,
        transform: CSS.Translate.toString(transform),
      }}
      {...listeners}
      {...attributes}
    >
      {children}
    </div>
  );
};

const DroppableUnassigned = ({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: "unassigned",
  });

  return (
    <div ref={setNodeRef}>
      <Card
        className="border-white/70 bg-white/85"
        style={{ background: isOver ? "#fde9ef" : undefined }}
      >
        <CardHeader>
          <CardTitle className="font-display text-3xl text-[var(--color-ink)]">
            {label}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">{children}</CardContent>
      </Card>
    </div>
  );
};

const DroppableSeat = ({
  seatId,
  label,
  guestName,
  guestId,
  emptyLabel,
  canEdit,
  guestOptions,
  onAssignByName,
}: {
  seatId: string;
  label: string;
  guestName?: string;
  guestId?: string;
  emptyLabel: string;
  canEdit: boolean;
  guestOptions: string[];
  onAssignByName: (seatId: string, guestName: string) => void;
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: seatId,
  });

  return (
    <div
      ref={setNodeRef}
      className="rounded-[1.25rem] border border-dashed p-3"
      style={{ background: isOver ? "#fde9ef" : "white" }}
    >
      <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-dusty-rose)]">
        {label}
      </p>
      <div className="mt-2">
        {guestId && guestName ? (
          <DraggableGuest guestId={guestId} name={guestName} />
        ) : canEdit ? (
          <div className="space-y-2">
            <input
              className="h-10 w-full rounded-xl border px-3 text-sm text-[var(--color-ink)]"
              list={`guests-${seatId}`}
              placeholder={emptyLabel}
              onChange={(event) => onAssignByName(seatId, event.target.value)}
            />
            <datalist id={`guests-${seatId}`}>
              {guestOptions.map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>
          </div>
        ) : (
          <p className="text-sm text-[var(--color-ink)]">{emptyLabel}</p>
        )}
      </div>
    </div>
  );
};

export const SeatingPlanner = ({
  initialBoard,
  viewerRole,
}: {
  initialBoard: SeatingBoard;
  viewerRole: UserRole;
}) => {
  const { messages } = useLocale();
  const canEdit = canEditSeating(viewerRole);
  const [board, setBoard] = useState(initialBoard);
  const [layout, setLayout] = useState<"ROUND" | "U_SHAPE">("ROUND");
  const [tablePositions, setTablePositions] = useState<
    Record<string, { x: number; y: number }>
  >(buildDefaultPositions("ROUND", initialBoard.tables));
  const summary = useSeatingSummary(board);
  const guestOptions = [
    ...board.unassignedGuests.map((guest) => guest.fullName),
    ...board.tables.flatMap(
      (table) =>
        table.seats.map((seat) => seat.guestName).filter(Boolean) as string[],
    ),
  ];

  const handleDragEnd = async (event: DragEndEvent) => {
    if (!canEdit) {
      return;
    }

    const activeId = String(event.active.id);
    if (activeId.startsWith("table:")) {
      const tableId = activeId.replace("table:", "");
      const nextPosition = (() => {
        const currentPosition = tablePositions[tableId] ?? { x: 0, y: 0 };
        return {
          x: Math.round(currentPosition.x + event.delta.x),
          y: Math.round(currentPosition.y + event.delta.y),
        };
      })();
      setTablePositions((current) => {
        const previous = current[tableId] ?? { x: 0, y: 0 };
        return {
          ...current,
          [tableId]: {
            x: Math.round(previous.x + event.delta.x),
            y: Math.round(previous.y + event.delta.y),
          },
        };
      });
      setBoard(
        await apiClient<SeatingBoard>("/api/seating", {
          method: "POST",
          body: JSON.stringify({
            type: "MOVE_TABLE",
            tableId,
            positionX: nextPosition.x,
            positionY: nextPosition.y,
          }),
        }),
      );
      return;
    }

    const seatId =
      event.over && String(event.over.id) !== "unassigned"
        ? String(event.over.id)
        : undefined;
    setBoard(
      await apiClient<SeatingBoard>("/api/seating", {
        method: "POST",
        body: JSON.stringify({
          type: "ASSIGN_GUEST",
          guestId: activeId,
          seatId,
        }),
      }),
    );
  };

  const assignByName = async (seatId: string, guestName: string) => {
    if (!canEdit) {
      return;
    }

    const guest =
      board.unassignedGuests.find(
        (candidate) => candidate.fullName === guestName,
      ) ??
      board.tables
        .flatMap((table) =>
          table.seats
            .filter((seat) => seat.guestId && seat.guestName)
            .map((seat) => ({ id: seat.guestId!, fullName: seat.guestName! })),
        )
        .find((candidate) => candidate.fullName === guestName);

    if (!guest) {
      return;
    }

    setBoard(
      await apiClient<SeatingBoard>("/api/seating", {
        method: "POST",
        body: JSON.stringify({
          type: "ASSIGN_GUEST",
          guestId: guest.id,
          seatId,
        }),
      }),
    );
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            [messages.seating.assigned, summary.assigned],
            [messages.seating.openSeats, summary.openSeats],
            [messages.seating.unassigned, summary.unassigned],
          ].map(([label, value]) => (
            <Card key={label} className="border-white/70 bg-white/85">
              <CardContent className="p-5">
                <p className="text-sm uppercase tracking-[0.25em] text-[var(--color-dusty-rose)]">
                  {label}
                </p>
                <p className="mt-2 font-display text-4xl text-[var(--color-ink)]">
                  {value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="border-white/70 bg-white/85">
          <CardHeader>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <CardTitle className="font-display text-3xl text-[var(--color-ink)]">
                {messages.seating.unassignedGuests}
              </CardTitle>
              <select
                className="h-10 rounded-full border border-[var(--color-card-tint)] bg-white px-4 text-sm text-[var(--color-ink)]"
                value={layout}
                onChange={(event) => {
                  const nextLayout = event.target.value as "ROUND" | "U_SHAPE";
                  setLayout(nextLayout);
                  setTablePositions(
                    buildDefaultPositions(nextLayout, board.tables),
                  );
                }}
              >
                <option value="ROUND">{messages.seating.roundLayout}</option>
                <option value="U_SHAPE">{messages.seating.uShapeLayout}</option>
              </select>
            </div>
          </CardHeader>
        </Card>
        <DroppableUnassigned label={messages.seating.unassignedGuests}>
          {board.unassignedGuests.map((guest) => (
            <DraggableGuest
              key={guest.id}
              guestId={guest.id}
              name={guest.fullName}
            />
          ))}
        </DroppableUnassigned>
        <div className="relative min-h-[900px] rounded-[2rem] border border-white/70 bg-white/35">
          {board.tables.map((table) => (
            <DraggableTable
              key={table.id}
              tableId={table.id}
              position={tablePositions[table.id] ?? { x: 0, y: 0 }}
            >
              <Card className="border-white/70 bg-white/85">
                <CardHeader>
                  <CardTitle className="font-display text-3xl text-[var(--color-ink)]">
                    {table.name.replace("STO-0-", "STOŁ ")}
                  </CardTitle>
                </CardHeader>
                <CardContent
                  className={
                    layout === "ROUND"
                      ? "grid gap-3 rounded-[1.5rem] bg-[var(--color-card-tint)]/40 p-4 sm:grid-cols-2"
                      : "grid gap-3 rounded-[1.5rem] border-[18px] border-[var(--color-card-tint)]/70 p-4 sm:grid-cols-3"
                  }
                >
                  {table.seats.map((seat) => (
                    <DroppableSeat
                      key={seat.id}
                      seatId={seat.id}
                      label={seat.label}
                      guestName={seat.guestName}
                      guestId={seat.guestId}
                      emptyLabel={messages.seating.dropGuestHere}
                      canEdit={canEdit}
                      guestOptions={guestOptions}
                      onAssignByName={assignByName}
                    />
                  ))}
                </CardContent>
              </Card>
            </DraggableTable>
          ))}
        </div>
      </div>
    </DndContext>
  );
};
