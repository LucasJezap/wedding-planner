import { renderHook } from "@testing-library/react";

import { useGuestFilters } from "@/features/guests/hooks/use-guest-filters";
import { createPlannerSeed } from "@/lib/planner-seed";

describe("useGuestFilters", () => {
  it("filters guests by search and side", () => {
    const state = createPlannerSeed();
    const guests = state.guests.map((guest) => ({
      ...guest,
      fullName: `${guest.firstName} ${guest.lastName}`,
      email: "guest@example.com",
      phone: "",
      notes: "",
    }));

    const { result } = renderHook(() =>
      useGuestFilters(guests, "Emma", "BRIDE"),
    );
    expect(result.current).toHaveLength(1);
  });
});
