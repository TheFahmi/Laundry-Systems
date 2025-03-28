const { Client } = require('pg');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables from .env file
const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log(`Loading environment from ${envPath}`);
  dotenv.config({ path: envPath });
} else {
  console.log('No .env file found, using default environment variables');
  dotenv.config();
}

async function executeManualMigration() {
  console.log(`Connecting to PostgreSQL at ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE} as ${process.env.DB_USERNAME}`);
  
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    database: process.env.DB_DATABASE,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL database');

    // SQL commands to fix all tables
    const migrations = [
      // 1. Make sure customers.name has no NULL values
      {
        name: 'Fix customers.name column',
        sql: `
          UPDATE customers SET name = 'Unknown Customer' WHERE name IS NULL;
          ALTER TABLE customers ALTER COLUMN name SET DEFAULT 'Unknown Customer';
          ALTER TABLE customers ALTER COLUMN name SET NOT NULL;
        `
      },
      // 2. Make sure orders.order_number has no NULL values
      {
        name: 'Fix orders.order_number column',
        sql: `
          UPDATE orders 
          SET order_number = CONCAT('ORD-', TO_CHAR(NOW(), 'YYYYMMDD'), '-', LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0'))
          WHERE order_number IS NULL;
          ALTER TABLE orders ALTER COLUMN order_number SET DEFAULT 'ORD-00000000-00000';
          ALTER TABLE orders ALTER COLUMN order_number SET NOT NULL;
        `
      },
      // 3. Make sure payments.reference_number has no NULL values
      {
        name: 'Fix payments.reference_number column',
        sql: `
          UPDATE payments 
          SET reference_number = CONCAT('REF-', TO_CHAR(NOW(), 'YYYYMMDD'), '-', LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0'))
          WHERE reference_number IS NULL;
          ALTER TABLE payments ALTER COLUMN reference_number SET DEFAULT 'REF-00000000-00000';
          ALTER TABLE payments ALTER COLUMN reference_number SET NOT NULL;
        `
      },
      // 4. Fix services.additional_requirements (JSONB column)
      {
        name: 'Fix services.additional_requirements column',
        sql: `
          UPDATE services SET additional_requirements = '{}'::jsonb WHERE additional_requirements IS NULL;
          ALTER TABLE services ALTER COLUMN additional_requirements SET DEFAULT '{}'::jsonb;
          ALTER TABLE services ALTER COLUMN additional_requirements SET NOT NULL;
        `
      },
      // 5. Fix services.additionalRequirements (JSONB column)
      {
        name: 'Fix services.additionalRequirements column',
        sql: `
          UPDATE services SET "additionalRequirements" = '{}'::jsonb WHERE "additionalRequirements" IS NULL;
          ALTER TABLE services ALTER COLUMN "additionalRequirements" SET DEFAULT '{}'::jsonb;
          ALTER TABLE services ALTER COLUMN "additionalRequirements" SET NOT NULL;
        `
      },
      // 6. Fix services.category_id and services.category
      {
        name: 'Fix services.category_id and services.category columns',
        sql: `
          -- First, find a default category_id or create one if needed
          DO $$
          DECLARE
            default_category_id INTEGER;
          BEGIN
            -- Check if service_categories table exists
            IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'service_categories') THEN
              -- Get an existing category or create a new one
              SELECT id INTO default_category_id FROM service_categories LIMIT 1;
              
              IF default_category_id IS NULL THEN
                -- Create a new category if none exists
                INSERT INTO service_categories (name, description)
                VALUES ('Default Category', 'Default category for services')
                RETURNING id INTO default_category_id;
              END IF;
              
              -- Update NULL category_id values
              UPDATE services
              SET category_id = default_category_id,
                  category = 'Default Category'
              WHERE category_id IS NULL;
              
              -- Optional: Add defaults and constraints
              -- ALTER TABLE services ALTER COLUMN category_id SET DEFAULT default_category_id;
              -- ALTER TABLE services ALTER COLUMN category_id SET NOT NULL;
            END IF;
          END $$;
        `
      },
      // 7. Fix order_items.notes and order_items.weight
      {
        name: 'Fix order_items.notes and order_items.weight columns',
        sql: `
          UPDATE order_items SET notes = '' WHERE notes IS NULL;
          ALTER TABLE order_items ALTER COLUMN notes SET DEFAULT '';
          
          UPDATE order_items SET weight = 0 WHERE weight IS NULL;
          ALTER TABLE order_items ALTER COLUMN weight SET DEFAULT 0;
        `
      },
      // 8. Check if any JSONB columns need to be converted from text
      {
        name: 'Check for text columns that should be JSONB',
        sql: `
          DO $$
          BEGIN
            -- This is a safety check only; don't execute anything here
            -- If you need to convert text to jsonb, you'd do it with a separate migration
          END $$;
        `
      }
    ];

    // Execute each migration in sequence
    console.log('\nExecuting manual migrations...');
    
    for (const migration of migrations) {
      console.log(`\n--- Running migration: ${migration.name} ---`);
      try {
        await client.query(migration.sql);
        console.log(`Successfully completed: ${migration.name}`);
      } catch (error) {
        console.error(`Error in migration "${migration.name}":`, error.message);
        // Continue with the next migration even if this one failed
      }
    }
    
    // Final check for any remaining NULL values in NOT NULL columns
    console.log('\n--- Final check for NULL values in NOT NULL columns ---');
    
    const tables = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        AND table_name NOT IN ('migrations', 'typeorm_metadata');
    `);
    
    for (const tableRow of tables.rows) {
      const tableName = tableRow.table_name;
      
      const columns = await client.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = $1
          AND is_nullable = 'NO';
      `, [tableName]);
      
      for (const columnRow of columns.rows) {
        const columnName = columnRow.column_name;
        
        try {
          const nullCheck = await client.query(`
            SELECT COUNT(*) as count
            FROM "${tableName}"
            WHERE "${columnName}" IS NULL;
          `);
          
          if (parseInt(nullCheck.rows[0].count) > 0) {
            console.error(`WARNING: "${tableName}.${columnName}" still contains ${nullCheck.rows[0].count} NULL values despite NOT NULL constraint!`);
          }
        } catch (err) {
          // Ignore errors from quoting issues
        }
      }
    }
    
    console.log('\nManual migration completed.');
    console.log('You can now re-enable synchronize in app.module.ts if desired.');
    
  } catch (error) {
    console.error('Error executing manual migration:', error);
    console.error(error.stack);
  } finally {
    await client.end();
    console.log('\nConnection closed');
  }
}

executeManualMigration(); 