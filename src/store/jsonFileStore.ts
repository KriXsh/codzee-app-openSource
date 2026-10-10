import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import type { Link } from '../types';
import { MemoryStore } from './memoryStore';

/**
 * Keeps links in memory and mirrors every change to a JSON file so data
 * survives restarts. Suitable for single-instance, low-traffic deployments.
 */
export class JsonFileStore extends MemoryStore {
  constructor(private readonly filePath: string) {
    super();
    this.load();
  }

  override save(link: Link): Link {
    super.save(link);
    this.flush();
    return link;
  }

  override clear(): void {
    super.clear();
    this.flush();
  }

  private load(): void {
    if (!existsSync(this.filePath)) return;
    const records = JSON.parse(readFileSync(this.filePath, 'utf8')) as Link[];
    for (const record of records) {
      this.links.set(record.code, record);
    }
  }

  private flush(): void {
    mkdirSync(dirname(this.filePath), { recursive: true });
    writeFileSync(this.filePath, JSON.stringify(this.list(), null, 2));
  }
}
