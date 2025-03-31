import { DataSource } from 'typeorm';
import { seedServices } from './service.seed';
import * as dotenv from 'dotenv';

dotenv.config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'laundry_db',
  synchronize: false,
  logging: true,
});

async function runSeeds() {
  let connection: DataSource | null = null;
  try {
    connection = await dataSource.initialize();
    console.log('Connected to database');

    console.log('Running service seeds...');
    await seedServices(connection);
    console.log('Service seeds completed successfully');
  } catch (error) {
    console.error('Error running seeds:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.destroy();
      console.log('Database connection closed');
    }
  }
}

runSeeds(); 