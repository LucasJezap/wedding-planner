import {
  deleteGuestHandler,
  updateGuestHandler,
} from "@/server/api/guest-handler";
import {
  errorResponse,
  getErrorStatus,
  successResponse,
} from "@/server/api/helpers";
import { canEditGuests } from "@/lib/access-control";
import { getRequiredSession } from "@/lib/require-auth";

type Context = {
  params: Promise<{
    guestId: string;
  }>;
};

export const PATCH = async (request: Request, context: Context) => {
  try {
    const session = await getRequiredSession();
    if (!canEditGuests(session.user.role)) {
      throw new Error("Forbidden");
    }
    const { guestId } = await context.params;
    return successResponse(
      await updateGuestHandler(guestId, await request.json()),
    );
  } catch (error) {
    return errorResponse(error, getErrorStatus(error));
  }
};

export const DELETE = async (_request: Request, context: Context) => {
  try {
    const session = await getRequiredSession();
    if (!canEditGuests(session.user.role)) {
      throw new Error("Forbidden");
    }
    const { guestId } = await context.params;
    await deleteGuestHandler(guestId);
    return successResponse({ guestId });
  } catch (error) {
    return errorResponse(error, getErrorStatus(error));
  }
};
