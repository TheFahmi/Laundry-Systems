const { Client } = require('pg');
require('dotenv').config();

async function fixPaymentIdColumn() {
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

    // Check if the paymentId column exists
    const checkRes = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'payments' AND column_name = 'paymentId'
    `);

    if (checkRes.rows.length === 0) {
      console.log('Adding paymentId column to payments table...');
      await client.query(`ALTER TABLE payments ADD COLUMN IF NOT EXISTS "paymentId" INTEGER`);
      
      // Generate sequential values for existing records
      console.log('Generating sequential values for paymentId...');
      await client.query(`
        WITH numbered_payments AS (
          SELECT id, ROW_NUMBER() OVER (ORDER BY created_at, id) AS rn
          FROM payments
        )
        UPDATE payments
        SET "paymentId" = np.rn
        FROM numbered_payments np
        WHERE payments.id = np.id
      `);
      
      console.log('Successfully added and populated paymentId column');
    } else {
      console.log('paymentId column already exists, skipping');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
    console.log('Disconnected from database');
  }
}

fixPaymentIdColumn().catch(console.error); 