const { Client } = require('pg');
require('dotenv').config();

async function fixRelations() {
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

    // Check if services table exists
    const servicesTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'services'
      );
    `);

    // If services table doesn't exist, create it
    if (!servicesTableCheck.rows[0].exists) {
      console.log('Services table does not exist. Creating it...');
      
      await client.query(`
        CREATE TABLE services (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          price DECIMAL(10,2) NOT NULL,
          category_id INTEGER,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      console.log('Services table created successfully.');
      
      // Insert some sample data
      await client.query(`
        INSERT INTO services (name, description, price) 
        VALUES 
          ('Cuci Reguler', 'Layanan cuci standar', 15000),
          ('Cuci Express', 'Layanan cuci cepat', 25000),
          ('Dry Cleaning', 'Layanan dry cleaning', 35000),
          ('Setrika', 'Layanan setrika', 10000);
      `);
      
      console.log('Sample service data inserted successfully.');
    } else {
      console.log('Services table already exists.');
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
    console.log('Disconnected from database');
  }
}

fixRelations().catch(console.error); 