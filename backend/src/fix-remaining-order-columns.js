const { Client } = require('pg');
require('dotenv').config();

async function fixRemainingOrderColumns() {
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

    // Fix special_requirements column
    const specialReqCamelCaseCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'orders' AND column_name = 'specialRequirements'
    `);
    const specialReqSnakeCaseCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'orders' AND column_name = 'special_requirements'
    `);
    if (specialReqCamelCaseCheck.rows.length === 0 && specialReqSnakeCaseCheck.rows.length > 0) {
      console.log('Renaming special_requirements to specialRequirements in orders table...');
      await client.query(`ALTER TABLE orders RENAME COLUMN "special_requirements" TO "specialRequirements"`);
      console.log('Successfully renamed special_requirements to specialRequirements');
    }

    // Fix pickup_date column
    const pickupDateCamelCaseCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'orders' AND column_name = 'pickupDate'
    `);
    const pickupDateSnakeCaseCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'orders' AND column_name = 'pickup_date'
    `);
    if (pickupDateCamelCaseCheck.rows.length === 0 && pickupDateSnakeCaseCheck.rows.length > 0) {
      console.log('Renaming pickup_date to pickupDate in orders table...');
      await client.query(`ALTER TABLE orders RENAME COLUMN "pickup_date" TO "pickupDate"`);
      console.log('Successfully renamed pickup_date to pickupDate');
    }

    // Fix delivery_date column
    const deliveryDateCamelCaseCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'orders' AND column_name = 'deliveryDate'
    `);
    const deliveryDateSnakeCaseCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'orders' AND column_name = 'delivery_date'
    `);
    if (deliveryDateCamelCaseCheck.rows.length === 0 && deliveryDateSnakeCaseCheck.rows.length > 0) {
      console.log('Renaming delivery_date to deliveryDate in orders table...');
      await client.query(`ALTER TABLE orders RENAME COLUMN "delivery_date" TO "deliveryDate"`);
      console.log('Successfully renamed delivery_date to deliveryDate');
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
    console.log('Disconnected from database');
  }
}

fixRemainingOrderColumns().catch(console.error); 