import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function updateServiceTable() {
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
    
    // Check if the unit column already exists
    const checkUnitColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'services' 
      AND column_name = 'unit'
    `;
    
    const unitColumnResult = await client.query(checkUnitColumnQuery);
    
    if (unitColumnResult.rows.length === 0) {
      console.log('Adding "unit" column to services table...');
      
      // Add the unit column with default value
      const addUnitColumnQuery = `
        ALTER TABLE services 
        ADD COLUMN unit VARCHAR(50) DEFAULT 'kg' NOT NULL
      `;
      
      await client.query(addUnitColumnQuery);
      console.log('Column "unit" added successfully');
    } else {
      console.log('Column "unit" already exists in services table');
    }
    
    // Check if the estimatedTime column already exists
    const checkEstimatedTimeColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'services' 
      AND column_name = 'estimatedtime'
    `;
    
    const estimatedTimeColumnResult = await client.query(checkEstimatedTimeColumnQuery);
    
    if (estimatedTimeColumnResult.rows.length === 0) {
      console.log('Adding "estimatedTime" column to services table...');
      
      // Add the estimatedTime column with default value
      const addEstimatedTimeColumnQuery = `
        ALTER TABLE services 
        ADD COLUMN "estimatedTime" INTEGER DEFAULT 60 NOT NULL
      `;
      
      await client.query(addEstimatedTimeColumnQuery);
      console.log('Column "estimatedTime" added successfully');
    } else {
      console.log('Column "estimatedTime" already exists in services table');
    }
    
  } catch (error) {
    console.error('Error updating service table:', error);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

updateServiceTable(); 