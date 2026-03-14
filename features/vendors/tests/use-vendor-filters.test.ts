import { renderHook } from "@testing-library/react";

import { useVendorFilters } from "@/features/vendors/hooks/use-vendor-filters";
import { createPlannerSeed } from "@/lib/planner-seed";

describe("useVendorFilters", () => {
  it("matches vendor names and categories", () => {
    const seed = createPlannerSeed();
    const vendors = seed.vendors.map((vendor) => ({
      ...vendor,
      categoryName: "Venue",
      contactEmail: "",
      contactPhone: "",
      notes: "",
    }));

    const { result } = renderHook(() => useVendorFilters(vendors, "Ivory"));
    expect(result.current).toHaveLength(1);
  });
});
