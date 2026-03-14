import { createBudgetCategoryHandler } from "@/server/api/budget-handler";
import { errorResponse, successResponse } from "@/server/api/helpers";
import { getRequiredSession } from "@/lib/require-auth";

export const POST = async (request: Request) => {
  try {
    await getRequiredSession("budget");
    return successResponse(
      await createBudgetCategoryHandler(await request.json()),
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
