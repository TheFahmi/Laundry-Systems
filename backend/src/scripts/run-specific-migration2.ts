import { DataSource } from 'typeorm';
import { dataSourceOptions } from '../database/datasource';
import { FixServiceColumnReference1711800000002 } from '../database/migrations/1711800000002-FixServiceColumnReference';

async function runMigration() {
  console.log('Initializing database connection...');
  const dataSource = new DataSource(dataSourceOptions);
  
  try {
    await dataSource.initialize();
    console.log('Database connection initialized');
    
    // Create an instance of the migration
    const migration = new FixServiceColumnReference1711800000002();
    
    // Execute the migration
    console.log('Running FixServiceColumnReference migration...');
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