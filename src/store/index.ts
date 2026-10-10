import type { AppConfig } from '../config';
import { JsonFileStore } from './jsonFileStore';
import type { LinkRepository } from './linkRepository';
import { MemoryStore } from './memoryStore';

export type { LinkRepository } from './linkRepository';

export function createRepository(config: AppConfig): LinkRepository {
  switch (config.storage.driver) {
    case 'file':
      return new JsonFileStore(config.storage.filePath);
    case 'memory':
    default:
      return new MemoryStore();
  }
}
