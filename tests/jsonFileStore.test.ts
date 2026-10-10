import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { JsonFileStore } from '../src/store/jsonFileStore';
import type { Link } from '../src/types';

const link = (code: string): Link => ({
  code,
  targetUrl: `https://example.com/${code}`,
  createdAt: '2026-01-01T00:00:00.000Z',
  expiresAt: null,
  clicks: 0,
});

describe('JsonFileStore', () => {
  let dir: string;
  let file: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'linkly-'));
    file = join(dir, 'nested', 'links.json');
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('persists saved links across instances', () => {
    const first = new JsonFileStore(file);
    first.save(link('abc'));
    first.save(link('def'));

    const second = new JsonFileStore(file);
    expect(second.list().map((l) => l.code).sort()).toEqual(['abc', 'def']);
    expect(second.get('abc')?.targetUrl).toBe('https://example.com/abc');
  });

  it('persists updates to existing links', () => {
    const store = new JsonFileStore(file);
    store.save(link('abc'));
    store.save({ ...link('abc'), clicks: 5 });

    expect(new JsonFileStore(file).get('abc')?.clicks).toBe(5);
  });

  it('starts empty when the file does not exist', () => {
    expect(new JsonFileStore(file).list()).toEqual([]);
  });
});
