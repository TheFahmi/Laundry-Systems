import { DataSource } from 'typeorm';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

// Create a TypeORM data source for migrations
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'dono-03.danbot.host',
  port: parseInt(process.env.DB_PORT, 10) || 2127,
  username: process.env.DB_USERNAME || 'pterodactyl',
  password: process.env.DB_PASSWORD || 'J1F7ZP2WBYWHCBRX',
  database: process.env.DB_DATABASE || 'laundry_db',
  entities: [path.join(__dirname, '..', '**', '*.entity.{ts,js}')],
  migrations: [path.join(__dirname, 'migrations', '*.{ts,js}')],
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
}); 