import { Router } from 'express';
import type { LinkService } from '../services/linkService';
import type { Link } from '../types';
import { createLinkSchema } from '../validation';

export function linksRouter(service: LinkService): Router {
  const router = Router();

  const present = (link: Link) => ({ ...link, shortUrl: service.shortUrl(link.code) });

  router.get('/', (_req, res) => {
    res.json({ data: service.list().map(present) });
  });

  router.post('/', (req, res) => {
    const input = createLinkSchema.parse(req.body);
    const link = service.create(input);
    res.status(201).json({ data: present(link) });
  });

  router.get('/:code', (req, res) => {
    res.json({ data: present(service.get(req.params.code)) });
  });

  router.delete('/:code', (req, res) => {
    service.remove(req.params.code);
    res.status(204).end();
  });

  return router;
}
