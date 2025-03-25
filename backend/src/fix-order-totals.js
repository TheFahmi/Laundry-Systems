const { Client } = require('pg');
require('dotenv').config();

async function fixOrderTotals() {
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

    // Get all orders with their items
    const orders = await client.query(`
      SELECT o.id, o.order_number, o.total_amount
      FROM orders o
    `);
    
    console.log(`Found ${orders.rows.length} orders to check`);
    
    let updatedCount = 0;
    
    // Process each order
    for (const order of orders.rows) {
      // Get items for this order
      const items = await client.query(`
        SELECT id, quantity, price, subtotal
        FROM order_items
        WHERE order_id = $1
      `, [order.id]);
      
      if (items.rows.length === 0) {
        console.log(`Order ${order.order_number} has no items`);
        continue;
      }
      
      // Calculate correct total from items
      let calculatedTotal = 0;
      for (const item of items.rows) {
        // Use subtotal if available, otherwise calculate from price * quantity
        const itemTotal = parseFloat(item.subtotal) || (parseFloat(item.price) * parseFloat(item.quantity)) || 0;
        calculatedTotal += itemTotal;
      }
      
      // Format to 2 decimal places
      calculatedTotal = parseFloat(calculatedTotal.toFixed(2));
      const currentTotal = parseFloat(parseFloat(order.total_amount).toFixed(2));
      
      // Update order if total is different
      if (calculatedTotal !== currentTotal) {
        console.log(`Updating order ${order.order_number}: ${currentTotal} -> ${calculatedTotal}`);
        
        await client.query(`
          UPDATE orders
          SET total_amount = $1
          WHERE id = $2
        `, [calculatedTotal, order.id]);
        
        // Also update payment amounts
        await client.query(`
          UPDATE payments
          SET amount = $1
          WHERE order_id = $2
        `, [calculatedTotal, order.id]);
        
        updatedCount++;
      }
    }
    
    console.log(`Updated ${updatedCount} orders with correct totals`);
    console.log('All order totals have been fixed');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
    console.log('Disconnected from database');
  }
}

fixOrderTotals().catch(console.error); 