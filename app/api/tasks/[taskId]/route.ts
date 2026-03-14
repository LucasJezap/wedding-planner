import {
  deleteTaskHandler,
  updateTaskHandler,
} from "@/server/api/task-handler";
import {
  errorResponse,
  getErrorStatus,
  successResponse,
} from "@/server/api/helpers";
import { canEditTasks } from "@/lib/access-control";
import { getRequiredSession } from "@/lib/require-auth";

type Context = {
  params: Promise<{
    taskId: string;
  }>;
};

export const PATCH = async (request: Request, context: Context) => {
  try {
    const session = await getRequiredSession();
    if (!canEditTasks(session.user.role)) {
      throw new Error("Forbidden");
    }
    const { taskId } = await context.params;
    return successResponse(
      await updateTaskHandler(taskId, await request.json()),
    );
  } catch (error) {
    return errorResponse(error, getErrorStatus(error));
  }
};

export const DELETE = async (_request: Request, context: Context) => {
  try {
    const session = await getRequiredSession();
    if (!canEditTasks(session.user.role)) {
      throw new Error("Forbidden");
    }
    const { taskId } = await context.params;
    await deleteTaskHandler(taskId);
    return successResponse({ taskId });
  } catch (error) {
    return errorResponse(error, getErrorStatus(error));
  }
};
