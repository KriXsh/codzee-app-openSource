import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { buildTestApp } from './helpers';

describe('redirects', () => {
  it('redirects to the target url and counts the click', async () => {
    const { app, store } = buildTestApp();
    await request(app).post('/api/links').send({ url: 'https://example.com/page', alias: 'goto' });

    const res = await request(app).get('/goto');
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('https://example.com/page');
    expect(store.get('goto')?.clicks).toBe(1);
  });

  it('returns 404 for unknown codes', async () => {
    const { app } = buildTestApp();
    expect((await request(app).get('/nope123')).status).toBe(404);
  });

  it('returns 410 for expired links', async () => {
    let now = new Date('2026-01-01T00:00:00Z');
    const { app } = buildTestApp({ now: () => now });
    await request(app).post('/api/links').send({ url: 'https://e.com', alias: 'temp', expiresInDays: 1 });

    now = new Date('2026-01-03T00:00:00Z');
    expect((await request(app).get('/temp')).status).toBe(410);
  });
});
