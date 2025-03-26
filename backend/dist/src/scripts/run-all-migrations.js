"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../database/data-source");
async function runAllMigrations() {
    try {
        console.log('Initializing database connection...');
        await data_source_1.AppDataSource.initialize();
        console.log('Database connection established successfully');
        console.log('Running all pending migrations...');
        const migrations = await data_source_1.AppDataSource.runMigrations();
        if (migrations.length > 0) {
            console.log(`Successfully executed ${migrations.length} migrations:`);
            migrations.forEach(migration => {
                console.log(`- ${migration.name}`);
            });
        }
        else {
            console.log('No pending migrations to run');
        }
        const tables = await data_source_1.AppDataSource.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
        console.log('\nCurrent database tables:');
        tables.forEach(table => {
            console.log(`- ${table.table_name}`);
        });
    }
    catch (error) {
        console.error('Error running migrations:', error);
    }
    finally {
        if (data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.destroy();
            console.log('Database connection closed');
        }
    }
}
runAllMigrations();
//# sourceMappingURL=run-all-migrations.js.map