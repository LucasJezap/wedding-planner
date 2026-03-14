import { errorResponse, successResponse } from "@/server/api/helpers";
import { lookupPublicGuestHandler } from "@/server/api/public-handler";

export const POST = async (request: Request) => {
  try {
    return successResponse(
      await lookupPublicGuestHandler(await request.json()),
    );
  } catch (error) {
    return errorResponse(error);
  }
};
