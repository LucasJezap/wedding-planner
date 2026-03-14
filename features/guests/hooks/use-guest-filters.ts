"use client";

import { useDeferredValue } from "react";

import type { GuestView } from "@/lib/planner-domain";

export const useGuestFilters = (
  guests: GuestView[],
  search: string,
  side: string,
): GuestView[] => {
  const deferredSearch = useDeferredValue(search);
  const query = deferredSearch.trim().toLowerCase();

  return guests.filter((guest) => {
    const matchesSearch =
      query.length === 0 ||
      guest.fullName.toLowerCase().includes(query) ||
      guest.email.toLowerCase().includes(query);

    const matchesSide = side === "ALL" || guest.side === side;

    return matchesSearch && matchesSide;
  });
};
