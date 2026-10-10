import { createApp } from '../src/app';
import type { AppConfig } from '../src/config';
import { ClickStore } from '../src/store/clickStore';
import { MemoryStore } from '../src/store/memoryStore';

export const testConfig: AppConfig = {
  port: 0,
  baseUrl: 'http://sho.rt',
  codeLength: 7,
};

export function buildTestApp(opts: { now?: () => Date } = {}) {
  const store = new MemoryStore();
  const clicks = new ClickStore();
  const app = createApp({ config: testConfig, store, clicks, now: opts.now });
  return { app, store, clicks };
}
