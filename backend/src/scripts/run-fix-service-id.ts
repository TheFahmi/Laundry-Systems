import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { dataSourceOptions } from '../database/datasource';
import { FixServiceIdNullValues1742894471001 } from '../database/migrations/1742894471001-FixServiceIdNullValues';

async function runMigration() {
  console.log('Initializing database connection...');
  const dataSource = new DataSource(dataSourceOptions);
  
  try {
    await dataSource.initialize();
    console.log('Database connection initialized');
    
    // Run the migration
    const migration = new FixServiceIdNullValues1742894471001();
    console.log('Running FixServiceIdNullValues migration...');
    await migration.up(dataSource.createQueryRunner());
    console.log('Migration completed successfully!');
    
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