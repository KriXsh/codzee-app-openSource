import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createLinkSchema } from '../src/validation';
import { buildTestApp } from './helpers';

describe('createLinkSchema', () => {
  it.each([
    'javascript:alert(document.cookie)',
    'data:text/html,<script>alert(1)</script>',
    'file:///etc/passwd',
    'ftp://example.com/file',
  ])('rejects non-http(s) url %s', (url) => {
    expect(createLinkSchema.safeParse({ url }).success).toBe(false);
  });

  it('accepts http and https urls', () => {
    expect(createLinkSchema.safeParse({ url: 'http://example.com' }).success).toBe(true);
    expect(createLinkSchema.safeParse({ url: 'https://example.com/a?b=c#d' }).success).toBe(true);
  });

  it('trims surrounding whitespace', () => {
    const parsed = createLinkSchema.parse({ url: '  https://example.com  ' });
    expect(parsed.url).toBe('https://example.com');
  });

  it('rejects overly long urls', () => {
    const url = `https://example.com/${'a'.repeat(2100)}`;
    expect(createLinkSchema.safeParse({ url }).success).toBe(false);
  });

  it.each(['has space', 'slash/path', '../etc', 'emoji😀', 'q?x=1'])(
    'rejects alias with unsafe characters: %s',
    (alias) => {
      expect(createLinkSchema.safeParse({ url: 'https://e.com', alias }).success).toBe(false);
    },
  );

  it.each(['api', 'health'])('rejects reserved alias %s', (alias) => {
    expect(createLinkSchema.safeParse({ url: 'https://e.com', alias }).success).toBe(false);
  });
});

describe('POST /api/links validation', () => {
  it('returns 400 for javascript: urls', async () => {
    const { app } = buildTestApp();
    const res = await request(app).post('/api/links').send({ url: 'javascript:alert(1)' });

    expect(res.status).toBe(400);
    expect(res.body.error.details[0].message).toBe('Only http and https URLs are allowed');
  });
});
