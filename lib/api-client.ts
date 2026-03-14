import type { ApiResponse } from "@/lib/planner-domain";

export const apiClient = async <T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> => {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !payload.success || payload.data === undefined) {
    throw new Error(payload.error ?? "Request failed");
  }

  return payload.data;
};
