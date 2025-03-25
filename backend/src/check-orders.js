const { Client } = require('pg');
require('dotenv').config();

async function checkOrders() {
  const client = new Client({
    user: process.env.DB_USERNAME,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    await client.connect();
    console.log('Connected to database successfully');

    // Check total orders
    const { rows: countRows } = await client.query('SELECT COUNT(*) FROM orders');
    console.log('Total orders in database:', countRows[0].count);

    // If there are orders, check for any potential issues
    if (parseInt(countRows[0].count) > 0) {
      // Check if there are orders with invalid customer_id
      const { rows: missingCustomerRows } = await client.query(
        'SELECT COUNT(*) FROM orders o LEFT JOIN customers c ON o.customer_id = c.id WHERE c.id IS NULL'
      );
      console.log('Orders with missing customer:', missingCustomerRows[0].count);

      // Check orders without any order items
      const { rows: emptyOrderRows } = await client.query(
        'SELECT COUNT(*) FROM orders o LEFT JOIN order_items oi ON o.id = oi.order_id WHERE oi.id IS NULL'
      );
      console.log('Orders without any items:', emptyOrderRows[0].count);

      // Get most recent order
      const { rows: recentOrderRows } = await client.query(
        'SELECT id, order_number, customer_id, status, created_at FROM orders ORDER BY created_at DESC LIMIT 1'
      );
      
      if (recentOrderRows.length > 0) {
        console.log('Most recent order:', recentOrderRows[0]);
        
        // Check items for this order
        const { rows: orderItemRows } = await client.query(
          'SELECT * FROM order_items WHERE order_id = $1',
          [recentOrderRows[0].id]
        );
        console.log(`Items for order ${recentOrderRows[0].id}:`, orderItemRows.length > 0 ? orderItemRows : 'No items found');
      }
    }

  } catch (error) {
    console.error('Error checking orders:', error);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

checkOrders(); 