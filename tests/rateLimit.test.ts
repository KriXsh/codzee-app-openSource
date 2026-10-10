import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { buildTestApp } from './helpers';

describe('rate limiting', () => {
  it('returns 429 after the limit is reached', async () => {
    const { app } = buildTestApp({ config: { rateLimit: { windowMs: 60_000, max: 2 } } });

    const ok1 = await request(app).post('/api/links').send({ url: 'https://e.com' });
    const ok2 = await request(app).post('/api/links').send({ url: 'https://e.com' });
    const blocked = await request(app).post('/api/links').send({ url: 'https://e.com' });

    expect(ok1.status).toBe(201);
    expect(ok2.headers['x-ratelimit-remaining']).toBe('0');
    expect(blocked.status).toBe(429);
    expect(blocked.body.error.code).toBe('rate_limited');
    expect(blocked.headers['retry-after']).toBeDefined();
  });

  it('tracks clients separately', async () => {
    const { app } = buildTestApp({ config: { rateLimit: { windowMs: 60_000, max: 1 } } });

    const a = await request(app).post('/api/links').set('X-Forwarded-For', '10.0.0.1').send({ url: 'https://e.com' });
    const b = await request(app).post('/api/links').set('X-Forwarded-For', '10.0.0.2').send({ url: 'https://e.com' });

    expect(a.status).toBe(201);
    expect(b.status).toBe(201);
  });

  it('does not limit reads', async () => {
    const { app } = buildTestApp({ config: { rateLimit: { windowMs: 60_000, max: 1 } } });
    for (let i = 0; i < 5; i++) {
      expect((await request(app).get('/api/links')).status).toBe(200);
    }
  });
});
