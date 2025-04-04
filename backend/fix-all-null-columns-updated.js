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

async function fixAllNullColumns() {
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

    // 1. Fix category_id and category in services table
    console.log('\nFIXING: category_id and category in services table');
    
    // Check if there are NULL values in category_id
    const categoryNullCount = await client.query(`
      SELECT COUNT(*) AS count
      FROM services
      WHERE category_id IS NULL;
    `);
    
    console.log(`Found ${categoryNullCount.rows[0].count} services with NULL category_id`);
    
    if (parseInt(categoryNullCount.rows[0].count) > 0) {
      // Get default category_id - create one if doesn't exist
      let defaultCategoryId = null;
      
      // Check if service_categories table exists and has entries
      const categoryTableExists = await client.query(`
        SELECT EXISTS (
          SELECT 1 
          FROM information_schema.tables 
          WHERE table_name = 'service_categories'
        );
      `);
      
      if (categoryTableExists.rows[0].exists) {
        const categoryResult = await client.query(`
          SELECT id FROM service_categories LIMIT 1;
        `);
        
        if (categoryResult.rowCount > 0) {
          defaultCategoryId = categoryResult.rows[0].id;
          console.log(`Using existing category ID: ${defaultCategoryId}`);
        } else {
          // Create a default category
          const newCategoryResult = await client.query(`
            INSERT INTO service_categories (name, description)
            VALUES ('Default Category', 'Default category for services')
            RETURNING id;
          `);
          
          defaultCategoryId = newCategoryResult.rows[0].id;
          console.log(`Created new default category with ID: ${defaultCategoryId}`);
        }
        
        // Update services with NULL category_id
        await client.query(`
          UPDATE services
          SET category_id = $1, category = 'Default Category'
          WHERE category_id IS NULL;
        `, [defaultCategoryId]);
        
        console.log(`Updated ${categoryNullCount.rows[0].count} services with default category`);
      } else {
        console.log('service_categories table does not exist, skipping category_id fix');
      }
    }
    
    // 2. Fix additional_requirements in services table (JSONB type)
    console.log('\nFIXING: additional_requirements in services table (JSONB type)');
    
    // Set default empty JSON object and NOT NULL constraint
    await client.query(`
      UPDATE services
      SET additional_requirements = '{}'::jsonb
      WHERE additional_requirements IS NULL;
    `);
    
    await client.query(`
      ALTER TABLE services
      ALTER COLUMN additional_requirements SET DEFAULT '{}'::jsonb;
    `);
    
    await client.query(`
      ALTER TABLE services
      ALTER COLUMN additional_requirements SET NOT NULL;
    `);
    
    console.log('Successfully fixed additional_requirements column');
    
    // Also fix additionalRequirements (camelCase duplicate column)
    console.log('\nFIXING: additionalRequirements in services table (JSONB type)');
    
    // Set default empty JSON object and NOT NULL constraint
    await client.query(`
      UPDATE services
      SET "additionalRequirements" = '{}'::jsonb
      WHERE "additionalRequirements" IS NULL;
    `);
    
    await client.query(`
      ALTER TABLE services
      ALTER COLUMN "additionalRequirements" SET DEFAULT '{}'::jsonb;
    `);
    
    await client.query(`
      ALTER TABLE services
      ALTER COLUMN "additionalRequirements" SET NOT NULL;
    `);
    
    console.log('Successfully fixed additionalRequirements column');
    
    // 3. Fix notes and weight in order_items table
    console.log('\nFIXING: notes and weight in order_items table');
    
    // For notes, set empty string default
    await client.query(`
      UPDATE order_items
      SET notes = ''
      WHERE notes IS NULL;
    `);
    
    await client.query(`
      ALTER TABLE order_items
      ALTER COLUMN notes SET DEFAULT '';
    `);
    
    // For weight, set 0 as default
    await client.query(`
      UPDATE order_items
      SET weight = 0
      WHERE weight IS NULL;
    `);
    
    await client.query(`
      ALTER TABLE order_items
      ALTER COLUMN weight SET DEFAULT 0;
    `);
    
    console.log('Successfully set defaults for notes and weight columns in order_items');
    
    // 4. Verify all previously fixed columns
    console.log('\nVerifying previously fixed columns:');
    
    // Check order_number in orders
    const orderNumberCheck = await client.query(`
      SELECT COUNT(*) AS count
      FROM orders
      WHERE order_number IS NULL;
    `);
    
    console.log(`orders.order_number NULL count: ${orderNumberCheck.rows[0].count}`);
    
    // Check reference_number in payments
    const referenceNumberCheck = await client.query(`
      SELECT COUNT(*) AS count
      FROM payments
      WHERE reference_number IS NULL;
    `);
    
    console.log(`payments.reference_number NULL count: ${referenceNumberCheck.rows[0].count}`);
    
    // Check name in customers
    const nameCheck = await client.query(`
      SELECT COUNT(*) AS count
      FROM customers
      WHERE name IS NULL;
    `);
    
    console.log(`customers.name NULL count: ${nameCheck.rows[0].count}`);
    
    // Check for any remaining columns with NULL values
    console.log('\nChecking for any remaining issues...');
    const tables = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE';
    `);
    
    let remainingIssues = false;
    
    for (const tableRow of tables.rows) {
      const tableName = tableRow.table_name;
      
      // Get columns for this table that have NOT NULL constraints
      const columnsResult = await client.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = $1
          AND is_nullable = 'NO';
      `, [tableName]);
      
      // Check each column for NULL values
      for (const columnRow of columnsResult.rows) {
        const columnName = columnRow.column_name;
        
        const nullCheckQuery = `
          SELECT COUNT(*) AS count
          FROM "${tableName}"
          WHERE "${columnName}" IS NULL;
        `;
        
        try {
          const nullCheckResult = await client.query(nullCheckQuery);
          const nullCount = parseInt(nullCheckResult.rows[0].count);
          
          if (nullCount > 0) {
            remainingIssues = true;
            console.log(`Table ${tableName} has column "${columnName}" with ${nullCount} NULL values despite NOT NULL constraint`);
          }
        } catch (err) {
          console.log(`Error checking NULL values in ${tableName}.${columnName}: ${err.message}`);
        }
      }
    }
    
    if (!remainingIssues) {
      console.log('No remaining issues found! All columns with NOT NULL constraints have proper values.');
    }
    
    console.log('\nAll critical NULL value issues have been fixed in the database.');
    
  } catch (error) {
    console.error('Error fixing NULL columns:', error);
    console.error(error.stack);
  } finally {
    await client.end();
    console.log('\nConnection closed');
  }
}

fixAllNullColumns(); 