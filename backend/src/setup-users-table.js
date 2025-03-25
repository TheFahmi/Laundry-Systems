const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

async function setupUsersTable() {
  const client = new Client({
    user: process.env.DB_USERNAME,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  try {
    await client.connect();
    console.log('Connected to database successfully');

    // Check if users table exists
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'users'
      )
    `);
    
    // Create users table if it doesn't exist
    if (!tableExists.rows[0].exists) {
      console.log('Users table does not exist. Creating it...');
      
      await client.query(`
        CREATE TABLE users (
          id VARCHAR(36) PRIMARY KEY,
          username VARCHAR(50) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          email VARCHAR(100) NOT NULL UNIQUE,
          name VARCHAR(100) NOT NULL,
          role VARCHAR(20) NOT NULL DEFAULT 'staff',
          is_active BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      console.log('Users table created successfully');
    } else {
      console.log('Users table already exists');
    }

    // Check if there are any users
    const { rows: userCount } = await client.query('SELECT COUNT(*) FROM users');
    
    // Add default users if none exist
    if (parseInt(userCount[0].count) === 0) {
      console.log('No users found. Adding default users...');
      
      // Hash passwords for security
      const adminPasswordHash = await bcrypt.hash('admin123', 10);
      const staffPasswordHash = await bcrypt.hash('staff123', 10);
      
      // Insert admin user
      await client.query(`
        INSERT INTO users (id, username, password, email, name, role, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        uuidv4(), 
        'admin', 
        adminPasswordHash, 
        'admin@example.com', 
        'Admin User', 
        'admin', 
        true, 
        new Date(), 
        new Date()
      ]);
      
      // Insert staff user
      await client.query(`
        INSERT INTO users (id, username, password, email, name, role, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        uuidv4(), 
        'staff', 
        staffPasswordHash, 
        'staff@example.com', 
        'Staff User', 
        'staff', 
        true, 
        new Date(), 
        new Date()
      ]);
      
      console.log('Default users added successfully');
    } else {
      console.log(`Found ${userCount[0].count} users in the database`);
    }

    // Verify users
    const { rows: users } = await client.query(`
      SELECT id, username, email, name, role FROM users
    `);
    
    console.log('Users in the database:');
    users.forEach(user => {
      console.log(`- ${user.username} (${user.role}): ${user.email}`);
    });

    console.log('Users table setup completed successfully');
  } catch (error) {
    console.error('Error setting up users table:', error);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

setupUsersTable(); 