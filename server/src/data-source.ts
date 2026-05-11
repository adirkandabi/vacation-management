import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { env } from './config/env';
import { User, VacationRequest } from './entities';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: env.database.host,
  port: env.database.port,
  username: env.database.username,
  password: env.database.password,
  database: env.database.name,
  synchronize: env.database.synchronize,
  logging: env.database.logging,
  entities: [User, VacationRequest],
  migrations: [],
  subscribers: [],
});

export default AppDataSource;
