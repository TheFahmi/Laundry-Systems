import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Database configuration
export const config: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'dono-03.danbot.host',
  port: parseInt(process.env.DB_PORT, 10) || 2127,
  username: process.env.DB_USERNAME || 'pterodactyl',
  password: process.env.DB_PASSWORD || 'J1F7ZP2WBYWHCBRX',
  database: process.env.DB_DATABASE || 'laundry_db',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
}; 