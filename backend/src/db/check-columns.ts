import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function checkServiceColumns() {
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
    
    const query = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'services'
    `;
    
    const result = await client.query(query);
    console.log('Columns in services table:');
    result.rows.forEach(row => {
      console.log(`- ${row.column_name} (${row.data_type})`);
    });
    
  } catch (error) {
    console.error('Error checking service columns:', error);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

checkServiceColumns(); 