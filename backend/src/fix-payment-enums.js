const { Client } = require('pg');
require('dotenv').config();

async function fixPaymentEnums() {
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

    // Check existing payment values
    const { rows: existingPayments } = await client.query(
      'SELECT id, method, status FROM payments'
    );
    console.log(`Found ${existingPayments.length} payments to check`);

    // Get valid enum values
    const { rows: methodEnums } = await client.query(
      `SELECT enumlabel FROM pg_enum 
       JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
       WHERE pg_type.typname = 'paymentmethod'`
    );
    
    const { rows: statusEnums } = await client.query(
      `SELECT enumlabel FROM pg_enum 
       JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
       WHERE pg_type.typname = 'paymentstatus'`
    );

    const validMethods = methodEnums.map(row => row.enumlabel);
    const validStatuses = statusEnums.map(row => row.enumlabel);

    console.log('Valid payment methods:', validMethods);
    console.log('Valid payment statuses:', validStatuses);

    // Count payments with invalid values
    let invalidMethodCount = 0;
    let invalidStatusCount = 0;

    // Fix invalid values
    for (const payment of existingPayments) {
      let needsUpdate = false;
      const updates = {};

      // Check and fix method
      if (!validMethods.includes(payment.method)) {
        invalidMethodCount++;
        updates.method = 'cash'; // Default to cash
        needsUpdate = true;
      }

      // Check and fix status
      if (!validStatuses.includes(payment.status)) {
        invalidStatusCount++;
        updates.status = 'completed'; // Default to completed
        needsUpdate = true;
      }

      // Update payment if needed
      if (needsUpdate) {
        const setClause = Object.entries(updates)
          .map(([key, value]) => `${key} = '${value}'`)
          .join(', ');

        await client.query(
          `UPDATE payments SET ${setClause} WHERE id = $1`,
          [payment.id]
        );
        console.log(`Updated payment ${payment.id} with ${setClause}`);
      }
    }

    console.log(`Fixed ${invalidMethodCount} invalid payment methods`);
    console.log(`Fixed ${invalidStatusCount} invalid payment statuses`);
    console.log('Payment enum fixes completed successfully');

  } catch (error) {
    console.error('Error fixing payment enums:', error);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

fixPaymentEnums(); 