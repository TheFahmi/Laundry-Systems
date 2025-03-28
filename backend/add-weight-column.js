require('dotenv').config();
const { Client } = require('pg');

console.log('Using database config:', {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '2127'),
  database: process.env.DB_DATABASE,
  user: process.env.DB_USERNAME,
});

const client = new Client({
  host: process.env.DB_HOST || 'dono-03.danbot.host',
  port: parseInt(process.env.DB_PORT || '2127'),
  database: process.env.DB_DATABASE || 'laundry_db',
  user: process.env.DB_USERNAME || 'pterodactyl',
  password: process.env.DB_PASSWORD || 'J1F7ZP2WBYWHCBRX'
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Execute the ALTER TABLE command
    const result = await client.query('ALTER TABLE order_items ADD COLUMN IF NOT EXISTS weight DECIMAL(10,2) DEFAULT NULL');
    console.log('Added weight column to order_items table');
    
    // Close the connection
    await client.end();
    console.log('Connection closed');
  } catch (err) {
    console.error('Error:', err);
    try {
      await client.end();
    } catch (e) {
      // Ignore error on connection close
    }
  }
}

run(); 