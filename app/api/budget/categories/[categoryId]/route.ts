import { deleteBudgetCategoryHandler } from "@/server/api/budget-handler";
import { errorResponse, successResponse } from "@/server/api/helpers";
import { getRequiredSession } from "@/lib/require-auth";

type Context = {
  params: Promise<{
    categoryId: string;
  }>;
};

export const DELETE = async (_request: Request, context: Context) => {
  try {
    await getRequiredSession("budget");
    const { categoryId } = await context.params;
    await deleteBudgetCategoryHandler(categoryId);
    return successResponse({ categoryId });
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
