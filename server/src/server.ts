import './types/express-augment';
import 'reflect-metadata';
import 'dotenv/config';
import { env } from './config/env';
import { AppDataSource } from './data-source';
import { buildApp } from './app';
import { ensureSeedData } from './seed';

async function bootstrap(): Promise<void> {
  console.log('Initializing database...');
  await AppDataSource.initialize();
  console.log('Database initialized');

  console.log('Ensuring seed data...');
  await ensureSeedData();
  console.log('Seed check complete');

  const app = buildApp();

  app.listen(env.port, () => {
    console.log(`API listening on http://localhost:${env.port}`);
  });
}

bootstrap().catch((err: unknown) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
