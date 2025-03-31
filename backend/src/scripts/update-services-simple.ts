import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

async function updateServices() {
  try {
    await client.connect();
    console.log('Connected to database');

    // Delete order items first (they reference services)
    console.log('Deleting order items...');
    await client.query('DELETE FROM order_items');

    // Update categories
    console.log('Updating service categories...');
    await client.query(`
      UPDATE service_categories 
      SET name = 'Cuci', description = 'Layanan cuci pakaian'
      WHERE name = 'Wash & Fold'
    `);

    await client.query(`
      UPDATE service_categories 
      SET name = 'Setrika', description = 'Layanan setrika pakaian'
      WHERE name = 'Dry Cleaning'
    `);

    await client.query(`
      UPDATE service_categories 
      SET name = 'Premium', description = 'Layanan premium dan express'
      WHERE name = 'Express Service'
    `);

    // Delete existing services
    console.log('Deleting existing services...');
    await client.query('DELETE FROM services');

    // Insert new services
    console.log('Inserting new services...');
    await client.query(`
      INSERT INTO services (name, description, price, pricemodel, processing_time_hours, category, is_active)
      VALUES 
        ('Cuci Reguler', 'Layanan cuci standar dengan pengeringan', 7000, 'per_kg', 24, 'Cuci', true),
        ('Cuci Express', 'Layanan cuci cepat, selesai dalam 6 jam', 12000, 'per_kg', 6, 'Premium', true),
        ('Setrika', 'Layanan setrika untuk pakaian', 5000, 'per_kg', 24, 'Setrika', true),
        ('Cuci Setrika', 'Layanan cuci dan setrika lengkap', 10000, 'per_kg', 48, 'Cuci', true),
        ('Dry Cleaning', 'Layanan cuci kering untuk pakaian khusus', 20000, 'per_piece', 72, 'Premium', true),
        ('Cuci Sepatu', 'Layanan cuci khusus untuk sepatu', 35000, 'per_piece', 24, 'Premium', true),
        ('Cuci Tas', 'Layanan cuci khusus untuk tas', 50000, 'per_piece', 48, 'Premium', true),
        ('Cuci Karpet', 'Layanan cuci untuk karpet dan permadani', 25000, 'per_kg', 72, 'Premium', true),
        ('Cuci Gordyn', 'Layanan cuci untuk gordyn dan vitrage', 15000, 'per_kg', 72, 'Premium', true),
        ('Cuci Bed Cover', 'Layanan cuci untuk bed cover dan sprei', 12000, 'per_kg', 48, 'Cuci', true)
    `);

    console.log('Services updated successfully!');
  } catch (error) {
    console.error('Error updating services:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

updateServices(); 