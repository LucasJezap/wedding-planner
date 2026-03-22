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
    if (session.user.role !== "ADMIN") {
      throw new Error("Forbidden");
    }
    const { userId } = await context.params;
    return successResponse(
      await updateAccountHandler(userId, await request.json()),
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
