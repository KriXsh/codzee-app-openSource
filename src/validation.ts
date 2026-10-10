import { z } from 'zod';

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

/** Aliases that would shadow application routes. */
export const RESERVED_ALIASES = new Set(['api', 'health', 'admin', 'static', 'favicon.ico']);

const ALIAS_PATTERN = /^[a-zA-Z0-9_-]+$/;

function hasAllowedProtocol(value: string): boolean {
  try {
    return ALLOWED_PROTOCOLS.has(new URL(value).protocol);
  } catch {
    // Already reported by `.url()`; don't throw from the refinement.
    return false;
  }
}

const targetUrl = z
  .string()
  .trim()
  .max(2048, 'URL must be at most 2048 characters')
  .url()
  .refine(hasAllowedProtocol, {
    message: 'Only http and https URLs are allowed',
  });

const alias = z
  .string()
  .min(3)
  .max(32)
  .regex(ALIAS_PATTERN, 'Alias may only contain letters, numbers, "-" and "_"')
  .refine((value) => !RESERVED_ALIASES.has(value), {
    message: 'This alias is reserved',
  });

export const createLinkSchema = z.object({
  url: targetUrl,
  alias: alias.optional(),
  expiresInDays: z.number().int().positive().max(365).optional(),
});
