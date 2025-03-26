import { DataSource } from 'typeorm';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

// Create a new TypeORM data source
const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'dono-03.danbot.host',
  port: parseInt(process.env.DB_PORT, 10) || 2127,
  username: process.env.DB_USERNAME || 'pterodactyl',
  password: process.env.DB_PASSWORD || 'J1F7ZP2WBYWHCBRX',
  database: process.env.DB_DATABASE || 'laundry_db',
  entities: [path.join(__dirname, '..', '**', '*.entity.{ts,js}')],
  migrations: [path.join(__dirname, '..', 'database', 'migrations', '*.{ts,js}')],
  synchronize: false,
  logging: true,
});

async function runMigrations() {
  try {
    console.log('Initializing database connection...');
    await dataSource.initialize();
    console.log('Database connection established successfully');

    // Run only our AddMissingServiceColumns migration
    console.log('Running service columns migration...');
    await dataSource.query(`
      -- Create migrations table if it doesn't exist
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        timestamp BIGINT NOT NULL,
        name VARCHAR(255) NOT NULL
      )
    `);

    // Check if the migration has already been run
    const existingMigration = await dataSource.query(`
      SELECT * FROM migrations WHERE name = 'AddMissingServiceColumns1711505600000'
    `);

    if (existingMigration.length === 0) {
      // Check if unit column exists and add if missing
      const unitColumnExists = await dataSource.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'services'
          AND column_name = 'unit'
        )
      `);

      if (!unitColumnExists[0].exists) {
        console.log('Adding "unit" column to services table...');
        await dataSource.query(`
          ALTER TABLE services 
          ADD COLUMN "unit" VARCHAR(50) DEFAULT 'kg' NOT NULL
        `);
        console.log('Added "unit" column to services table');
      } else {
        console.log('Column "unit" already exists in services table');
      }

      // Check if estimatedTime column exists in any case form
      const estimatedTimeColumnExists = await dataSource.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'services'
          AND (column_name = 'estimatedtime' OR column_name = 'estimatedTime')
        )
      `);

      if (!estimatedTimeColumnExists[0].exists) {
        console.log('Adding "estimatedTime" column to services table...');
        try {
          await dataSource.query(`
            ALTER TABLE services 
            ADD COLUMN "estimatedTime" INTEGER DEFAULT 60 NOT NULL
          `);
          console.log('Added "estimatedTime" column to services table');
        } catch (err) {
          console.log('Error adding column, it might already exist:', err.message);
        }
      } else {
        console.log('Column "estimatedTime" already exists in services table');
      }

      // Check column details to handle case differences
      console.log('Checking actual column names in services table...');
      const columnDetails = await dataSource.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'services'
        AND (column_name ILIKE 'estimatedtime')
      `);
      
      if (columnDetails.length > 0) {
        console.log(`Found column with name: ${columnDetails[0].column_name}`);
      }

      // Record the migration as complete
      await dataSource.query(`
        INSERT INTO migrations (timestamp, name) 
        VALUES (1711505600000, 'AddMissingServiceColumns1711505600000')
      `);

      console.log('Migration AddMissingServiceColumns1711505600000 completed successfully');
    } else {
      console.log('Migration AddMissingServiceColumns1711505600000 already applied');
    }

    // Verify service table structure
    const serviceColumns = await dataSource.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'services'
      ORDER BY column_name
    `);

    console.log('\nCurrent structure of services table:');
    serviceColumns.forEach(column => {
      console.log(`- ${column.column_name} (${column.data_type})`);
    });

  } catch (error) {
    console.error('Error running migrations:', error);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('Database connection closed');
    }
  }
}

runMigrations(); 