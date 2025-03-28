import { DataSource } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const dbConfig: PostgresConnectionOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'laundry',
  entities: [],
  migrations: [
    __dirname + '/../database/migrations/1711700000000-AddPriceModelColumn.{js,ts}',
    __dirname + '/../database/migrations/1711700000001-AddProcessingTimeHoursColumn.{js,ts}',
    __dirname + '/../database/migrations/1711700000002-AddIsActiveColumn.{js,ts}',
    __dirname + '/../database/migrations/1711700000003-AddCategoryColumn.{js,ts}',
    __dirname + '/../database/migrations/1711700000004-AddAdditionalRequirementsColumn.{js,ts}',
    __dirname + '/../database/migrations/1711700000005-AddCreatedAtColumn.{js,ts}',
    __dirname + '/../database/migrations/1711700000006-AddUpdatedAtColumn.{js,ts}'
  ],
  synchronize: false,
  logging: true
};

async function runMigrations() {
  console.log('Connecting to database...');
  const dataSource = new DataSource(dbConfig);
  
  try {
    await dataSource.initialize();
    console.log('Connected to database successfully');
    
    console.log('Running migrations...');
    await dataSource.runMigrations();
    console.log('Migrations completed successfully');
    
    await dataSource.destroy();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error running migrations:', error);
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    process.exit(1);
  }
}

runMigrations(); 