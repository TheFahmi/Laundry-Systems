import { DataSource } from 'typeorm';

// Create a new DataSource instance for this migration script
const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'laundry',
  synchronize: false,
  logging: true,
});

async function runMigration() {
  try {
    // Initialize the data source
    await dataSource.initialize();
    console.log('Database connection established');

    // Check if the is_delivery_needed column already exists in the orders table
    const columnExists = await dataSource.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders'
        AND column_name = 'is_delivery_needed'
      );
    `);

    if (columnExists[0].exists) {
      console.log('is_delivery_needed column already exists in orders table, skipping migration');
      await dataSource.destroy();
      return;
    }

    console.log('Adding is_delivery_needed column to orders table...');
    
    // Add is_delivery_needed column to orders table
    await dataSource.query(`
      ALTER TABLE "orders" 
      ADD COLUMN "is_delivery_needed" BOOLEAN DEFAULT false;
    `);

    console.log('Column added successfully!');
    
    // Close the connection
    await dataSource.destroy();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('Error running migration:', error);
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    process.exit(1);
  }
}

// Run the migration
runMigration(); 