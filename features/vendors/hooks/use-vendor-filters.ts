"use client";

import { useDeferredValue } from "react";

import type { VendorView } from "@/lib/planner-domain";

export const useVendorFilters = (
  vendors: VendorView[],
  search: string,
  categoryId: "ALL" | string,
): VendorView[] => {
  const deferredSearch = useDeferredValue(search);
  const query = deferredSearch.trim().toLowerCase();

  return vendors.filter((vendor) => {
    if (
      categoryId !== "ALL" &&
      vendor.categoryId !== categoryId &&
      vendor.categoryType !== categoryId
    ) {
      return false;
    }

    if (!query) {
      return true;
    }

    return (
      vendor.name.toLowerCase().includes(query) ||
      vendor.categoryName.toLowerCase().includes(query) ||
      vendor.categoryType.toLowerCase().includes(query)
    );
  });
};
