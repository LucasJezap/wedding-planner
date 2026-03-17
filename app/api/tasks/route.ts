import { createTaskHandler, getTasksHandler } from "@/server/api/task-handler";
import {
  errorResponse,
  getErrorStatus,
  successResponse,
} from "@/server/api/helpers";
import { canCreateTasks } from "@/lib/access-control";
import { getRequiredSession } from "@/lib/require-auth";

export const GET = async () => {
  try {
    const session = await getRequiredSession();
    return successResponse(await getTasksHandler(session.user.role));
  } catch (error) {
    return errorResponse(error, getErrorStatus(error));
  }
};

export const POST = async (request: Request) => {
  try {
    const session = await getRequiredSession();
    if (!canCreateTasks(session.user.role)) {
      throw new Error("Forbidden");
    }
    return successResponse(
      await createTaskHandler(await request.json(), session.user.role),
    );
  } catch (error) {
    return errorResponse(error, getErrorStatus(error));
  }
};
