import { Router } from 'express';
import type { AnalyticsService } from '../services/analyticsService';
import type { LinkService } from '../services/linkService';

export function redirectRouter(service: LinkService, analytics: AnalyticsService): Router {
  const router = Router();

  router.get('/:code', (req, res) => {
    const link = service.resolve(req.params.code);

    analytics.track(link.code, {
      referrer: req.get('referer'),
      userAgent: req.get('user-agent'),
      ip: req.ip,
    });

    res.redirect(302, link.targetUrl);
  });

  return router;
}
