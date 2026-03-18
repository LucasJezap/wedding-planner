"use client";

import { useDeferredValue } from "react";

import type { VendorCategoryType, VendorView } from "@/lib/planner-domain";

export const useVendorFilters = (
  vendors: VendorView[],
  search: string,
  categoryType: "ALL" | VendorCategoryType,
): VendorView[] => {
  const deferredSearch = useDeferredValue(search);
  const query = deferredSearch.trim().toLowerCase();

  return vendors.filter((vendor) => {
    if (categoryType !== "ALL" && vendor.categoryType !== categoryType) {
      return false;
    }

    if (!query) {
      return true;
    }

    return (
      vendor.name.toLowerCase().includes(query) ||
      vendor.categoryName.toLowerCase().includes(query)
    );
  });
};
