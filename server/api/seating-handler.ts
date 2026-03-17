import type { SeatingMutation } from "@/features/seating/types/seating";
import {
  assignGuestToSeat,
  getSeatingBoard,
  swapTableAssignments,
  updateTablePosition,
} from "@/services/seating-service";

export const getSeatingHandler = async () => getSeatingBoard();
export const updateSeatingHandler = async (input: SeatingMutation) => {
  if (input.type === "SWAP_TABLES") {
    return swapTableAssignments(input);
  }
  if (input.type === "MOVE_TABLE") {
    return updateTablePosition(input);
  }
  return assignGuestToSeat(input);
};
