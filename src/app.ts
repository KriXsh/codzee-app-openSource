import express, { type Express } from 'express';
import { loadConfig, type AppConfig } from './config';
import { requireApiKey } from './middleware/apiKey';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { rateLimit } from './middleware/rateLimit';
import { linksRouter } from './routes/links';
import { redirectRouter } from './routes/redirect';
import { LinkService } from './services/linkService';
import { MemoryStore } from './store/memoryStore';

export interface AppDeps {
  config?: AppConfig;
  store?: MemoryStore;
  now?: () => Date;
}

export function createApp(deps: AppDeps = {}): Express {
  const config = deps.config ?? loadConfig();
  const store = deps.store ?? new MemoryStore();
  const service = new LinkService(store, config, deps.now);

  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '10kb' }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  const guards = {
    auth: requireApiKey(config.apiKeys),
    createLimiter: rateLimit(config.rateLimit),
  };

  app.use('/api/links', linksRouter(service, guards));
  app.use('/', redirectRouter(service));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
