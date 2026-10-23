import { NextRequest, NextResponse } from "next/server";

export interface RateLimitConfig {
  maxRequests: number; // Max allowed requests in the time window
  windowMs: number;    // Window size in milliseconds
}

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// Global in-memory map keyed by `namespace:identifier`
const rateLimitStore = new Map<string, RateLimitRecord>();

// Periodic cleanup every 5 minutes to prevent memory growth
let lastCleanup = Date.now();
function cleanupExpiredRecords(now: number) {
  if (now - lastCleanup < 5 * 60 * 1000) return;
  lastCleanup = now;
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Extracts the best candidate client IP address from NextRequest headers.
 */
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const firstIp = forwarded.split(",")[0].trim();
    if (firstIp) return firstIp;
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp && realIp.trim()) return realIp.trim();
  const cfConnectingIp = req.headers.get("cf-connecting-ip");
  if (cfConnectingIp && cfConnectingIp.trim()) return cfConnectingIp.trim();
  return "127.0.0.1";
}

/**
 * Checks whether a request should be allowed or throttled under rate limits.
 */
export function checkRateLimit(
  req: NextRequest,
  namespace: string,
  config: RateLimitConfig,
  customIdentifier?: string
): {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp in seconds
} {
  const now = Date.now();
  cleanupExpiredRecords(now);

  const identifier = customIdentifier || getClientIp(req);
  const key = `${namespace}:${identifier}`;

  const current = rateLimitStore.get(key);

  if (!current || now > current.resetTime) {
    const resetTime = now + config.windowMs;
    rateLimitStore.set(key, { count: 1, resetTime });
    return {
      success: true,
      limit: config.maxRequests,
      remaining: Math.max(0, config.maxRequests - 1),
      reset: Math.ceil(resetTime / 1000),
    };
  }

  if (current.count >= config.maxRequests) {
    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      reset: Math.ceil(current.resetTime / 1000),
    };
  }

  current.count += 1;
  return {
    success: true,
    limit: config.maxRequests,
    remaining: Math.max(0, config.maxRequests - current.count),
    reset: Math.ceil(current.resetTime / 1000),
  };
}

/**
 * Creates a standard RFC-compliant HTTP 429 Too Many Requests response.
 */
export function rateLimitResponse(
  limit: number,
  remaining: number,
  reset: number,
  message: string = "Too many requests. Please slow down and try again later."
): NextResponse {
  const nowSec = Math.ceil(Date.now() / 1000);
  const retryAfter = Math.max(1, reset - nowSec);

  return NextResponse.json(
    { error: message },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
        "X-RateLimit-Limit": String(limit),
        "X-RateLimit-Remaining": String(remaining),
        "X-RateLimit-Reset": String(reset),
      },
    }
  );
}
