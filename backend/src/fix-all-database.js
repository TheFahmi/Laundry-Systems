const { Client } = require('pg');
require('dotenv').config();

async function fixAllDatabase() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // 1. Fix service_categories table
    const serviceCategoriesTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'service_categories'
      );
    `);

    if (!serviceCategoriesTableCheck.rows[0].exists) {
      console.log('Service categories table does not exist. Creating it...');
      
      await client.query(`
        CREATE TABLE service_categories (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      console.log('Service categories table created successfully.');
      
      // Insert sample categories
      await client.query(`
        INSERT INTO service_categories (name, description) 
        VALUES 
          ('Regular', 'Layanan cuci reguler'),
          ('Express', 'Layanan cuci express'),
          ('Premium', 'Layanan cuci premium');
      `);
      
      console.log('Sample service category data inserted successfully.');
    } else {
      console.log('Service categories table already exists.');
    }

    // 2. Fix services table
    const servicesTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'services'
      );
    `);

    if (!servicesTableCheck.rows[0].exists) {
      console.log('Services table does not exist. Creating it...');
      
      await client.query(`
        CREATE TABLE services (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          price DECIMAL(10,2) NOT NULL,
          category_id INTEGER,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      console.log('Services table created successfully.');
      
      // Insert sample services
      await client.query(`
        INSERT INTO services (name, description, price, category_id) 
        VALUES 
          ('Cuci Reguler', 'Layanan cuci standar', 15000, 1),
          ('Cuci Express', 'Layanan cuci cepat', 25000, 2),
          ('Dry Cleaning', 'Layanan dry cleaning', 35000, 3),
          ('Setrika', 'Layanan setrika', 10000, 1);
      `);
      
      console.log('Sample service data inserted successfully.');
    } else {
      console.log('Services table already exists.');
    }
    
    // 3. Add foreign key constraint
    await client.query(`
      ALTER TABLE services 
      ADD CONSTRAINT fk_service_category 
      FOREIGN KEY (category_id) 
      REFERENCES service_categories(id)
      ON DELETE SET NULL
      ON UPDATE CASCADE;
    `).catch(err => {
      // Constraint might already exist, which is fine
      if (err.code !== '42P16') { // 42P16 is the error code for "constraint already exists"
        console.error('Error adding foreign key constraint:', err);
      } else {
        console.log('Foreign key constraint already exists.');
      }
    });
    
    // 4. Fix order_items table relationships
    // Check if order_items has service_id column
    const serviceIdColumnCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'order_items' AND column_name = 'service_id'
      );
    `);
    
    if (!serviceIdColumnCheck.rows[0].exists) {
      console.log('Adding service_id column to order_items table...');
      await client.query(`
        ALTER TABLE order_items
        ADD COLUMN service_id INTEGER;
      `);
      console.log('service_id column added successfully.');
    } else {
      console.log('service_id column already exists in order_items table.');
    }
    
    // 5. Fix order items by populating some service IDs if they're null
    const updateOrderItemsResult = await client.query(`
      UPDATE order_items 
      SET service_id = (SELECT id FROM services ORDER BY id LIMIT 1)
      WHERE service_id IS NULL;
    `);
    
    console.log(`Updated ${updateOrderItemsResult.rowCount} order items with default service_id.`);
    
    // 6. Fix column names for price and subtotal in order_items
    console.log('Checking column names in order_items table...');
    
    // Check if price column exists (might be unit_price instead)
    const priceColumnCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'order_items' AND column_name = 'price'
    `);

    // Check if unit_price exists
    const unitPriceColumnCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'order_items' AND column_name = 'unit_price'
    `);

    if (priceColumnCheck.rows.length === 0 && unitPriceColumnCheck.rows.length > 0) {
      console.log('Found unit_price column but no price column. Renaming unit_price to price...');
      await client.query(`ALTER TABLE order_items RENAME COLUMN "unit_price" TO "price"`);
      console.log('Successfully renamed unit_price to price.');
    } 
    else if (priceColumnCheck.rows.length === 0 && unitPriceColumnCheck.rows.length === 0) {
      console.log('Neither price nor unit_price column exists. Adding price column...');
      await client.query(`ALTER TABLE order_items ADD COLUMN "price" DECIMAL(10,2) DEFAULT 0`);
      console.log('Successfully added price column.');
    }
    else {
      console.log('Price column already exists.');
    }

    // Check if subtotal column exists (might be total_price instead)
    const subtotalColumnCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'order_items' AND column_name = 'subtotal'
    `);

    // Check if total_price exists
    const totalPriceColumnCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'order_items' AND column_name = 'total_price'
    `);

    if (subtotalColumnCheck.rows.length === 0 && totalPriceColumnCheck.rows.length > 0) {
      console.log('Found total_price column but no subtotal column. Renaming total_price to subtotal...');
      await client.query(`ALTER TABLE order_items RENAME COLUMN "total_price" TO "subtotal"`);
      console.log('Successfully renamed total_price to subtotal.');
    } 
    else if (subtotalColumnCheck.rows.length === 0 && totalPriceColumnCheck.rows.length === 0) {
      console.log('Neither subtotal nor total_price column exists. Adding subtotal column...');
      await client.query(`ALTER TABLE order_items ADD COLUMN "subtotal" DECIMAL(10,2) DEFAULT 0`);
      console.log('Successfully added subtotal column.');
      
      // Update subtotal based on price and quantity
      await client.query(`
        UPDATE order_items 
        SET subtotal = price * quantity 
        WHERE subtotal = 0 AND price > 0 AND quantity > 0
      `);
      console.log('Updated subtotal values based on price and quantity.');
    }
    else {
      console.log('Subtotal column already exists.');
    }

    // 7. Check if service_name column exists
    const serviceNameColumnCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'order_items' AND column_name = 'service_name'
    `);

    if (serviceNameColumnCheck.rows.length === 0) {
      console.log('Adding service_name column to order_items table...');
      await client.query(`
        ALTER TABLE order_items
        ADD COLUMN service_name VARCHAR(255);
      `);
      console.log('service_name column added successfully.');
      
      // Populate service_name from services table where possible
      await client.query(`
        UPDATE order_items oi
        SET service_name = s.name
        FROM services s
        WHERE oi.service_id = s.id AND oi.service_name IS NULL;
      `);
      console.log('Updated service_name values from services table.');
      
      // Set default service name for remaining null values
      await client.query(`
        UPDATE order_items
        SET service_name = 'Unnamed Service'
        WHERE service_name IS NULL;
      `);
      console.log('Set default service_name for remaining items.');
    }
    
    // 8. Fix camelCase column issues
    // Check for and rename timestamp columns in orders, payments, customers tables
    const checkCreatedAtColumns = async (table) => {
      const camelCaseCheck = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = '${table}' AND column_name = 'createdAt'
      `);
      
      const snakeCaseCheck = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = '${table}' AND column_name = 'created_at'
      `);
      
      if (camelCaseCheck.rows.length > 0 && snakeCaseCheck.rows.length === 0) {
        console.log(`Renaming createdAt to created_at in ${table} table...`);
        await client.query(`ALTER TABLE ${table} RENAME COLUMN "createdAt" TO "created_at"`);
        console.log(`Successfully renamed createdAt to created_at in ${table} table.`);
      }
      
      const camelCaseUpdateCheck = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = '${table}' AND column_name = 'updatedAt'
      `);
      
      const snakeCaseUpdateCheck = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = '${table}' AND column_name = 'updated_at'
      `);
      
      if (camelCaseUpdateCheck.rows.length > 0 && snakeCaseUpdateCheck.rows.length === 0) {
        console.log(`Renaming updatedAt to updated_at in ${table} table...`);
        await client.query(`ALTER TABLE ${table} RENAME COLUMN "updatedAt" TO "updated_at"`);
        console.log(`Successfully renamed updatedAt to updated_at in ${table} table.`);
      }
    };
    
    // Check and fix timestamp columns in various tables
    await checkCreatedAtColumns('orders');
    await checkCreatedAtColumns('payments');
    await checkCreatedAtColumns('customers');
    await checkCreatedAtColumns('order_items');
    await checkCreatedAtColumns('services');
    await checkCreatedAtColumns('service_categories');

    // 9. Ensure price and subtotal values are properly set
    console.log('Checking for empty price and subtotal values...');
    
    // Get count of empty prices
    const emptyPricesCount = await client.query(`
      SELECT COUNT(*) 
      FROM order_items 
      WHERE price IS NULL OR price = 0
    `);
    
    console.log(`Found ${emptyPricesCount.rows[0].count} order items with empty prices`);

    // Get count of empty subtotals
    const emptySubtotalsCount = await client.query(`
      SELECT COUNT(*) 
      FROM order_items 
      WHERE subtotal IS NULL OR subtotal = 0
    `);
    
    console.log(`Found ${emptySubtotalsCount.rows[0].count} order items with empty subtotals`);

    if (parseInt(emptyPricesCount.rows[0].count) > 0) {
      // Update prices from services table where possible
      await client.query(`
        UPDATE order_items oi
        SET price = s.price
        FROM services s
        WHERE oi.service_id = s.id 
        AND (oi.price IS NULL OR oi.price = 0)
      `);
      
      console.log('Updated prices from services table');

      // For remaining order items, set a default price
      await client.query(`
        UPDATE order_items
        SET price = 15000
        WHERE price IS NULL OR price = 0
      `);
      
      console.log('Set default price for remaining items');
    }

    if (parseInt(emptySubtotalsCount.rows[0].count) > 0) {
      // Update subtotals based on price and quantity
      await client.query(`
        UPDATE order_items
        SET subtotal = price * quantity
        WHERE (subtotal IS NULL OR subtotal = 0) AND price > 0 AND quantity > 0
      `);
      
      console.log('Updated subtotals based on price and quantity');
    }

    // Get count of remaining empty prices after fixes
    const remainingEmptyPrices = await client.query(`
      SELECT COUNT(*) 
      FROM order_items 
      WHERE price IS NULL OR price = 0
    `);
    
    console.log(`After fixes: ${remainingEmptyPrices.rows[0].count} order items with empty prices`);

    // Get count of remaining empty subtotals after fixes
    const remainingEmptySubtotals = await client.query(`
      SELECT COUNT(*) 
      FROM order_items 
      WHERE subtotal IS NULL OR subtotal = 0
    `);
    
    console.log(`After fixes: ${remainingEmptySubtotals.rows[0].count} order items with empty subtotals`);

    console.log('All database fixes completed successfully.');
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
    console.log('Disconnected from database');
  }
}

fixAllDatabase().catch(console.error); 