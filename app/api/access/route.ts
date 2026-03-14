import { errorResponse, successResponse } from "@/server/api/helpers";
import { getRequiredSession } from "@/lib/require-auth";
import {
  createAccountHandler,
  getAccountsHandler,
} from "@/server/api/access-handler";

export const GET = async () => {
  try {
    await getRequiredSession();
    return successResponse(await getAccountsHandler());
  } catch (error) {
    return errorResponse(
      error,
      error instanceof Error && error.message === "Unauthorized" ? 401 : 400,
    );
  }
};

export const POST = async (request: Request) => {
  try {
    const session = await getRequiredSession();
    if (session.user.role !== "ADMIN") {
      throw new Error("Forbidden");
    }
    const invitation = await createAccountHandler(await request.json());
    const origin = new URL(request.url).origin;
    return successResponse({
      ...invitation,
      activationUrl: `${origin}/activate?token=${invitation.token}`,
    });
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
