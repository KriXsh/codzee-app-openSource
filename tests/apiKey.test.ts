import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { buildTestApp } from './helpers';

describe('API key auth', () => {
  const config = { apiKeys: ['secret-1', 'secret-2'] };

  it('rejects create without a key', async () => {
    const { app } = buildTestApp({ config });
    const res = await request(app).post('/api/links').send({ url: 'https://e.com' });
    expect(res.status).toBe(401);
  });

  it('rejects create with a wrong key', async () => {
    const { app } = buildTestApp({ config });
    const res = await request(app)
      .post('/api/links')
      .set('x-api-key', 'nope')
      .send({ url: 'https://e.com' });
    expect(res.status).toBe(403);
  });

  it('accepts any configured key', async () => {
    const { app } = buildTestApp({ config });
    for (const key of config.apiKeys) {
      const res = await request(app).post('/api/links').set('x-api-key', key).send({ url: 'https://e.com' });
      expect(res.status).toBe(201);
    }
  });

  it('protects delete but leaves reads and redirects public', async () => {
    const { app } = buildTestApp({ config });
    await request(app).post('/api/links').set('x-api-key', 'secret-1').send({ url: 'https://e.com', alias: 'pub' });

    expect((await request(app).get('/api/links/pub')).status).toBe(200);
    expect((await request(app).get('/pub')).status).toBe(302);
    expect((await request(app).delete('/api/links/pub')).status).toBe(401);
    expect((await request(app).delete('/api/links/pub').set('x-api-key', 'secret-2')).status).toBe(204);
  });

  it('is disabled when no keys are configured', async () => {
    const { app } = buildTestApp();
    expect((await request(app).post('/api/links').send({ url: 'https://e.com' })).status).toBe(201);
  });
});
