const { Client } = require('pg');
require('dotenv').config();

async function fixPaymentAndPriceIssues() {
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

    // 1. Fix empty price and subtotal values
    console.log('\n--- Fixing Empty Price and Subtotal Values ---');
    
    // Get count of empty prices
    const emptyPricesCount = await client.query(`
      SELECT COUNT(*) 
      FROM order_items 
      WHERE price = 0 OR price IS NULL
    `);
    
    console.log(`Found ${emptyPricesCount.rows[0].count} order items with empty prices`);
    
    if (parseInt(emptyPricesCount.rows[0].count) > 0) {
      // Get service prices for order items that have service_id
      await client.query(`
        UPDATE order_items oi
        SET price = s.price
        FROM services s
        WHERE oi.service_id = s.id 
        AND (oi.price = 0 OR oi.price IS NULL)
      `);
      console.log('Updated prices from services table where possible');
      
      // For remaining items with no price, set default price of 15000
      await client.query(`
        UPDATE order_items
        SET price = 15000
        WHERE price = 0 OR price IS NULL
      `);
      console.log('Set default price for remaining items with empty price');
    }
    
    // Get count of empty subtotals
    const emptySubtotalsCount = await client.query(`
      SELECT COUNT(*) 
      FROM order_items 
      WHERE subtotal = 0 OR subtotal IS NULL
    `);
    
    console.log(`Found ${emptySubtotalsCount.rows[0].count} order items with empty subtotals`);
    
    if (parseInt(emptySubtotalsCount.rows[0].count) > 0) {
      // Calculate subtotal as price * quantity
      await client.query(`
        UPDATE order_items
        SET subtotal = price * quantity
        WHERE (subtotal = 0 OR subtotal IS NULL) AND price > 0 AND quantity > 0
      `);
      console.log('Updated subtotals based on price and quantity');
    }
    
    // 2. Fix payment information display issues
    console.log('\n--- Fixing Payment Information Issues ---');
    
    // Check if orders have associated payments
    const ordersWithoutPayments = await client.query(`
      SELECT o.id, o.order_number
      FROM orders o
      LEFT JOIN payments p ON o.id = p.order_id
      WHERE p.id IS NULL
    `);
    
    console.log(`Found ${ordersWithoutPayments.rows.length} orders without payment information`);
    
    if (ordersWithoutPayments.rows.length > 0) {
      // For each order without payment, create a default payment record
      for (const order of ordersWithoutPayments.rows) {
        // Generate a unique ID
        const paymentId = `PAY-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        const referenceNumber = `REF-${order.order_number}`;
        
        // Get customer ID for this order
        const orderInfo = await client.query(`
          SELECT customer_id, total_amount
          FROM orders
          WHERE id = $1
        `, [order.id]);
        
        if (orderInfo.rows.length > 0) {
          const { customer_id, total_amount } = orderInfo.rows[0];
          
          // Create a default payment record
          await client.query(`
            INSERT INTO payments (
              id, 
              order_id, 
              customer_id, 
              amount, 
              method, 
              status, 
              reference_number, 
              created_at, 
              updated_at,
              payment_id
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), $8
            )
          `, [
            paymentId,
            order.id,
            customer_id,
            total_amount || 0,
            'CASH',
            'PENDING',
            referenceNumber,
            ordersWithoutPayments.rows.indexOf(order) + 1
          ]);
          
          console.log(`Created default payment for order ${order.order_number}`);
        }
      }
    }
    
    // Ensure payment amounts match order total_amount
    await client.query(`
      UPDATE payments p
      SET amount = o.total_amount
      FROM orders o
      WHERE p.order_id = o.id AND p.amount <> o.total_amount AND o.total_amount > 0
    `);
    console.log('Updated payment amounts to match order totals');
    
    // 3. Update order total_amount based on item subtotals if needed
    const ordersWithEmptyTotals = await client.query(`
      SELECT COUNT(*) 
      FROM orders 
      WHERE total_amount = 0 OR total_amount IS NULL
    `);
    
    console.log(`Found ${ordersWithEmptyTotals.rows[0].count} orders with empty total amounts`);
    
    if (parseInt(ordersWithEmptyTotals.rows[0].count) > 0) {
      // Calculate total_amount based on sum of order items subtotals
      await client.query(`
        UPDATE orders o
        SET total_amount = (
          SELECT COALESCE(SUM(subtotal), 0)
          FROM order_items oi
          WHERE oi.order_id = o.id
        )
        WHERE total_amount = 0 OR total_amount IS NULL
      `);
      console.log('Updated order total amounts based on item subtotals');
      
      // Then update payment amounts to match
      await client.query(`
        UPDATE payments p
        SET amount = o.total_amount
        FROM orders o
        WHERE p.order_id = o.id AND o.total_amount > 0
      `);
      console.log('Updated payment amounts to match new order totals');
    }
    
    // 4. Check final counts to confirm fixes
    const remainingEmptyPrices = await client.query(`
      SELECT COUNT(*) 
      FROM order_items 
      WHERE price = 0 OR price IS NULL
    `);
    
    const remainingEmptySubtotals = await client.query(`
      SELECT COUNT(*) 
      FROM order_items 
      WHERE subtotal = 0 OR subtotal IS NULL
    `);
    
    const remainingOrdersWithoutPayments = await client.query(`
      SELECT COUNT(*)
      FROM orders o
      LEFT JOIN payments p ON o.id = p.order_id
      WHERE p.id IS NULL
    `);
    
    console.log('\n--- Final Check Results ---');
    console.log(`Remaining order items with empty prices: ${remainingEmptyPrices.rows[0].count}`);
    console.log(`Remaining order items with empty subtotals: ${remainingEmptySubtotals.rows[0].count}`);
    console.log(`Remaining orders without payment information: ${remainingOrdersWithoutPayments.rows[0].count}`);
    console.log('All fixes completed successfully');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
    console.log('Disconnected from database');
  }
}

fixPaymentAndPriceIssues().catch(console.error); 