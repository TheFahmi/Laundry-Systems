import { DataSource } from 'typeorm';
import { dataSourceOptions } from '../database/datasource';
import { AddOrderItemsMissingColumns1711800000003 } from '../database/migrations/1711800000003-AddOrderItemsMissingColumns';

async function runMigration() {
  console.log('Initializing database connection...');
  const dataSource = new DataSource(dataSourceOptions);
  
  try {
    await dataSource.initialize();
    console.log('Database connection initialized');
    
    // Create an instance of the migration
    const migration = new AddOrderItemsMissingColumns1711800000003();
    
    // Execute the migration
    console.log('Running AddOrderItemsMissingColumns migration...');
    await migration.up(dataSource.createQueryRunner());
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error running migration:', error);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('Database connection closed');
    }
  }
}

runMigration()
  .then(() => console.log('Process completed'))
  .catch(error => console.error('Process failed:', error)); 