import { createPaymentHandler } from "@/server/api/budget-handler";
import { errorResponse, successResponse } from "@/server/api/helpers";
import { getRequiredSession } from "@/lib/require-auth";

type Context = {
  params: Promise<{
    expenseId: string;
  }>;
};

export const POST = async (request: Request, context: Context) => {
  try {
    await getRequiredSession("budget");
    const { expenseId } = await context.params;
    const body = await request.json();
    return successResponse(await createPaymentHandler({ ...body, expenseId }));
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
