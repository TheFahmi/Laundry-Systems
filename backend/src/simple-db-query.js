const { Client } = require('pg');
require('dotenv').config();

// Create a client
const client = new Client({
  user: process.env.DB_USERNAME,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Connect to the database
client.connect()
  .then(() => {
    console.log('Connected to database');
    
    // Check if the orders table exists and has data
    return client.query('SELECT COUNT(*) FROM orders');
  })
  .then(res => {
    console.log('Total orders:', res.rows[0].count);
    
    // Close the connection
    return client.end();
  })
  .then(() => {
    console.log('Database connection closed');
  })
  .catch(err => {
    console.error('Database error:', err);
    client.end();
  }); 