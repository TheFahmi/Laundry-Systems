const { Client } = require('pg');
require('dotenv').config();

async function fixEmptyPrices() {
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

    // Update subtotals based on price and quantity
    await client.query(`
      UPDATE order_items
      SET subtotal = price * quantity
      WHERE (subtotal IS NULL OR subtotal = 0) AND price > 0 AND quantity > 0
    `);
    
    console.log('Updated subtotals based on price and quantity');

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

    // Check total count of order items
    const totalOrderItems = await client.query(`
      SELECT COUNT(*) FROM order_items
    `);
    
    console.log(`Total order items in database: ${totalOrderItems.rows[0].count}`);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
    console.log('Disconnected from database');
  }
}

fixEmptyPrices().catch(console.error); 