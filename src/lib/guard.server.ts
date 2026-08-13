/**
 * In-memory abuse protection: IP rate limiting, cooldown, concurrency cap,
 * and result caching. Swap with Redis (REDIS_URL) for multi-instance setups.
 */

type Bucket = { count: number; resetAt: number; last: number };

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 12;
const COOLDOWN_MS = 1_500;
const MAX_CONCURRENT = 4;
const CACHE_TTL_MS = 10 * 60_000;
const MAX_URL_LENGTH = 512;
const MAX_BODY_BYTES = 2_048;

export { MAX_URL_LENGTH, MAX_BODY_BYTES };

const buckets = new Map<string, Bucket>();
const cache = new Map<string, { at: number; value: unknown }>();
let running = 0;

export type GuardVerdict =
  | { ok: true }
  | { ok: false; code: "rate_limited" | "cooldown" | "busy"; retryAfter: number };

export function clientIp(request: Request): string {
  const h = request.headers;
  return (
    h.get("cf-connecting-ip") ||
    h.get("x-real-ip") ||
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

export function checkLimits(ip: string): GuardVerdict {
  const now = Date.now();
  const bucket = buckets.get(ip);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS, last: now });
  } else {
    if (now - bucket.last < COOLDOWN_MS) {
      return { ok: false, code: "cooldown", retryAfter: 2 };
    }
    if (bucket.count >= MAX_PER_WINDOW) {
      return {
        ok: false,
        code: "rate_limited",
        retryAfter: Math.ceil((bucket.resetAt - now) / 1000),
      };
    }
    bucket.count += 1;
    bucket.last = now;
  }

  if (running >= MAX_CONCURRENT) {
    return { ok: false, code: "busy", retryAfter: 3 };
  }

  if (buckets.size > 5_000) {
    for (const [key, value] of buckets) if (value.resetAt <= now) buckets.delete(key);
  }
  return { ok: true };
}

export async function withSlot<T>(fn: () => Promise<T>): Promise<T> {
  running += 1;
  try {
    return await fn();
  } finally {
    running -= 1;
  }
}

export function cacheGet<T>(key: string): T | null {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return hit.value as T;
}

export function cacheSet(key: string, value: unknown): void {
  if (cache.size > 500) cache.clear();
  cache.set(key, { at: Date.now(), value });
}
