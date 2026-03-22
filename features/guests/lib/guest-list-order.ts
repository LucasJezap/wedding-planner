import type { GuestSide, GuestView } from "@/lib/planner-domain";

const sideOrder: Record<GuestSide, number> = {
  BRIDE: 0,
  GROOM: 1,
  FAMILY: 2,
  FRIENDS: 3,
};

const compareStrings = (left: string, right: string) =>
  left.localeCompare(right, "pl", { sensitivity: "base" });

const getGroupKey = (guest: GuestView) =>
  guest.invitationGroupId ?? guest.groupName?.trim() ?? "";

export const sortGuestsForList = (guests: GuestView[]) =>
  [...guests].sort((left, right) => {
    const sideDiff = sideOrder[left.side] - sideOrder[right.side];
    if (sideDiff !== 0) {
      return sideDiff;
    }

    const leftGroupKey = getGroupKey(left);
    const rightGroupKey = getGroupKey(right);
    const leftHasGroup = leftGroupKey.length > 0;
    const rightHasGroup = rightGroupKey.length > 0;

    if (leftHasGroup !== rightHasGroup) {
      return leftHasGroup ? -1 : 1;
    }

    if (leftGroupKey !== rightGroupKey) {
      return compareStrings(
        left.groupName ?? leftGroupKey,
        right.groupName ?? rightGroupKey,
      );
    }

    const lastNameDiff = compareStrings(left.lastName, right.lastName);
    if (lastNameDiff !== 0) {
      return lastNameDiff;
    }

    return compareStrings(left.firstName, right.firstName);
  });
