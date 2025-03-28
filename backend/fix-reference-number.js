const { Client } = require('pg');
require('dotenv').config();

async function fixReferenceNumberColumn() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    database: process.env.DB_DATABASE,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL database');

    // Check the payments table structure
    console.log('Checking payments table columns...');
    const columnInfo = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'payments';
    `);
    
    console.log('Columns in payments table:');
    columnInfo.rows.forEach(row => {
      console.log(`- ${row.column_name}`);
    });

    // Generate and update reference_number for NULL values
    console.log('Updating NULL reference_number values...');
    
    // First, identify payments with NULL reference_number
    const nullPaymentsResult = await client.query(`
      SELECT id
      FROM payments
      WHERE reference_number IS NULL;
    `);
    
    console.log(`Found ${nullPaymentsResult.rowCount} payments with NULL reference_number`);
    
    // Update each payment with a unique reference number
    let updatedCount = 0;
    for (const row of nullPaymentsResult.rows) {
      const paymentId = row.id;
      
      // Generate reference number: REF-YYYYMMDD-XXXXX
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
      const referenceNumber = `REF-${year}${month}${day}-${random}`;
      
      // Update the payment
      await client.query(`
        UPDATE payments
        SET reference_number = $1
        WHERE id = $2;
      `, [referenceNumber, paymentId]);
      
      updatedCount++;
      console.log(`Updated payment ${paymentId} with reference_number ${referenceNumber}`);
    }
    
    console.log(`Updated ${updatedCount} payments with generated reference numbers`);

    // Set default value for reference_number column
    console.log('Adding default constraint to reference_number column...');
    await client.query(`
      ALTER TABLE payments
      ALTER COLUMN reference_number SET DEFAULT 'REF-00000000-00000';
    `);
    
    // Set NOT NULL constraint
    console.log('Setting NOT NULL constraint on reference_number column...');
    await client.query(`
      ALTER TABLE payments
      ALTER COLUMN reference_number SET NOT NULL;
    `);
    
    console.log('Successfully fixed the reference_number column');
  } catch (error) {
    console.error('Error fixing reference_number column:', error);
    console.error(error.stack);
  } finally {
    await client.end();
    console.log('Connection closed');
  }
}

fixReferenceNumberColumn(); 