const { Client } = require('pg');
require('dotenv').config();

async function fixOrderItemsTable() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    database: process.env.DB_DATABASE,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL database');

    // Fix price column
    console.log('Fixing price column...');
    
    // Update NULL price values to 0
    const updatePriceResult = await client.query(`
      UPDATE order_items
      SET price = 0
      WHERE price IS NULL;
    `);
    console.log(`Updated ${updatePriceResult.rowCount} rows with NULL price values`);
    
    // Set default constraint and NOT NULL
    await client.query(`
      ALTER TABLE order_items
      ALTER COLUMN price SET DEFAULT 0;
    `);
    
    await client.query(`
      ALTER TABLE order_items
      ALTER COLUMN price SET NOT NULL;
    `);
    
    console.log('Successfully updated price column');

    // Fix subtotal column based on price
    console.log('Fixing subtotal column...');
    const updateSubtotalResult = await client.query(`
      UPDATE order_items
      SET subtotal = price * quantity
      WHERE subtotal IS NULL OR subtotal = 0;
    `);
    console.log(`Updated ${updateSubtotalResult.rowCount} rows with zero/NULL subtotal values`);
    
    // Set default constraint and NOT NULL for subtotal
    await client.query(`
      ALTER TABLE order_items
      ALTER COLUMN subtotal SET DEFAULT 0;
    `);
    
    await client.query(`
      ALTER TABLE order_items
      ALTER COLUMN subtotal SET NOT NULL;
    `);
    
    console.log('Successfully updated subtotal column');

    // Fix unit_price and total_price columns
    console.log('Fixing unit_price and total_price columns...');
    const updatePricesResult = await client.query(`
      UPDATE order_items
      SET unit_price = price, total_price = subtotal
      WHERE unit_price IS NULL OR total_price IS NULL;
    `);
    console.log(`Updated ${updatePricesResult.rowCount} rows with NULL unit_price/total_price values`);
    
    console.log('Successfully fixed all required columns in order_items table');
  } catch (error) {
    console.error('Error fixing order_items table:', error);
    console.error(error.stack);
  } finally {
    await client.end();
    console.log('Connection closed');
  }
}

fixOrderItemsTable(); 