"use client";

import { useMemo, useRef, useState } from "react";
import type { DragEvent as ReactDragEvent } from "react";
import { Circle, Group, Layer, Rect, Stage, Text } from "react-konva";
import type Konva from "konva";

import { useLocale } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SeatingCanvasTable } from "@/features/seating/components/seating-canvas-table";
import {
  CHAIR_RADIUS,
  SEATING_STAGE_PADDING,
  SEATING_TABLE_BOX,
  TABLE_CENTER,
  TABLE_RADIUS,
  findSeatAtPoint,
  getBoardBounds,
  getChairPosition,
  getNearestSlotIndex,
  getTableSlots,
  type TableShape,
} from "@/features/seating/lib/seating-canvas";
import { useSeatingSummary } from "@/features/seating/hooks/use-seating-summary";
import type { SeatingBoard } from "@/features/seating/types/seating";
import { canEditSeating } from "@/lib/access-control";
import { apiClient } from "@/lib/api-client";
import type { UserRole } from "@/lib/planner-domain";

type SeatEditorState = {
  seatId: string;
  guestId?: string;
  draft: string;
  x: number;
  y: number;
  error?: string;
};

type DraggingGuestState = {
  guestId: string;
  guestName: string;
  x: number;
  y: number;
};

const normalizeName = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l")
    .replace(/Ł/g, "L")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const dedupeGuestOptions = (board: SeatingBoard) =>
  Array.from(
    new Set([
      ...board.unassignedGuests.map((guest) => guest.fullName),
      ...board.tables.flatMap((table) =>
        table.seats
          .map((seat) => seat.guestName)
          .filter((value): value is string => Boolean(value)),
      ),
    ]),
  );

const findGuestByName = (board: SeatingBoard, guestName: string) => {
  const normalizedTarget = normalizeName(guestName);
  if (!normalizedTarget) {
    return undefined;
  }

  return (
    board.unassignedGuests.find(
      (guest) => normalizeName(guest.fullName) === normalizedTarget,
    ) ??
    board.tables
      .flatMap((table) =>
        table.seats
          .filter((seat) => seat.guestId && seat.guestName)
          .map((seat) => ({ id: seat.guestId!, fullName: seat.guestName! })),
      )
      .find((guest) => normalizeName(guest.fullName) === normalizedTarget)
  );
};

const createGuestAcronym = (guestName?: string) => {
  if (!guestName) {
    return "";
  }

  const parts = guestName.trim().split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
  }

  return guestName.slice(0, 2).toUpperCase();
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
  const [tableShape, setTableShape] = useState<TableShape>("ROUND");
  const [previewMode, setPreviewMode] = useState(false);
  const [seatEditor, setSeatEditor] = useState<SeatEditorState | null>(null);
  const [hoveredSlotIndex, setHoveredSlotIndex] = useState<number | null>(null);
  const [previewTooltip, setPreviewTooltip] = useState<{
    label: string;
    x: number;
    y: number;
  } | null>(null);
  const [draggingGuest, setDraggingGuest] = useState<DraggingGuestState | null>(
    null,
  );
  const stageRef = useRef<Konva.Stage | null>(null);
  const hoveredSlotIndexRef = useRef<number | null>(null);

  const guestOptions = useMemo(() => dedupeGuestOptions(board), [board]);
  const boardBounds = getBoardBounds();
  const tableSlots = useMemo(() => getTableSlots(), []);
  const tablePositions = useMemo(
    () =>
      Object.fromEntries(
        board.tables.map((table, index) => [
          table.id,
          tableSlots[index] ?? tableSlots[0]!,
        ]),
      ),
    [board.tables, tableSlots],
  );
  const summaryData = useSeatingSummary(board);
  const updateHoveredSlotIndex = (value: number | null) => {
    hoveredSlotIndexRef.current = value;
    setHoveredSlotIndex(value);
  };
  const getSlotIndexForTablePosition = (position: { x: number; y: number }) =>
    getNearestSlotIndex(
      {
        x: position.x + SEATING_TABLE_BOX.width / 2,
        y: position.y + SEATING_TABLE_BOX.height / 2,
      },
      tableSlots,
    );
  const getSlotIndexForPointerPosition = () => {
    const pointer = stageRef.current?.getPointerPosition();
    if (!pointer) {
      return null;
    }

    return getNearestSlotIndex(pointer, tableSlots);
  };

  const refreshBoard = async (body: string) => {
    const nextBoard = await apiClient<SeatingBoard>("/api/seating", {
      method: "POST",
      body,
    });
    setBoard(nextBoard);
    return nextBoard;
  };

  const commitGuestAssignment = async (seatId: string, guestName: string) => {
    if (!canEdit) {
      return;
    }

    const guest = findGuestByName(board, guestName);
    if (!guest) {
      setSeatEditor((current) =>
        current
          ? {
              ...current,
              error: "Nie znaleziono gościa o takim imieniu i nazwisku.",
            }
          : current,
      );
      return;
    }

    await refreshBoard(
      JSON.stringify({
        type: "ASSIGN_GUEST",
        guestId: guest.id,
        seatId,
      }),
    );
    setSeatEditor(null);
  };

  const clearSeatAssignment = async (guestId?: string) => {
    if (!canEdit || !guestId) {
      return;
    }

    await refreshBoard(
      JSON.stringify({
        type: "ASSIGN_GUEST",
        guestId,
      }),
    );
    setSeatEditor(null);
  };

  const handleTableMove = async (
    tableId: string,
    nextPosition: { x: number; y: number },
    sourcePosition: { x: number; y: number },
    eventTarget: { position: (value: { x: number; y: number }) => void },
  ) => {
    if (!canEdit) {
      eventTarget.position(sourcePosition);
      return;
    }

    const sourceSlotIndex = getSlotIndexForTablePosition(sourcePosition);
    const targetSlotIndex =
      hoveredSlotIndexRef.current ?? getSlotIndexForTablePosition(nextPosition);
    const targetPosition = tableSlots[targetSlotIndex] ?? sourcePosition;
    const collidedTable = board.tables.find(
      (table) =>
        table.id !== tableId &&
        tablePositions[table.id]?.x === targetPosition.x &&
        tablePositions[table.id]?.y === targetPosition.y,
    );

    eventTarget.position(sourcePosition);
    updateHoveredSlotIndex(null);

    if (
      targetSlotIndex === sourceSlotIndex ||
      !collidedTable ||
      collidedTable.id === tableId
    ) {
      return;
    }

    await refreshBoard(
      JSON.stringify({
        type: "SWAP_TABLES",
        sourceTableId: tableId,
        targetTableId: collidedTable.id,
      }),
    );
  };

  const handleCanvasDrop = async (event: ReactDragEvent<HTMLDivElement>) => {
    if (!canEdit) {
      return;
    }

    event.preventDefault();
    const guestId = event.dataTransfer.getData("text/guest-id");
    if (!guestId) {
      return;
    }

    stageRef.current?.setPointersPositions(event.nativeEvent);
    const pointer = stageRef.current?.getPointerPosition();
    if (!pointer) {
      return;
    }

    const seat = findSeatAtPoint(
      board.tables,
      tablePositions,
      pointer,
      tableShape,
    );
    if (!seat) {
      return;
    }

    await refreshBoard(
      JSON.stringify({
        type: "ASSIGN_GUEST",
        guestId,
        seatId: seat.id,
      }),
    );
  };

  const handleSeatedGuestDrop = async (
    guestId: string,
    guestName: string,
    position: { x: number; y: number },
  ) => {
    if (!canEdit) {
      return;
    }

    setDraggingGuest({
      guestId,
      guestName,
      x: position.x,
      y: position.y,
    });
  };

  const handleStagePointerMove = () => {
    if (!draggingGuest) {
      return;
    }

    const pointer = stageRef.current?.getPointerPosition();
    if (!pointer) {
      return;
    }

    setDraggingGuest((current) =>
      current
        ? {
            ...current,
            x: pointer.x,
            y: pointer.y,
          }
        : current,
    );
  };

  const handleStagePointerUp = async () => {
    if (!draggingGuest) {
      return;
    }

    const pointer = stageRef.current?.getPointerPosition();
    const guestId = draggingGuest.guestId;
    setDraggingGuest(null);
    if (!pointer) {
      return;
    }

    const seat = findSeatAtPoint(
      board.tables,
      tablePositions,
      pointer,
      tableShape,
    );
    if (!seat) {
      return;
    }

    await refreshBoard(
      JSON.stringify({
        type: "ASSIGN_GUEST",
        guestId,
        seatId: seat.id,
      }),
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          [messages.seating.assigned, summaryData.assigned],
          [messages.seating.openSeats, summaryData.openSeats],
          [messages.seating.unassigned, summaryData.unassigned],
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
              {messages.seating.layoutControls}
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <select
                className="h-10 rounded-full border border-[var(--color-card-tint)] bg-white px-4 text-sm text-[var(--color-ink)]"
                value={tableShape}
                onChange={(event) => {
                  setTableShape(event.target.value as TableShape);
                  setSeatEditor(null);
                }}
              >
                <option value="ROUND">{messages.seating.roundLayout}</option>
                <option value="RECTANGULAR">
                  {messages.seating.uShapeLayout}
                </option>
              </select>
              <Button
                type="button"
                variant={previewMode ? "default" : "outline"}
                className="rounded-full"
                onClick={() => setPreviewMode((current) => !current)}
              >
                {previewMode
                  ? messages.seating.backToEditor
                  : messages.seating.previewAllTables}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="border-white/70 bg-white/85">
        <CardHeader>
          <CardTitle className="font-display text-3xl text-[var(--color-ink)]">
            {messages.seating.unassignedGuests}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {board.unassignedGuests.map((guest) => (
            <button
              key={guest.id}
              type="button"
              draggable={canEdit}
              onDragStart={(event) =>
                event.dataTransfer.setData("text/guest-id", guest.id)
              }
              className="rounded-full bg-[var(--color-dusty-rose)] px-4 py-2 text-sm text-white"
            >
              {guest.fullName}
            </button>
          ))}
        </CardContent>
      </Card>

      {previewMode ? (
        <Card className="border-white/70 bg-white/85">
          <CardHeader>
            <CardTitle className="font-display text-3xl text-[var(--color-ink)]">
              {messages.seating.previewTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {board.tables.map((table) => {
              const previewScale = tableShape === "ROUND" ? 0.34 : 0.3;
              const previewWidth = Math.round(
                SEATING_TABLE_BOX.width * previewScale,
              );
              const previewHeight = Math.round(
                SEATING_TABLE_BOX.height * previewScale,
              );
              const previewChairRadius = Math.max(
                12,
                Math.round(CHAIR_RADIUS * previewScale),
              );

              return (
                <div
                  key={`preview-${table.id}`}
                  className="rounded-[1.5rem] border border-[var(--color-card-tint)] bg-[var(--color-card-tint)]/45 p-4"
                >
                  <p className="mb-3 text-center font-display text-2xl text-[var(--color-ink)]">
                    {table.name}
                  </p>
                  <div
                    className="relative mx-auto"
                    style={{ width: previewWidth, height: previewHeight }}
                  >
                    {tableShape === "ROUND" ? (
                      <div
                        className="absolute rounded-full border-[3px] border-[#c98b92] bg-[#fef6f3]"
                        style={{
                          width: TABLE_RADIUS * 2 * previewScale,
                          height: TABLE_RADIUS * 2 * previewScale,
                          left:
                            TABLE_CENTER.x * previewScale -
                            TABLE_RADIUS * previewScale,
                          top:
                            TABLE_CENTER.y * previewScale -
                            TABLE_RADIUS * previewScale,
                        }}
                      />
                    ) : (
                      <div
                        className="absolute rounded-[1.25rem] border-[3px] border-[#c98b92] bg-[#fef6f3]"
                        style={{
                          width: (SEATING_TABLE_BOX.width - 232) * previewScale,
                          height:
                            (SEATING_TABLE_BOX.height - 320) * previewScale,
                          left: 116 * previewScale,
                          top: 160 * previewScale,
                        }}
                      />
                    )}
                    {table.seats.map((seat, seatIndex) => {
                      const chair = getChairPosition(seatIndex, tableShape);
                      const acronym = createGuestAcronym(seat.guestName);
                      return (
                        <div
                          key={seat.id}
                          className={`absolute flex items-center justify-center rounded-full border text-[10px] font-semibold ${
                            seat.guestName
                              ? "border-[#b66f87] bg-[#d89bae] text-white"
                              : "border-[#d8c0c6] bg-white text-[#7a5b65]"
                          }`}
                          style={{
                            width: previewChairRadius * 2,
                            height: previewChairRadius * 2,
                            left: chair.x * previewScale - previewChairRadius,
                            top: chair.y * previewScale - previewChairRadius,
                          }}
                          onMouseEnter={() =>
                            setPreviewTooltip({
                              label: seat.guestName ?? seat.label,
                              x: chair.x * previewScale,
                              y:
                                chair.y * previewScale - previewChairRadius - 8,
                            })
                          }
                          onMouseMove={() =>
                            setPreviewTooltip({
                              label: seat.guestName ?? seat.label,
                              x: chair.x * previewScale,
                              y:
                                chair.y * previewScale - previewChairRadius - 8,
                            })
                          }
                          onMouseLeave={() => setPreviewTooltip(null)}
                        >
                          {seat.guestName ? acronym : seat.label}
                        </div>
                      );
                    })}
                    {previewTooltip ? (
                      <div
                        className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-full bg-[var(--color-ink)] px-3 py-1 text-xs text-white shadow-[0_12px_30px_rgba(59,47,52,0.2)]"
                        style={{
                          left: previewTooltip.x,
                          top: previewTooltip.y,
                        }}
                      >
                        {previewTooltip.label}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-auto rounded-[2rem] border border-white/70 bg-white/35 p-3">
          <div
            className="relative overflow-hidden rounded-[1.6rem] bg-[linear-gradient(180deg,_rgba(255,251,247,0.96),_rgba(247,236,233,0.9))]"
            style={{
              width: boardBounds.width,
              height: boardBounds.height,
            }}
            onDragOver={(event) => {
              if (canEdit) {
                event.preventDefault();
              }
            }}
            onDrop={handleCanvasDrop}
          >
            <Stage
              ref={stageRef}
              width={boardBounds.width}
              height={boardBounds.height}
              onMouseMove={handleStagePointerMove}
              onTouchMove={handleStagePointerMove}
              onMouseUp={() => {
                void handleStagePointerUp();
              }}
              onTouchEnd={() => {
                void handleStagePointerUp();
              }}
            >
              <Layer>
                <Rect
                  x={0}
                  y={0}
                  width={boardBounds.width}
                  height={boardBounds.height}
                  fill="#fffaf7"
                />
                {tableSlots.map((slot, index) => (
                  <Rect
                    key={`slot-${slot.x}-${slot.y}`}
                    x={slot.x}
                    y={slot.y}
                    width={SEATING_TABLE_BOX.width}
                    height={SEATING_TABLE_BOX.height}
                    cornerRadius={28}
                    stroke={hoveredSlotIndex === index ? "#c98b92" : "#ead3d8"}
                    strokeWidth={hoveredSlotIndex === index ? 4 : 2}
                    dash={hoveredSlotIndex === index ? [18, 8] : [12, 10]}
                    fill={
                      hoveredSlotIndex === index
                        ? "rgba(216,155,174,0.22)"
                        : index % 2 === 0
                          ? "rgba(255,255,255,0.12)"
                          : "rgba(253,233,239,0.08)"
                    }
                  />
                ))}
                <Rect
                  x={SEATING_STAGE_PADDING / 2}
                  y={SEATING_STAGE_PADDING / 2}
                  width={boardBounds.width - SEATING_STAGE_PADDING}
                  height={boardBounds.height - SEATING_STAGE_PADDING}
                  cornerRadius={28}
                  stroke="#ead3d8"
                  strokeWidth={2}
                  dash={[12, 10]}
                />
                {board.tables.map((table, index) => (
                  <SeatingCanvasTable
                    key={table.id}
                    table={table}
                    position={
                      tablePositions[table.id] ??
                      tableSlots[index] ?? { x: 0, y: 0 }
                    }
                    shape={tableShape}
                    canEdit={canEdit}
                    allowTableDrag={!draggingGuest}
                    onDragStart={() => {
                      setSeatEditor(null);
                      updateHoveredSlotIndex(index);
                    }}
                    onDragMove={(position) =>
                      updateHoveredSlotIndex(
                        getSlotIndexForPointerPosition() ??
                          getSlotIndexForTablePosition(position),
                      )
                    }
                    onMove={handleTableMove}
                    onSeatClick={(seatId, position, guestName, guestId) =>
                      setSeatEditor({
                        seatId,
                        guestId,
                        draft: guestName ?? "",
                        x: Math.min(position.x + 18, boardBounds.width - 320),
                        y: Math.min(position.y + 18, boardBounds.height - 160),
                      })
                    }
                    onGuestDrop={handleSeatedGuestDrop}
                  />
                ))}
                {draggingGuest ? (
                  <Group
                    x={draggingGuest.x}
                    y={draggingGuest.y}
                    listening={false}
                  >
                    <Circle
                      x={0}
                      y={0}
                      radius={26}
                      fill="#d89bae"
                      stroke="#b66f87"
                      strokeWidth={2}
                      opacity={0.92}
                    />
                    <Text
                      x={-76}
                      y={34}
                      width={152}
                      align="center"
                      text={draggingGuest.guestName}
                      fill="#5f4450"
                      fontSize={13}
                    />
                  </Group>
                ) : null}
              </Layer>
            </Stage>

            {seatEditor ? (
              <div
                className="absolute z-10 w-72 rounded-[1.25rem] border border-white/80 bg-white/95 p-3 shadow-[0_18px_50px_rgba(79,51,64,0.18)] backdrop-blur"
                style={{
                  left: seatEditor.x,
                  top: seatEditor.y,
                }}
              >
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-dusty-rose)]">
                  {messages.seating.dropGuestHere}
                </p>
                <input
                  autoFocus
                  list={`guests-${seatEditor.seatId}`}
                  value={seatEditor.draft}
                  onChange={(event) =>
                    setSeatEditor((current) =>
                      current
                        ? {
                            ...current,
                            draft: event.target.value,
                            error: undefined,
                          }
                        : current,
                    )
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void commitGuestAssignment(
                        seatEditor.seatId,
                        seatEditor.draft,
                      );
                    }
                    if (event.key === "Escape") {
                      setSeatEditor(null);
                    }
                  }}
                  placeholder={messages.seating.dropGuestHere}
                  className="mt-2 h-10 w-full rounded-xl border px-3 text-sm text-[var(--color-ink)]"
                />
                <datalist id={`guests-${seatEditor.seatId}`}>
                  {guestOptions.map((option) => (
                    <option key={option} value={option} />
                  ))}
                </datalist>
                {seatEditor.error ? (
                  <p className="mt-2 text-sm text-[#b14c65]">
                    {seatEditor.error}
                  </p>
                ) : null}
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    className="rounded-full bg-[var(--color-dusty-rose)] px-4 py-2 text-sm text-white"
                    onClick={() =>
                      void commitGuestAssignment(
                        seatEditor.seatId,
                        seatEditor.draft,
                      )
                    }
                  >
                    Zapisz
                  </button>
                  {seatEditor.guestId ? (
                    <button
                      type="button"
                      className="rounded-full border border-[var(--color-card-tint)] px-4 py-2 text-sm text-[var(--color-ink)]"
                      onClick={() =>
                        void clearSeatAssignment(seatEditor.guestId)
                      }
                    >
                      Usuń
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="rounded-full border border-[var(--color-card-tint)] px-4 py-2 text-sm text-[var(--color-ink)]"
                    onClick={() => setSeatEditor(null)}
                  >
                    Zamknij
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
