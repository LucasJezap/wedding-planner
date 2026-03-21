import { getInvitationGroupsHandler } from "@/server/api/guest-handler";
import {
  errorResponse,
  getErrorStatus,
  successResponse,
} from "@/server/api/helpers";
import { getRequiredSession } from "@/lib/require-auth";

export const GET = async () => {
  try {
    await getRequiredSession();
    return successResponse(await getInvitationGroupsHandler());
  } catch (error) {
    return errorResponse(error, getErrorStatus(error));
  }
};
