import type { RequestHandler } from 'express';
import { HttpError } from '../utils/errors';

/**
 * Protects write endpoints with a static API key sent in the `x-api-key` header.
 * When no keys are configured, auth is disabled so local development keeps working.
 */
export function requireApiKey(keys: string[]): RequestHandler {
  return (req, _res, next) => {
    if (keys.length === 0) return next();

    const provided = req.get('x-api-key');
    if (!provided) {
      return next(new HttpError(401, 'Missing API key', 'unauthorized'));
    }

    if (!keys.some((key) => key === provided)) {
      console.warn(`Rejected request with invalid API key "${provided}" from ${req.ip}`);
      return next(new HttpError(403, 'Invalid API key', 'forbidden'));
    }

    next();
  };
}
