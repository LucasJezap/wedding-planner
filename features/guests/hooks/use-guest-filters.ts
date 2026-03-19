"use client";

import { useDeferredValue } from "react";

import type { GuestView } from "@/lib/planner-domain";

export const useGuestFilters = (
  guests: GuestView[],
  search: string,
  side: string,
  group: string,
): GuestView[] => {
  const deferredSearch = useDeferredValue(search);
  const query = deferredSearch.trim().toLowerCase();

  return guests.filter((guest) => {
    const matchesSearch =
      query.length === 0 ||
      guest.fullName.toLowerCase().includes(query) ||
      guest.email.toLowerCase().includes(query);

    const matchesSide = side === "ALL" || guest.side === side;

    const matchesGroup = group === "ALL" || (guest.groupName ?? "") === group;

    return matchesSearch && matchesSide && matchesGroup;
  });
};
