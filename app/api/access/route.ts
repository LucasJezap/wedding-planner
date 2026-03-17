import { errorResponse, successResponse } from "@/server/api/helpers";
import { getRequiredSession } from "@/lib/require-auth";
import { getActivationUrl } from "@/lib/invitation";
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
    const origin = new URL(request.url).origin;
    const input = await request.json();
    const invitation = await createAccountHandler({
      ...input,
      activationOrigin: origin,
    });
    const activationUrl = getActivationUrl(origin, invitation.token);
    return successResponse({
      ...invitation,
      activationUrl,
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
