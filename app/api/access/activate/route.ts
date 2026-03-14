import {
  acceptInvitationHandler,
  getInvitationHandler,
} from "@/server/api/access-handler";
import { errorResponse, successResponse } from "@/server/api/helpers";

export const GET = async (request: Request) => {
  try {
    const token = new URL(request.url).searchParams.get("token");
    if (!token) {
      throw new Error("Missing token");
    }
    return successResponse(await getInvitationHandler(token));
  } catch (error) {
    return errorResponse(error, 400);
  }
};

export const POST = async (request: Request) => {
  try {
    return successResponse(await acceptInvitationHandler(await request.json()));
  } catch (error) {
    return errorResponse(error, 400);
  }
};
