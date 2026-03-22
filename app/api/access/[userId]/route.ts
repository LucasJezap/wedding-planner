import { errorResponse, successResponse } from "@/server/api/helpers";
import { getRequiredSession } from "@/lib/require-auth";
import { updateAccountHandler } from "@/server/api/access-handler";

type Context = {
  params: Promise<{
    userId: string;
  }>;
};

export const PATCH = async (request: Request, context: Context) => {
  try {
    const session = await getRequiredSession();
    const { userId } = await context.params;
    if (session.user.role !== "ADMIN" && session.user.id !== userId) {
      throw new Error("Forbidden");
    }
    return successResponse(
      await updateAccountHandler(userId, await request.json(), {
        userId: session.user.id,
        role: session.user.role,
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
