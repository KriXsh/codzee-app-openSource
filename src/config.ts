export type StorageDriver = 'memory' | 'file';

export interface AppConfig {
  port: number;
  baseUrl: string;
  codeLength: number;
  storage: { driver: StorageDriver; filePath: string };
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
    storage: {
      driver: env.STORAGE_DRIVER === 'file' ? 'file' : 'memory',
      filePath: env.DATA_FILE ?? 'data/links.json',
    },
  };
}
