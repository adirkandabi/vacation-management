function parseIntEnv(value: string | undefined, fallback: number): number {
  if (value === undefined || value === '') {
    return fallback;
  }
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
}

function parseBoolEnv(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === '') {
    return fallback;
  }
  const v = value.toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(v)) {
    return true;
  }
  if (['0', 'false', 'no', 'off'].includes(v)) {
    return false;
  }
  return fallback;
}

/**
 * Typed configuration read after `dotenv` has populated `process.env`.
 * Defaults align with the repo root `docker-compose.yml` Postgres service.
 */
export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProduction: (process.env.NODE_ENV ?? 'development') === 'production',
  port: parseIntEnv(process.env.PORT, 3000),
  database: {
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: parseIntEnv(process.env.DATABASE_PORT, 5432),
    username: process.env.DATABASE_USER ?? 'user',
    password: process.env.DATABASE_PASSWORD ?? 'dbpassword',
    name: process.env.DATABASE_NAME ?? 'vacation_db',
    /** When true, TypeORM updates the schema to match entities (dev convenience). */
    synchronize: parseBoolEnv(process.env.DATABASE_SYNCHRONIZE, true),
    logging: parseBoolEnv(process.env.DATABASE_LOGGING, false),
  },
} as const;
