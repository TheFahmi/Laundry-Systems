const { Client } = require('pg');
require('dotenv').config();

async function debugPayments() {
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

    // 1. Check payments table structure
    console.log('Checking payments table structure...');
    const tableInfo = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'payments'
      ORDER BY ordinal_position;
    `);

    console.log('Payments table columns:');
    tableInfo.rows.forEach(col => {
      console.log(`- ${col.column_name} (${col.data_type})`);
    });

    // 2. Count payments
    const paymentsCount = await client.query(`
      SELECT COUNT(*) FROM payments;
    `);
    console.log(`\nTotal payments in database: ${paymentsCount.rows[0].count}`);

    // 3. Check order-payment relationships
    const orderPayments = await client.query(`
      SELECT o.id, o.order_number, 
             COUNT(p.id) as payment_count
      FROM orders o
      LEFT JOIN payments p ON o.id = p.order_id
      GROUP BY o.id, o.order_number
      ORDER BY payment_count ASC;
    `);

    console.log('\nOrder payment relationships:');
    let ordersWithoutPayments = 0;
    orderPayments.rows.forEach(row => {
      console.log(`- Order ${row.order_number}: ${row.payment_count} payments`);
      if (row.payment_count == 0) {
        ordersWithoutPayments++;
      }
    });

    console.log(`\nOrders without payments: ${ordersWithoutPayments}`);

    // 4. Check if there are any issues with payment data
    const invalidPayments = await client.query(`
      SELECT id, reference_number, amount, method, status
      FROM payments
      WHERE amount IS NULL OR amount = 0
        OR method IS NULL OR method = ''
        OR status IS NULL OR status = ''
        OR reference_number IS NULL OR reference_number = '';
    `);

    if (invalidPayments.rows.length > 0) {
      console.log('\nFound invalid payments:');
      invalidPayments.rows.forEach(payment => {
        console.log(`- Payment ${payment.id}: ${payment.reference_number || 'No Reference'}, Amount: ${payment.amount}, Method: ${payment.method}, Status: ${payment.status}`);
      });

      // Fix invalid payments
      console.log('\nFixing invalid payments...');
      await client.query(`
        UPDATE payments
        SET method = 'CASH' WHERE method IS NULL OR method = '';
        
        UPDATE payments
        SET status = 'PENDING' WHERE status IS NULL OR status = '';
        
        UPDATE payments
        SET amount = (
          SELECT o.total_amount
          FROM orders o
          WHERE o.id = payments.order_id
        )
        WHERE (amount IS NULL OR amount = 0) AND order_id IS NOT NULL;
        
        UPDATE payments
        SET reference_number = CONCAT('REF-', (
          SELECT o.order_number
          FROM orders o
          WHERE o.id = payments.order_id
        ))
        WHERE (reference_number IS NULL OR reference_number = '') AND order_id IS NOT NULL;
      `);
      
      console.log('Fixed invalid payments');
    } else {
      console.log('\nNo invalid payments found');
    }

    // 5. Create payments for orders without them
    if (ordersWithoutPayments > 0) {
      console.log('\nCreating payments for orders without them...');
      
      const ordersNeedingPayments = await client.query(`
        SELECT o.id, o.order_number, o.customer_id, o.total_amount
        FROM orders o
        LEFT JOIN payments p ON o.id = p.order_id
        WHERE p.id IS NULL;
      `);

      for (const order of ordersNeedingPayments.rows) {
        const paymentId = `PAYMENT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const referenceNumber = `REF-${order.order_number}`;
        
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
            updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, NOW(), NOW()
          )
        `, [
          paymentId,
          referenceNumber,
          order.id,
          order.customer_id,
          order.total_amount || 0,
          'CASH',
          'PENDING'
        ]);
        
        console.log(`Created payment ${referenceNumber} for order ${order.order_number}`);
      }
    }

    // 6. Final verification
    const finalCheck = await client.query(`
      SELECT COUNT(*) 
      FROM orders o
      LEFT JOIN payments p ON o.id = p.order_id
      WHERE p.id IS NULL;
    `);
    
    if (parseInt(finalCheck.rows[0].count) > 0) {
      console.log(`\nWARNING: Still found ${finalCheck.rows[0].count} orders without payments`);
    } else {
      console.log('\nVerification successful: All orders have payments');
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
    console.log('\nDisconnected from database');
  }
}

debugPayments().catch(console.error); 