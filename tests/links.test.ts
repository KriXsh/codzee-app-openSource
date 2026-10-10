import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { buildTestApp } from './helpers';

describe('links API', () => {
  it('creates a link with a generated code', async () => {
    const { app } = buildTestApp();
    const res = await request(app).post('/api/links').send({ url: 'https://example.com/a' });

    expect(res.status).toBe(201);
    expect(res.body.data.code).toMatch(/^[a-zA-Z0-9]{7}$/);
    expect(res.body.data.shortUrl).toBe(`http://sho.rt/${res.body.data.code}`);
    expect(res.body.data.clicks).toBe(0);
  });

  it('creates a link with a custom alias', async () => {
    const { app } = buildTestApp();
    const res = await request(app)
      .post('/api/links')
      .send({ url: 'https://example.com', alias: 'docs' });

    expect(res.status).toBe(201);
    expect(res.body.data.code).toBe('docs');
  });

  it('rejects a duplicate alias with 409', async () => {
    const { app } = buildTestApp();
    await request(app).post('/api/links').send({ url: 'https://a.com', alias: 'taken' });
    const res = await request(app).post('/api/links').send({ url: 'https://b.com', alias: 'taken' });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('conflict');
  });

  it('rejects an invalid url with 400', async () => {
    const { app } = buildTestApp();
    const res = await request(app).post('/api/links').send({ url: 'not a url' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('validation_error');
  });

  it('lists links newest first', async () => {
    let t = Date.parse('2026-01-01T00:00:00Z');
    const { app } = buildTestApp({ now: () => new Date((t += 1000)) });
    await request(app).post('/api/links').send({ url: 'https://first.com', alias: 'first' });
    await request(app).post('/api/links').send({ url: 'https://second.com', alias: 'second' });

    const res = await request(app).get('/api/links');
    expect(res.body.data.map((l: { code: string }) => l.code)).toEqual(['second', 'first']);
  });

  it('fetches and deletes a link', async () => {
    const { app } = buildTestApp();
    await request(app).post('/api/links').send({ url: 'https://x.com', alias: 'gone-soon' });

    expect((await request(app).get('/api/links/gone-soon')).status).toBe(200);
    expect((await request(app).delete('/api/links/gone-soon')).status).toBe(204);
    expect((await request(app).get('/api/links/gone-soon')).status).toBe(404);
  });
});
