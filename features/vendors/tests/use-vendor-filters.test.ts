import { renderHook } from "@testing-library/react";

import { useVendorFilters } from "@/features/vendors/hooks/use-vendor-filters";
import { createPlannerSeed } from "@/lib/planner-seed";

describe("useVendorFilters", () => {
  it("matches vendor names and categories", () => {
    const seed = createPlannerSeed();
    const vendors = seed.vendors.map((vendor) => ({
      ...vendor,
      categoryName: "Venue",
      categoryType: "VENUE" as const,
      contactEmail: "",
      contactPhone: "",
      notes: "",
    }));

    const { result } = renderHook(() =>
      useVendorFilters(vendors, "Ivory", "ALL"),
    );
    expect(result.current).toHaveLength(1);
  });

  it("filters by category id", () => {
    const seed = createPlannerSeed();
    const vendors = seed.vendors.map((vendor) => ({
      ...vendor,
      categoryName:
        seed.vendorCategories.find(
          (category) => category.id === vendor.categoryId,
        )?.name ?? "",
      categoryType:
        seed.vendorCategories.find(
          (category) => category.id === vendor.categoryId,
        )?.type ?? "OTHER",
      contactEmail: "",
      contactPhone: "",
      notes: "",
    }));

    const { result } = renderHook(() =>
      useVendorFilters(vendors, "", "vendor-category-2"),
    );

    expect(result.current.map((vendor) => vendor.name)).toEqual([
      "Rose Atelier",
    ]);
  });
});
