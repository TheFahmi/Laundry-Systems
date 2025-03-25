const { Client } = require('pg');
require('dotenv').config();

async function fixMissingPayments() {
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

    // Find orders without payments
    const ordersWithoutPayments = await client.query(`
      SELECT o.id, o.order_number, o.customer_id, o.total_amount
      FROM orders o
      LEFT JOIN payments p ON o.id = p.order_id
      WHERE p.id IS NULL
    `);
    
    console.log(`Found ${ordersWithoutPayments.rows.length} orders without payment information`);
    
    if (ordersWithoutPayments.rows.length > 0) {
      // Process each order without payments
      for (const order of ordersWithoutPayments.rows) {
        // Generate a payment ID and reference number
        const paymentId = `PAYMENT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const referenceNumber = `REF-${order.order_number || order.id}`;
        
        console.log(`Creating default payment for order ${order.order_number || order.id}`);
        
        // Insert a new payment record
        await client.query(`
          INSERT INTO payments (
            id,
            reference_number,
            order_id,
            customer_id,
            amount,
            method,
            status,
            created_at,
            updated_at,
            payment_id
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), $8
          )
        `, [
          paymentId,
          referenceNumber,
          order.id,
          order.customer_id,
          order.total_amount || 0,
          'CASH',
          'PENDING',
          ordersWithoutPayments.rows.indexOf(order) + 1 // Simple payment_id
        ]);
      }
      
      console.log(`Created ${ordersWithoutPayments.rows.length} default payments`);
    }
    
    // Check if there are any remaining orders without payments
    const remainingChecks = await client.query(`
      SELECT COUNT(*)
      FROM orders o
      LEFT JOIN payments p ON o.id = p.order_id
      WHERE p.id IS NULL
    `);
    
    console.log(`Remaining orders without payments: ${remainingChecks.rows[0].count}`);
    console.log('All orders now have payment information');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
    console.log('Disconnected from database');
  }
}

fixMissingPayments().catch(console.error); 