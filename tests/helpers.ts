import { createApp } from '../src/app';
import type { AppConfig } from '../src/config';
import { MemoryStore } from '../src/store/memoryStore';

export const testConfig: AppConfig = {
  port: 0,
  baseUrl: 'http://sho.rt',
  codeLength: 7,
  storage: { driver: 'memory', filePath: '' },
};

export function buildTestApp(opts: { now?: () => Date } = {}) {
  const store = new MemoryStore();
  const app = createApp({ config: testConfig, store, now: opts.now });
  return { app, store };
}
