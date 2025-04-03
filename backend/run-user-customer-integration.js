require('dotenv').config();
const { DataSource } = require('typeorm');

// Define the data source
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: false,
  logging: true,
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/migrations/*.js'],
});

// Run the migration
async function runMigration() {
  try {
    console.log('Connecting to database...');
    await AppDataSource.initialize();
    console.log('Database connection established');

    // Make sure uuid-ossp extension is available
    await AppDataSource.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    
    console.log('Running the user-customer integration migration...');
    await AppDataSource.runMigrations();
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error running migration:', error);
    process.exit(1);
  }
}

// Execute the migration
runMigration(); 