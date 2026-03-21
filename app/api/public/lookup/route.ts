import { errorResponse, successResponse } from "@/server/api/helpers";
import { lookupPublicGuestHandler } from "@/server/api/public-handler";
import {
  assertRateLimit,
  consumeRateLimit,
  getRequestIp,
} from "@/lib/rate-limit";

const LOOKUP_RATE_LIMIT = {
  limit: 15,
  windowMs: 15 * 60 * 1000,
  label: "lookup requests",
} as const;

export const POST = async (request: Request) => {
  try {
    const body = await request.json();
    const key = `public-lookup:${getRequestIp(request)}:${String(body?.token ?? "")}`;
    assertRateLimit(key, LOOKUP_RATE_LIMIT);
    consumeRateLimit(key, LOOKUP_RATE_LIMIT);
    return successResponse(await lookupPublicGuestHandler(body));
  } catch (error) {
    return errorResponse(error);
  }
};
