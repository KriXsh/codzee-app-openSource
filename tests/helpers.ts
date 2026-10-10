import { createApp } from '../src/app';
import type { AppConfig } from '../src/config';
import { MemoryStore } from '../src/store/memoryStore';

export const testConfig: AppConfig = {
  port: 0,
  baseUrl: 'http://sho.rt',
  codeLength: 7,
  apiKeys: [],
  rateLimit: { windowMs: 60_000, max: 1000 },
};

export function buildTestApp(opts: { now?: () => Date; config?: Partial<AppConfig> } = {}) {
  const store = new MemoryStore();
  const app = createApp({ config: { ...testConfig, ...opts.config }, store, now: opts.now });
  return { app, store };
}
