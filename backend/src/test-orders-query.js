const { Client } = require('pg');

// Explicit connection details from .env
const client = new Client({
  user: 'pterodactyl',
  host: 'dono-03.danbot.host',
  database: 'laundry_db',
  password: 'J1F7ZP2WBYWHCBRX',
  port: 2127,
});

async function testOrdersQuery() {
  try {
    await client.connect();
    console.log('Connected to database successfully');

    // Get the count first
    const countResult = await client.query('SELECT COUNT(*) FROM orders');
    console.log('Total orders in database:', countResult.rows[0].count);

    // Test a simple orders query
    const result = await client.query(`
      SELECT o.*, c.name AS customer_name
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      ORDER BY o.created_at DESC
      LIMIT 10
    `);

    console.log('Orders found:', result.rows.length);
    
    if (result.rows.length > 0) {
      console.log('First order:', {
        id: result.rows[0].id,
        orderNumber: result.rows[0].order_number,
        status: result.rows[0].status,
        customerId: result.rows[0].customer_id,
        customerName: result.rows[0].customer_name
      });
      
      // Now get order items for this order
      const itemsResult = await client.query(`
        SELECT oi.*, s.name AS service_name 
        FROM order_items oi
        LEFT JOIN services s ON oi.service_id = s.id
        WHERE oi.order_id = $1
      `, [result.rows[0].id]);
      
      console.log('Order items found:', itemsResult.rows.length);
      if (itemsResult.rows.length > 0) {
        console.log('First item:', itemsResult.rows[0]);
      }
      
      // Get payments for this order
      const paymentsResult = await client.query(`
        SELECT * FROM payments WHERE order_id = $1
      `, [result.rows[0].id]);
      
      console.log('Payments found:', paymentsResult.rows.length);
      if (paymentsResult.rows.length > 0) {
        console.log('First payment:', paymentsResult.rows[0]);
      }
    }
  } catch (error) {
    console.error('Error testing orders query:', error);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

testOrdersQuery(); 