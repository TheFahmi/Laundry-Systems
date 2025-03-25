const { Client } = require('pg');

// Explicit connection details from .env
const client = new Client({
  user: 'pterodactyl',
  host: 'dono-03.danbot.host',
  database: 'laundry_db',
  password: 'J1F7ZP2WBYWHCBRX',
  port: 2127,
});

async function testPaymentsQuery() {
  try {
    await client.connect();
    console.log('Connected to database successfully');

    // Check if payments table exists
    const tableResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'payments'
      )
    `);
    
    console.log('Payments table exists:', tableResult.rows[0].exists);
    
    if (!tableResult.rows[0].exists) {
      console.log('Payments table does not exist. Cannot proceed with further checks.');
      return;
    }

    // Get the total count of payments
    const countResult = await client.query('SELECT COUNT(*) FROM payments');
    console.log('Total payments in database:', countResult.rows[0].count);

    // Get all payments with paging
    const result = await client.query(`
      SELECT p.*, o.order_number, c.name as customer_name
      FROM payments p
      LEFT JOIN orders o ON p.order_id = o.id
      LEFT JOIN customers c ON p.customer_id = c.id
      ORDER BY p.created_at DESC
      LIMIT 10
    `);

    console.log('Payments found:', result.rows.length);
    
    if (result.rows.length > 0) {
      // Display sample payments
      console.log('\nSample payments:');
      result.rows.forEach((payment, index) => {
        console.log(`\nPayment ${index + 1}:`);
        console.log({
          id: payment.id,
          orderId: payment.order_id,
          orderNumber: payment.order_number,
          customerId: payment.customer_id,
          customerName: payment.customer_name,
          amount: payment.amount,
          method: payment.method,
          status: payment.status,
          createdAt: payment.created_at
        });
      });
    } else {
      console.log('No payments found in the database');
      
      // If there are orders but no payments, this could be an issue
      const orderCountResult = await client.query('SELECT COUNT(*) FROM orders');
      if (parseInt(orderCountResult.rows[0].count) > 0) {
        console.log(`WARNING: There are ${orderCountResult.rows[0].count} orders but no payments.`);
        
        // Check if we can see the relationship between orders and payments
        const sampleOrder = await client.query(`
          SELECT id, order_number FROM orders LIMIT 1
        `);
        
        if (sampleOrder.rows.length > 0) {
          console.log('Sample order:', sampleOrder.rows[0]);
          
          // Try to query payments directly with this order ID
          const directPaymentQuery = await client.query(`
            SELECT * FROM payments WHERE order_id = $1
          `, [sampleOrder.rows[0].id]);
          
          console.log(`Direct payment query for order ${sampleOrder.rows[0].id}:`, 
            directPaymentQuery.rows.length > 0 ? directPaymentQuery.rows : 'No payments found');
        }
      }
    }
  } catch (error) {
    console.error('Error testing payments query:', error);
  } finally {
    await client.end();
    console.log('\nDatabase connection closed');
  }
}

testPaymentsQuery(); 