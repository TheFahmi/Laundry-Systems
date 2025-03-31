import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

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

    const sqlPath = path.join(__dirname, 'update-services.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Running SQL script...');
    await client.query(sql);
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