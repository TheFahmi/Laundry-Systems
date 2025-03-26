import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function addIsActiveColumn() {
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
    
    // Check if column exists
    const checkColumnQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'services'
        AND column_name = 'is_active'
      )
    `;
    
    const columnResult = await client.query(checkColumnQuery);
    
    if (!columnResult.rows[0].exists) {
      console.log('Adding "is_active" column to services table...');
      
      // Add the is_active column with default value
      const addColumnQuery = `
        ALTER TABLE services 
        ADD COLUMN is_active BOOLEAN DEFAULT TRUE NOT NULL
      `;
      
      await client.query(addColumnQuery);
      console.log('Column "is_active" added successfully');
    } else {
      console.log('Column "is_active" already exists in services table');
    }
    
  } catch (error) {
    console.error('Error updating service table:', error);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

addIsActiveColumn(); 