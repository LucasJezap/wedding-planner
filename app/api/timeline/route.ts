import {
  createTimelineHandler,
  getTimelineHandler,
} from "@/server/api/timeline-handler";
import {
  errorResponse,
  getErrorStatus,
  successResponse,
} from "@/server/api/helpers";
import { canEditTimeline } from "@/lib/access-control";
import { getRequiredSession } from "@/lib/require-auth";

export const GET = async () => {
  try {
    await getRequiredSession();
    return successResponse(await getTimelineHandler());
  } catch (error) {
    return errorResponse(error, getErrorStatus(error));
  }
};

export const POST = async (request: Request) => {
  try {
    const session = await getRequiredSession();
    if (!canEditTimeline(session.user.role)) {
      throw new Error("Forbidden");
    }
    return successResponse(await createTimelineHandler(await request.json()));
  } catch (error) {
    return errorResponse(error, getErrorStatus(error));
  }
};
