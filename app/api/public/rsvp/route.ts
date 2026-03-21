import {
  getPublicWeddingHandler,
  submitPublicRsvpHandler,
} from "@/server/api/public-handler";
import { errorResponse, successResponse } from "@/server/api/helpers";
import {
  assertRateLimit,
  consumeRateLimit,
  getRequestIp,
} from "@/lib/rate-limit";

const RSVP_RATE_LIMIT = {
  limit: 10,
  windowMs: 15 * 60 * 1000,
  label: "RSVP submissions",
} as const;

export const GET = async () => {
  try {
    return successResponse(await getPublicWeddingHandler());
  } catch (error) {
    return errorResponse(error);
  }
};

export const POST = async (request: Request) => {
  try {
    const body = await request.json();
    const key = `public-rsvp:${getRequestIp(request)}:${String(body?.token ?? "")}`;
    assertRateLimit(key, RSVP_RATE_LIMIT);
    consumeRateLimit(key, RSVP_RATE_LIMIT);
    return successResponse(await submitPublicRsvpHandler(body));
  } catch (error) {
    return errorResponse(error);
  }
};
