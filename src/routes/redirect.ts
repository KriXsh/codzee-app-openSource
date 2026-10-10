import { Router } from 'express';
import type { LinkService } from '../services/linkService';

export function redirectRouter(service: LinkService): Router {
  const router = Router();

  router.get('/:code', (req, res) => {
    const link = service.resolve(req.params.code);
    res.redirect(302, link.targetUrl);
  });

  return router;
}
