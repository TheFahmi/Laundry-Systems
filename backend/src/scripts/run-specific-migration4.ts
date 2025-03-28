import { DataSource } from 'typeorm';
import { dataSourceOptions } from '../database/datasource';
import { AddServiceProcessingTimeHours1711800000004 } from '../database/migrations/1711800000004-AddServiceProcessingTimeHours';

async function runMigration() {
  console.log('Initializing database connection...');
  const dataSource = new DataSource(dataSourceOptions);
  
  try {
    await dataSource.initialize();
    console.log('Database connection initialized');
    
    // Create an instance of the migration
    const migration = new AddServiceProcessingTimeHours1711800000004();
    
    // Execute the migration
    console.log('Running AddServiceProcessingTimeHours migration...');
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