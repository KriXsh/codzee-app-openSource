import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { buildTestApp } from './helpers';

describe('click analytics', () => {
  it('records clicks and aggregates stats', async () => {
    const { app } = buildTestApp();
    await request(app).post('/api/links').send({ url: 'https://example.com', alias: 'stats' });

    await request(app).get('/stats').set('Referer', 'https://twitter.com/some/post').set('User-Agent', 'A');
    await request(app).get('/stats').set('Referer', 'https://twitter.com/other').set('User-Agent', 'B');
    await request(app).get('/stats').set('Referer', 'https://news.ycombinator.com/').set('User-Agent', 'A');

    const res = await request(app).get('/api/links/stats/stats');
    expect(res.status).toBe(200);
    expect(res.body.data.totalClicks).toBe(3);
    expect(res.body.data.uniqueVisitors).toBe(2);
    expect(res.body.data.topReferrers[0]).toEqual({ host: 'twitter.com', clicks: 2 });
    expect(res.body.data.recentClicks).toHaveLength(3);
  });

  it('groups clicks by day', async () => {
    let now = new Date('2026-03-01T10:00:00Z');
    const { app } = buildTestApp({ now: () => now });
    await request(app).post('/api/links').send({ url: 'https://example.com', alias: 'daily' });

    await request(app).get('/daily');
    await request(app).get('/daily');
    now = new Date('2026-03-02T10:00:00Z');
    await request(app).get('/daily');

    const res = await request(app).get('/api/links/daily/stats');
    expect(res.body.data.clicksByDay).toEqual({ '2026-03-01': 2, '2026-03-02': 1 });
  });

  it('returns 404 stats for unknown links', async () => {
    const { app } = buildTestApp();
    expect((await request(app).get('/api/links/missing/stats')).status).toBe(404);
  });
});
