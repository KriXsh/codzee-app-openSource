import type { ClickEvent, ClickStore } from '../store/clickStore';

export interface ClickContext {
  referrer?: string;
  userAgent?: string;
  ip?: string;
}

export interface LinkStats {
  code: string;
  totalClicks: number;
  uniqueVisitors: number;
  clicksByDay: Record<string, number>;
  topReferrers: { host: string; clicks: number }[];
  recentClicks: ClickEvent[];
}

const RECENT_LIMIT = 20;
const TOP_REFERRERS = 5;

export class AnalyticsService {
  constructor(
    private readonly clicks: ClickStore,
    private readonly now: () => Date = () => new Date(),
  ) {}

  track(code: string, ctx: ClickContext): void {
    this.clicks.record({
      code,
      timestamp: this.now().toISOString(),
      referrer: ctx.referrer ?? null,
      userAgent: ctx.userAgent ?? null,
      ip: ctx.ip ?? null,
    });
  }

  stats(code: string): LinkStats {
    const events = this.clicks.forCode(code);

    const clicksByDay: Record<string, number> = {};
    const referrers = new Map<string, number>();
    const visitors = new Set<string>();

    for (const event of events) {
      const d = new Date(event.timestamp);
      const day = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      clicksByDay[day] = (clicksByDay[day] ?? 0) + 1;

      if (event.referrer) {
        const host = new URL(event.referrer).hostname;
        referrers.set(host, (referrers.get(host) ?? 0) + 1);
      }

      visitors.add(`${event.ip}|${event.userAgent}`);
    }

    const topReferrers = [...referrers.entries()]
      .map(([host, clicks]) => ({ host, clicks }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, TOP_REFERRERS);

    return {
      code,
      totalClicks: events.length,
      uniqueVisitors: visitors.size,
      clicksByDay,
      topReferrers,
      recentClicks: events.slice(-RECENT_LIMIT).reverse(),
    };
  }
}
