import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { dataSourceOptions } from '../database/datasource';
import { FixCustomerIdNullValues1742894471003 } from '../database/migrations/1742894471003-FixCustomerIdNullValues';

async function runMigration() {
  console.log('Initializing database connection...');
  const dataSource = new DataSource(dataSourceOptions);
  
  try {
    await dataSource.initialize();
    console.log('Database connection initialized');
    
    // Run the migration
    const migration = new FixCustomerIdNullValues1742894471003();
    console.log('Running FixCustomerIdNullValues migration...');
    await migration.up(dataSource.createQueryRunner());
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Error running migration:', error);
    throw error;
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('Database connection closed');
    }
  }
}

runMigration()
  .then(() => console.log('Process completed'))
  .catch(error => {
    console.error('Process failed:', error);
    process.exit(1);
  }); 