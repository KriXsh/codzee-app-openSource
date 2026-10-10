import type { Link } from '../types';

/**
 * Persistence boundary for links. Services depend on this interface only,
 * so storage backends can be swapped without touching business logic.
 */
export interface LinkRepository {
  get(code: string): Link | undefined;
  has(code: string): boolean;
  save(link: Link): Link;
  delete(code: string): boolean;
  list(): Link[];
  clear(): void;
}
