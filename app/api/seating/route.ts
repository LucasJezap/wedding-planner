import { getRequiredSession } from "@/lib/require-auth";
import { canEditSeating } from "@/lib/access-control";
import {
  errorResponse,
  getErrorStatus,
  successResponse,
} from "@/server/api/helpers";
import {
  getSeatingHandler,
  updateSeatingHandler,
} from "@/server/api/seating-handler";

export const GET = async () => {
  try {
    await getRequiredSession();
    return successResponse(await getSeatingHandler());
  } catch (error) {
    return errorResponse(error, getErrorStatus(error));
  }
};

export const POST = async (request: Request) => {
  try {
    const session = await getRequiredSession();
    if (!canEditSeating(session.user.role)) {
      throw new Error("Forbidden");
    }
    return successResponse(await updateSeatingHandler(await request.json()));
  } catch (error) {
    return errorResponse(error, getErrorStatus(error));
  }
};
