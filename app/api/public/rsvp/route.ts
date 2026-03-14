import {
  getPublicWeddingHandler,
  submitPublicRsvpHandler,
} from "@/server/api/public-handler";
import { errorResponse, successResponse } from "@/server/api/helpers";

export const GET = async () => {
  try {
    return successResponse(await getPublicWeddingHandler());
  } catch (error) {
    return errorResponse(error);
  }
};

export const POST = async (request: Request) => {
  try {
    return successResponse(await submitPublicRsvpHandler(await request.json()));
  } catch (error) {
    return errorResponse(error);
  }
};
