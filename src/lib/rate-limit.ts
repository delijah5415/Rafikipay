import { NextRequest, NextResponse } from 'next/server';

/**
 * Rate Limiting Middleware using Upstash
 * 
 * Implements sliding-window rate limiting strategy
 * Features:
 * - Per-user rate limiting
 * - Per-IP rate limiting
 * - Endpoint-specific limits
 * - Sliding window algorithm (more accurate than fixed window)
 * 
 * TODO: Implement:
 * - Upstash Redis integration
 * - Custom rate limit rules per endpoint
 * - Rate limit headers in response
 * - Rate limit bypass for admin users
 * 
 * Configuration:
 * - API calls: 100 requests per 15 minutes
 * - Webhook endpoints: 1000 requests per hour
 * - Authentication: 5 attempts per minute
 */

interface RateLimitConfig {
  limit: number; // Maximum requests
  window: number; // Time window in seconds
}

const DEFAULT_LIMITS: Record<string, RateLimitConfig> = {
  '/api/v1/': { limit: 100, window: 900 }, // 100 req/15min
  '/api/v1/webhooks/': { limit: 1000, window: 3600 }, // 1000 req/hour
  '/api/auth/': { limit: 5, window: 60 }, // 5 req/min
};

/**
 * Rate limit middleware
 */
export async function rateLimit(
  request: NextRequest,
  key: string,
  config?: RateLimitConfig
): Promise<{ allowed: boolean; headers: Record<string, string> }> {
  // TODO: Implement Upstash Redis rate limiting
  // const redis = new Upstash.Redis({
  //   url: process.env.UPSTASH_REDIS_REST_URL,
  //   token: process.env.UPSTASH_REDIS_REST_TOKEN,
  // });

  // const result = await redis.incr(key);
  // if (result === 1) {
  //   await redis.expire(key, config?.window || 900);
  // }

  // const limit = config?.limit || DEFAULT_LIMITS[key]?.limit || 100;
  // const allowed = result <= limit;

  // return {
  //   allowed,
  //   headers: {
  //     'X-RateLimit-Limit': limit.toString(),
  //     'X-RateLimit-Remaining': Math.max(0, limit - result).toString(),
  //     'X-RateLimit-Reset': new Date(
  //       Date.now() + (config?.window || 900) * 1000
  //     ).toISOString(),
  //   },
  // };

  // Placeholder implementation
  return {
    allowed: true,
    headers: {
      'X-RateLimit-Limit': '100',
      'X-RateLimit-Remaining': '99',
      'X-RateLimit-Reset': new Date(Date.now() + 900000).toISOString(),
    },
  };
}

/**
 * Rate limit response handler
 */
export function rateLimitResponse(
  headers: Record<string, string>
): NextResponse {
  return NextResponse.json(
    { error: 'Rate limit exceeded' },
    {
      status: 429,
      headers: {
        ...headers,
        'Retry-After': '60',
      },
    }
  );
}

/**
 * Get client identifier (IP + User Agent)
 */
export function getClientId(request: NextRequest): string {
  const ip =
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  return `${ip}:${userAgent}`;
}