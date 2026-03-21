type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  limit: number;
  windowMs: number;
  label: string;
};

const store = new Map<string, RateLimitEntry>();

const now = () => Date.now();

const getOrCreateEntry = (key: string, windowMs: number): RateLimitEntry => {
  const existing = store.get(key);
  if (existing && existing.resetAt > now()) {
    return existing;
  }

  const entry = {
    count: 0,
    resetAt: now() + windowMs,
  };
  store.set(key, entry);
  return entry;
};

export class RateLimitError extends Error {
  retryAfterSeconds: number;

  constructor(label: string, retryAfterSeconds: number) {
    super(`Too many ${label}. Please try again later.`);
    this.name = "RateLimitError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export const assertRateLimit = (
  key: string,
  options: RateLimitOptions,
): void => {
  const entry = getOrCreateEntry(key, options.windowMs);
  if (entry.count >= options.limit) {
    throw new RateLimitError(
      options.label,
      Math.max(1, Math.ceil((entry.resetAt - now()) / 1000)),
    );
  }
};

export const consumeRateLimit = (
  key: string,
  options: Omit<RateLimitOptions, "label">,
): { remaining: number; resetAt: number } => {
  const entry = getOrCreateEntry(key, options.windowMs);
  entry.count += 1;
  store.set(key, entry);
  return {
    remaining: Math.max(0, options.limit - entry.count),
    resetAt: entry.resetAt,
  };
};

export const resetRateLimit = (key: string): void => {
  store.delete(key);
};

export const resetAllRateLimits = (): void => {
  store.clear();
};

export const getRequestIp = (request: { headers: Headers }): string => {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
};
