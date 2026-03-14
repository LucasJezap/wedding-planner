import { renderHook } from "@testing-library/react";

import { useSeatingSummary } from "@/features/seating/hooks/use-seating-summary";
import { getSeatingBoard } from "@/services/seating-service";

describe("useSeatingSummary", () => {
  it("computes board counts", async () => {
    const board = await getSeatingBoard();
    const { result } = renderHook(() => useSeatingSummary(board));
    expect(result.current.assigned).toBeGreaterThan(0);
    expect(result.current.openSeats).toBeGreaterThan(0);
  });
});
