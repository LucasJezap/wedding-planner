import { bulkGuestHandler } from "@/server/api/guest-handler";
import {
  errorResponse,
  getErrorStatus,
  successResponse,
} from "@/server/api/helpers";
import { canEditGuests } from "@/lib/access-control";
import { getRequiredSession } from "@/lib/require-auth";

export const POST = async (request: Request) => {
  try {
    const session = await getRequiredSession();
    if (!canEditGuests(session.user.role)) {
      throw new Error("Forbidden");
    }
    return successResponse(await bulkGuestHandler(await request.json()));
  } catch (error) {
    return errorResponse(error, getErrorStatus(error));
  }
};
