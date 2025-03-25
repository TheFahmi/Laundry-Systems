const { Client } = require('pg');
require('dotenv').config();

async function fixServiceCategory() {
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

    // Check if service_categories table exists
    const serviceCategoriesTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'service_categories'
      );
    `);

    // If service_categories table doesn't exist, create it
    if (!serviceCategoriesTableCheck.rows[0].exists) {
      console.log('Service categories table does not exist. Creating it...');
      
      await client.query(`
        CREATE TABLE service_categories (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      console.log('Service categories table created successfully.');
      
      // Insert some sample data
      await client.query(`
        INSERT INTO service_categories (name, description) 
        VALUES 
          ('Regular', 'Layanan cuci reguler'),
          ('Express', 'Layanan cuci express'),
          ('Premium', 'Layanan cuci premium');
      `);
      
      console.log('Sample service category data inserted successfully.');
    } else {
      console.log('Service categories table already exists.');
    }
    
    // Update services table to add foreign key reference if needed
    await client.query(`
      ALTER TABLE services 
      ADD CONSTRAINT fk_service_category 
      FOREIGN KEY (category_id) 
      REFERENCES service_categories(id)
      ON DELETE SET NULL
      ON UPDATE CASCADE;
    `).catch(err => {
      // Constraint might already exist, which is fine
      if (err.code !== '42P16') { // 42P16 is the error code for "constraint already exists"
        console.error('Error adding foreign key constraint:', err);
      } else {
        console.log('Foreign key constraint already exists.');
      }
    });

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
    console.log('Disconnected from database');
  }
}

fixServiceCategory().catch(console.error); 