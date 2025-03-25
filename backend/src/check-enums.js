const { Client } = require('pg');
require('dotenv').config();

async function checkEnums() {
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

    // Check enum types
    console.log('Checking enum types in database...');
    const enumTypes = await client.query(`
      SELECT n.nspname as schema,
             t.typname as type_name,
             e.enumlabel as enum_value
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
      ORDER BY schema, type_name, e.enumsortorder;
    `);

    const enums = {};
    enumTypes.rows.forEach(row => {
      if (!enums[row.type_name]) {
        enums[row.type_name] = [];
      }
      enums[row.type_name].push(row.enum_value);
    });

    console.log('\nEnum types found:');
    for (const [typeName, values] of Object.entries(enums)) {
      console.log(`- ${typeName}: ${values.join(', ')}`);
    }

    // Check payment method and status in database
    console.log('\nChecking payment method and status values in database...');
    const paymentValues = await client.query(`
      SELECT DISTINCT method, status FROM payments;
    `);

    console.log('\nPayment method and status combinations in use:');
    paymentValues.rows.forEach(row => {
      console.log(`- Method: "${row.method}", Status: "${row.status}"`);
    });

    // Check which orders have payment issues
    console.log('\nChecking for orders with payment display issues...');
    
    // Get all orders with their payments
    const orderPayments = await client.query(`
      SELECT o.id, o.order_number, 
             jsonb_agg(jsonb_build_object(
               'id', p.id,
               'reference_number', p.reference_number,
               'method', p.method,
               'status', p.status,
               'amount', p.amount
             )) as payments
      FROM orders o
      LEFT JOIN payments p ON o.id = p.order_id
      GROUP BY o.id, o.order_number;
    `);
    
    // Check for potential issues
    const problemOrders = [];
    
    orderPayments.rows.forEach(row => {
      const payments = row.payments;
      
      // No payments or null payments
      if (!payments || payments.length === 0 || payments[0] === null) {
        problemOrders.push({
          order_number: row.order_number,
          issue: 'No payments found'
        });
        return;
      }
      
      // Check for invalid payment data
      payments.forEach(payment => {
        if (!payment.reference_number || !payment.method || !payment.status) {
          problemOrders.push({
            order_number: row.order_number,
            payment_id: payment.id,
            issue: 'Missing payment data',
            details: `reference_number: ${payment.reference_number}, method: ${payment.method}, status: ${payment.status}`
          });
        }
      });
    });
    
    if (problemOrders.length > 0) {
      console.log('\nProblematic orders found:');
      problemOrders.forEach(problem => {
        console.log(`- Order ${problem.order_number}: ${problem.issue}${problem.details ? ' (' + problem.details + ')' : ''}`);
      });
    } else {
      console.log('\nNo problematic orders found');
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
    console.log('\nDisconnected from database');
  }
}

checkEnums().catch(console.error); 