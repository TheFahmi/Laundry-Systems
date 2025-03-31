import { DataSource } from 'typeorm';
import * as path from 'path';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'laundry_db',
  entities: [path.join(__dirname, 'src', '**', '*.entity.{ts,js}')],
  migrations: [path.join(__dirname, 'src', 'database', 'migrations', '*.{ts,js}')],
  migrationsTableName: 'migrations',
  synchronize: false,
  logging: true
});

async function fixOrderItems() {
  try {
    console.log('Initializing database connection...');
    await dataSource.initialize();
    console.log('Database connection established successfully');

    // Check if price column exists
    const priceColumnExists = await dataSource.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'order_items'
        AND column_name = 'price'
      )
    `);

    if (!priceColumnExists[0].exists) {
      console.log('Adding price column to order_items table...');
      await dataSource.query(`
        ALTER TABLE order_items 
        ADD COLUMN price DECIMAL(10,2) NOT NULL DEFAULT 0
      `);
      console.log('Added price column to order_items table');
    } else {
      console.log('Price column already exists in order_items table');
    }

    // Show current table structure
    const columns = await dataSource.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'order_items'
      ORDER BY column_name
    `);

    console.log('\nCurrent structure of order_items table:');
    columns.forEach(column => {
      console.log(`- ${column.column_name} (${column.data_type})`);
    });

  } catch (error) {
    console.error('Error fixing order_items table:', error);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('Database connection closed');
    }
  }
}

fixOrderItems(); 