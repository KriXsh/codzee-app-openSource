import type { AppConfig } from '../config';
import type { MemoryStore } from '../store/memoryStore';
import type { CreateLinkInput, Link } from '../types';
import { generateCode } from '../utils/codeGenerator';
import { conflict, gone, notFound } from '../utils/errors';

const MAX_GENERATION_ATTEMPTS = 5;
const DAY_MS = 24 * 60 * 60 * 1000;

export class LinkService {
  constructor(
    private readonly store: MemoryStore,
    private readonly config: AppConfig,
    private readonly now: () => Date = () => new Date(),
  ) {}

  create(input: CreateLinkInput): Link {
    const code = input.alias ?? this.uniqueCode();
    if (input.alias && this.store.has(code)) {
      throw conflict(`Alias "${code}" is already taken`);
    }

    const createdAt = this.now();
    const expiresAt = input.expiresInDays
      ? new Date(createdAt.getTime() + input.expiresInDays * DAY_MS).toISOString()
      : null;

    return this.store.save({
      code,
      targetUrl: input.url,
      createdAt: createdAt.toISOString(),
      expiresAt,
      clicks: 0,
    });
  }

  get(code: string): Link {
    const link = this.store.get(code);
    if (!link) throw notFound(`No link found for "${code}"`);
    return link;
  }

  resolve(code: string): Link {
    const link = this.get(code);
    if (link.expiresAt && new Date(link.expiresAt) <= this.now()) {
      throw gone();
    }
    link.clicks += 1;
    return this.store.save(link);
  }

  remove(code: string): void {
    if (!this.store.delete(code)) throw notFound(`No link found for "${code}"`);
  }

  list(): Link[] {
    return this.store
      .list()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  shortUrl(code: string): string {
    return `${this.config.baseUrl}/${code}`;
  }

  private uniqueCode(): string {
    for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
      const code = generateCode(this.config.codeLength);
      if (!this.store.has(code)) return code;
    }
    throw new Error('Could not generate a unique short code');
  }
}
