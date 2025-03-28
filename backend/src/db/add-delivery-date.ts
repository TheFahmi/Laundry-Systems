import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function addDeliveryDateColumn() {
  const client = new Client({
    host: process.env.DB_HOST || 'dono-03.danbot.host',
    port: parseInt(process.env.DB_PORT, 10) || 2127,
    user: process.env.DB_USERNAME || 'pterodactyl',
    password: process.env.DB_PASSWORD || 'J1F7ZP2WBYWHCBRX',
    database: process.env.DB_DATABASE || 'laundry_db',
  });

  try {
    await client.connect();
    console.log('Database connection established');
    
    // Check if delivery_date column exists
    const checkQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'orders' 
      AND column_name = 'delivery_date'
    `;
    
    const checkResult = await client.query(checkQuery);
    
    if (checkResult.rows.length === 0) {
      // Column doesn't exist, add it
      const alterQuery = `ALTER TABLE orders ADD COLUMN delivery_date TIMESTAMP NULL`;
      await client.query(alterQuery);
      console.log('delivery_date column added successfully');
    } else {
      console.log('delivery_date column already exists');
    }
    
  } catch (error) {
    console.error('Error adding delivery_date column:', error);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

addDeliveryDateColumn(); 