import { getDashboardHandler } from "@/server/api/dashboard-handler";
import { errorResponse, successResponse } from "@/server/api/helpers";
import { getRequiredSession } from "@/lib/require-auth";

export const GET = async () => {
  try {
    const session = await getRequiredSession();
    return successResponse(await getDashboardHandler(session.user.role));
  } catch (error) {
    return errorResponse(
      error,
      error instanceof Error && error.message === "Unauthorized" ? 401 : 400,
    );
  }
};
