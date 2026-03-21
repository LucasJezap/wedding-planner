import { NextResponse } from "next/server";
import { ZodError } from "zod";

import type { ApiResponse } from "@/lib/planner-domain";
import { RateLimitError } from "@/lib/rate-limit";

export const successResponse = <T>(data: T) =>
  NextResponse.json<ApiResponse<T>>({
    success: true,
    data,
  });

export const errorResponse = (error: unknown, status = 400) => {
  if (error instanceof RateLimitError) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error.message,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(error.retryAfterSeconds),
        },
      },
    );
  }
  if (error instanceof ZodError) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error.issues.map((issue) => issue.message).join(", "),
      },
      { status },
    );
  }

  return NextResponse.json<ApiResponse<null>>(
    {
      success: false,
      error: error instanceof Error ? error.message : "Unexpected error",
    },
    { status },
  );
};

export const getErrorStatus = (error: unknown): number => {
  if (!(error instanceof Error)) {
    return 400;
  }
  if (error.message === "Unauthorized") {
    return 401;
  }
  if (error.message === "Forbidden") {
    return 403;
  }
  if (error instanceof RateLimitError) {
    return 429;
  }
  return 400;
};
