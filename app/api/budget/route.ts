import {
  createExpenseHandler,
  getBudgetHandler,
  updateBudgetCategoryHandler,
} from "@/server/api/budget-handler";
import { errorResponse, successResponse } from "@/server/api/helpers";
import { getRequiredSession } from "@/lib/require-auth";

export const GET = async () => {
  try {
    await getRequiredSession("budget");
    return successResponse(await getBudgetHandler());
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

export const POST = async (request: Request) => {
  try {
    await getRequiredSession("budget");
    return successResponse(await createExpenseHandler(await request.json()));
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

export const PATCH = async (request: Request) => {
  try {
    await getRequiredSession("budget");
    const body = (await request.json()) as {
      categoryId: string;
      name?: string;
      plannedAmount: number;
      color?: string;
      notes?: string;
    };
    return successResponse(
      await updateBudgetCategoryHandler(body.categoryId, {
        name: body.name ?? "",
        plannedAmount: body.plannedAmount,
        color: body.color ?? "#D89BAE",
        notes: body.notes ?? "",
      }),
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
