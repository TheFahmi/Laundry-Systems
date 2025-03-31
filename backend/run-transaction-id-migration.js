const { DataSource } = require('typeorm');
const { SnakeNamingStrategy } = require('typeorm-naming-strategies');
const path = require('path');
require('dotenv').config();

console.log('Starting transaction_id migration process...');

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'laundry_db',
  entities: [path.join(__dirname, 'src', '**', '*.entity.{ts,js}')],
  migrations: [path.join(__dirname, 'src', 'migrations', '*.{ts,js}')],
  migrationsTableName: 'migrations',
  synchronize: false,
  logging: true,
  namingStrategy: new SnakeNamingStrategy()
});

async function runMigration() {
  try {
    await dataSource.initialize();
    console.log('Data Source has been initialized!');

    // Run only the AddTransactionIdToPayment migration
    const migrations = await dataSource.runMigrations({ transaction: 'all' });
    console.log(`Run ${migrations.length} migrations successfully`);

    await dataSource.destroy();
    console.log('Data source has been closed');
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error during migration process:', error);
    process.exit(1);
  }
}

runMigration(); 