const { Client } = require('pg');
require('dotenv').config();

async function fixOrderItemsTable() {
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

    // First, check the structure of order_items table
    console.log('Checking order_items table structure...');
    const tableInfo = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'order_items'
      ORDER BY ordinal_position;
    `);

    console.log('Current order_items table columns:');
    tableInfo.rows.forEach(col => {
      console.log(`- ${col.column_name} (${col.data_type})`);
    });

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

    // Check for services relation and update service names if possible
    if (tableInfo.rows.some(col => col.column_name === 'service_id')) {
      console.log('Updating service names in order items...');
      
      // First, make sure the references between order_items and services are valid
      const validServiceIdsCheck = await client.query(`
        SELECT COUNT(*) as count
        FROM order_items oi
        LEFT JOIN services s ON oi.service_id = s.id
        WHERE oi.service_id IS NOT NULL AND s.id IS NULL
      `);
      
      if (parseInt(validServiceIdsCheck.rows[0].count) > 0) {
        console.log(`Found ${validServiceIdsCheck.rows[0].count} order items with invalid service_id references.`);
        
        // Fix by setting to the first valid service id
        await client.query(`
          UPDATE order_items 
          SET service_id = (SELECT MIN(id) FROM services)
          WHERE service_id IS NOT NULL 
          AND service_id NOT IN (SELECT id FROM services)
        `);
        console.log('Fixed invalid service_id references.');
      }
    }

    console.log('All order_items table fixes completed successfully.');
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
    console.log('Disconnected from database');
  }
}

fixOrderItemsTable().catch(console.error); 