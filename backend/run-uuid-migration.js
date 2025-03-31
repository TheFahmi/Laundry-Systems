const { DataSource } = require('typeorm');
const path = require('path');
require('dotenv').config();

async function runMigration() {
  console.log('Initializing database connection...');
  
  // Create database configuration manually instead of relying on ormconfig.js
  const dbConfig = {
    type: 'postgres', // Explicitly set the database type
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'laundry',
    entities: [path.join(__dirname, 'dist/**/*.entity.js')],
    migrations: [
      path.join(__dirname, 'dist/migrations/*.js'),
      path.join(__dirname, 'src/migrations/*.ts')
    ],
    migrationsTableName: 'typeorm_migrations',
    synchronize: false,
    logging: true
  };

  console.log('Using database configuration:', {
    type: dbConfig.type,
    host: dbConfig.host,
    port: dbConfig.port,
    username: dbConfig.username,
    database: dbConfig.database,
    migrations: dbConfig.migrations
  });
  
  const AppDataSource = new DataSource(dbConfig);
  
  try {
    await AppDataSource.initialize();
    console.log('Database connection established successfully.');
    
    // List available migrations
    const migrations = await AppDataSource.showMigrations();
    console.log('Available migrations:', migrations);
    
    console.log('Running UUID migration...');
    
    // Run the migration
    await AppDataSource.runMigrations({
      transaction: 'all'
    });
    
    console.log('UUID migration completed successfully!');
    
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  } finally {
    if (AppDataSource && AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('Database connection closed.');
    }
  }
}

runMigration()
  .then(() => {
    console.log('Migration process completed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Unhandled error during migration process:', error);
    process.exit(1);
  }); 