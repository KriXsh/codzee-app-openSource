import type { Link } from '../types';

export class MemoryStore {
  private readonly links = new Map<string, Link>();

  get(code: string): Link | undefined {
    return this.links.get(code);
  }

  has(code: string): boolean {
    return this.links.has(code);
  }

  save(link: Link): Link {
    this.links.set(link.code, link);
    return link;
  }

  delete(code: string): boolean {
    return this.links.delete(code);
  }

  list(): Link[] {
    return [...this.links.values()];
  }

  clear(): void {
    this.links.clear();
  }
}
