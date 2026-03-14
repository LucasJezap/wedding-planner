import {
  deleteTimelineHandler,
  updateTimelineHandler,
} from "@/server/api/timeline-handler";
import {
  errorResponse,
  getErrorStatus,
  successResponse,
} from "@/server/api/helpers";
import { canEditTimeline } from "@/lib/access-control";
import { getRequiredSession } from "@/lib/require-auth";

type Context = {
  params: Promise<{
    eventId: string;
  }>;
};

export const PATCH = async (request: Request, context: Context) => {
  try {
    const session = await getRequiredSession();
    if (!canEditTimeline(session.user.role)) {
      throw new Error("Forbidden");
    }
    const { eventId } = await context.params;
    return successResponse(
      await updateTimelineHandler(eventId, await request.json()),
    );
  } catch (error) {
    return errorResponse(error, getErrorStatus(error));
  }
};

export const DELETE = async (_request: Request, context: Context) => {
  try {
    const session = await getRequiredSession();
    if (!canEditTimeline(session.user.role)) {
      throw new Error("Forbidden");
    }
    const { eventId } = await context.params;
    await deleteTimelineHandler(eventId);
    return successResponse({ eventId });
  } catch (error) {
    return errorResponse(error, getErrorStatus(error));
  }
};
