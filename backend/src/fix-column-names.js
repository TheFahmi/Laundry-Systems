const { Client } = require('pg');
require('dotenv').config();

async function fixColumnNames() {
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

    // Fix orders table column names
    console.log('Fixing orders table column names...');
    
    // Check and fix orderNumber -> order_number
    const orderNumberCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'orders' AND column_name = 'orderNumber'
    `);
    
    if (orderNumberCheck.rows.length > 0) {
      console.log('Renaming orderNumber to order_number...');
      await client.query(`ALTER TABLE orders RENAME COLUMN "orderNumber" TO "order_number"`);
      console.log('Successfully renamed orderNumber to order_number.');
    }

    // Check and fix totalAmount -> total_amount
    const totalAmountCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'orders' AND column_name = 'totalAmount'
    `);
    
    if (totalAmountCheck.rows.length > 0) {
      console.log('Renaming totalAmount to total_amount...');
      await client.query(`ALTER TABLE orders RENAME COLUMN "totalAmount" TO "total_amount"`);
      console.log('Successfully renamed totalAmount to total_amount.');
    }

    // Check and fix totalWeight -> total_weight
    const totalWeightCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'orders' AND column_name = 'totalWeight'
    `);
    
    if (totalWeightCheck.rows.length > 0) {
      console.log('Renaming totalWeight to total_weight...');
      await client.query(`ALTER TABLE orders RENAME COLUMN "totalWeight" TO "total_weight"`);
      console.log('Successfully renamed totalWeight to total_weight.');
    }

    // Check and fix specialRequirements -> special_requirements
    const specialRequirementsCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'orders' AND column_name = 'specialRequirements'
    `);
    
    if (specialRequirementsCheck.rows.length > 0) {
      console.log('Renaming specialRequirements to special_requirements...');
      await client.query(`ALTER TABLE orders RENAME COLUMN "specialRequirements" TO "special_requirements"`);
      console.log('Successfully renamed specialRequirements to special_requirements.');
    }

    // Check and fix pickupDate -> pickup_date
    const pickupDateCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'orders' AND column_name = 'pickupDate'
    `);
    
    if (pickupDateCheck.rows.length > 0) {
      console.log('Renaming pickupDate to pickup_date...');
      await client.query(`ALTER TABLE orders RENAME COLUMN "pickupDate" TO "pickup_date"`);
      console.log('Successfully renamed pickupDate to pickup_date.');
    }

    // Check and fix deliveryDate -> delivery_date
    const deliveryDateCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'orders' AND column_name = 'deliveryDate'
    `);
    
    if (deliveryDateCheck.rows.length > 0) {
      console.log('Renaming deliveryDate to delivery_date...');
      await client.query(`ALTER TABLE orders RENAME COLUMN "deliveryDate" TO "delivery_date"`);
      console.log('Successfully renamed deliveryDate to delivery_date.');
    }

    // Fix payments table column names
    console.log('\nFixing payments table column names...');
    
    // Check and fix referenceNumber -> reference_number
    const referenceNumberCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'payments' AND column_name = 'referenceNumber'
    `);
    
    if (referenceNumberCheck.rows.length > 0) {
      console.log('Renaming referenceNumber to reference_number...');
      await client.query(`ALTER TABLE payments RENAME COLUMN "referenceNumber" TO "reference_number"`);
      console.log('Successfully renamed referenceNumber to reference_number.');
    }

    // Check and fix paymentId -> payment_id
    const paymentIdCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'payments' AND column_name = 'paymentId'
    `);
    
    if (paymentIdCheck.rows.length > 0) {
      console.log('Renaming paymentId to payment_id...');
      await client.query(`ALTER TABLE payments RENAME COLUMN "paymentId" TO "payment_id"`);
      console.log('Successfully renamed paymentId to payment_id.');
    }

    // Check and fix transactionId -> transaction_id
    const transactionIdCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'payments' AND column_name = 'transactionId'
    `);
    
    if (transactionIdCheck.rows.length > 0) {
      console.log('Renaming transactionId to transaction_id...');
      await client.query(`ALTER TABLE payments RENAME COLUMN "transactionId" TO "transaction_id"`);
      console.log('Successfully renamed transactionId to transaction_id.');
    }

    console.log('\nAll column names have been fixed.');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
    console.log('Disconnected from database');
  }
}

fixColumnNames().catch(console.error); 