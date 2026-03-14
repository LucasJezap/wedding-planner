import {
  deleteExpenseHandler,
  updateExpenseHandler,
} from "@/server/api/budget-handler";
import { errorResponse, successResponse } from "@/server/api/helpers";
import { getRequiredSession } from "@/lib/require-auth";

type Context = {
  params: Promise<{
    expenseId: string;
  }>;
};

export const PATCH = async (request: Request, context: Context) => {
  try {
    await getRequiredSession("budget");
    const { expenseId } = await context.params;
    return successResponse(
      await updateExpenseHandler(expenseId, await request.json()),
    );
  } catch (error) {
    return errorResponse(
      error,
      error instanceof Error && error.message === "Unauthorized"
        ? 401
        : error instanceof Error && error.message === "Forbidden"
          ? 403
          : 400,
    );
  }
};

export const DELETE = async (_request: Request, context: Context) => {
  try {
    await getRequiredSession("budget");
    const { expenseId } = await context.params;
    await deleteExpenseHandler(expenseId);
    return successResponse({ expenseId });
  } catch (error) {
    return errorResponse(
      error,
      error instanceof Error && error.message === "Unauthorized"
        ? 401
        : error instanceof Error && error.message === "Forbidden"
          ? 403
          : 400,
    );
  }
};
