import type { RequestHandler } from 'express';
import { HttpError } from '../utils/errors';

export interface RateLimitOptions {
  windowMs: number;
  max: number;
  now?: () => number;
}

interface Bucket {
  count: number;
  resetAt: number;
}

/** Simple fixed-window, in-memory rate limiter keyed by client IP. */
export function rateLimit({ windowMs, max, now = Date.now }: RateLimitOptions): RequestHandler {
  const buckets = new Map<string, Bucket>();

  return (req, res, next) => {
    const forwarded = req.headers['x-forwarded-for'];
    const clientIp = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(',')[0].trim() || req.ip || 'unknown';

    const current = now();
    let bucket = buckets.get(clientIp);
    if (!bucket || bucket.resetAt <= current) {
      bucket = { count: 0, resetAt: current + windowMs };
      buckets.set(clientIp, bucket);
    }

    bucket.count += 1;
    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', String(Math.max(0, max - bucket.count)));

    if (bucket.count > max) {
      res.setHeader('Retry-After', String(bucket.resetAt - current));
      return next(new HttpError(429, 'Too many requests', 'rate_limited'));
    }

    next();
  };
}
