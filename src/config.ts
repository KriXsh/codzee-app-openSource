export interface AppConfig {
  port: number;
  baseUrl: string;
  codeLength: number;
  apiKeys: string[];
  rateLimit: { windowMs: number; max: number };
}

function toInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const port = toInt(env.PORT, 3000);
  return {
    port,
    baseUrl: (env.BASE_URL ?? `http://localhost:${port}`).replace(/\/+$/, ''),
    codeLength: toInt(env.CODE_LENGTH, 7),
    apiKeys: (env.API_KEYS ?? '')
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean),
    rateLimit: {
      windowMs: toInt(env.RATE_LIMIT_WINDOW_MS, 60_000),
      max: toInt(env.RATE_LIMIT_MAX, 30),
    },
  };
}
