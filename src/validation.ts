import { z } from 'zod';

export const createLinkSchema = z.object({
  url: z.string().url(),
  alias: z.string().min(3).max(32).optional(),
  expiresInDays: z.number().int().positive().max(365).optional(),
});
