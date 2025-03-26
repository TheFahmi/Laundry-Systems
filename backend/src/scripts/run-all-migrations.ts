import { AppDataSource } from '../database/data-source';

async function runAllMigrations() {
  try {
    console.log('Initializing database connection...');
    await AppDataSource.initialize();
    console.log('Database connection established successfully');

    console.log('Running all pending migrations...');
    const migrations = await AppDataSource.runMigrations();
    
    if (migrations.length > 0) {
      console.log(`Successfully executed ${migrations.length} migrations:`);
      migrations.forEach(migration => {
        console.log(`- ${migration.name}`);
      });
    } else {
      console.log('No pending migrations to run');
    }

    // Verify database structure
    const tables = await AppDataSource.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log('\nCurrent database tables:');
    tables.forEach(table => {
      console.log(`- ${table.table_name}`);
    });

  } catch (error) {
    console.error('Error running migrations:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('Database connection closed');
    }
  }
}

runAllMigrations(); 