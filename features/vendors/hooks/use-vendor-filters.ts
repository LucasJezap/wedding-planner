"use client";

import { useDeferredValue } from "react";

import type { VendorView } from "@/lib/planner-domain";

export const useVendorFilters = (
  vendors: VendorView[],
  search: string,
): VendorView[] => {
  const deferredSearch = useDeferredValue(search);
  const query = deferredSearch.trim().toLowerCase();

  return vendors.filter((vendor) => {
    if (!query) {
      return true;
    }

    return (
      vendor.name.toLowerCase().includes(query) ||
      vendor.categoryName.toLowerCase().includes(query)
    );
  });
};
