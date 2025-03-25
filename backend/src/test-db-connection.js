const { Client } = require('pg');

// Explicit connection details from .env
const client = new Client({
  user: 'pterodactyl',
  host: 'dono-03.danbot.host',
  database: 'laundry_db',
  password: 'J1F7ZP2WBYWHCBRX',
  port: 2127,
});

console.log('Attempting to connect to database at dono-03.danbot.host:2127...');

// Set a connection timeout
const timeout = setTimeout(() => {
  console.error('Connection timeout after 10 seconds');
  client.end();
  process.exit(1);
}, 10000);

// Connect to the database
client.connect()
  .then(() => {
    clearTimeout(timeout);
    console.log('Successfully connected to the database!');
    
    // Check if orders table exists
    return client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'orders'
      )
    `);
  })
  .then(res => {
    console.log('Orders table exists:', res.rows[0].exists);
    
    if (res.rows[0].exists) {
      // Try to get order count
      return client.query('SELECT COUNT(*) FROM orders')
        .then(countRes => {
          console.log('Total orders in database:', countRes.rows[0].count);
          
          if (parseInt(countRes.rows[0].count) > 0) {
            // Get a sample order
            return client.query('SELECT id, order_number, status FROM orders LIMIT 1');
          }
          return Promise.resolve({ rows: [] });
        })
        .then(sampleRes => {
          if (sampleRes.rows.length > 0) {
            console.log('Sample order:', sampleRes.rows[0]);
          } else {
            console.log('No orders found in the database');
          }
        });
    }
    return Promise.resolve();
  })
  .then(() => {
    console.log('Database tests completed');
    return client.end();
  })
  .then(() => {
    console.log('Database connection closed');
  })
  .catch(err => {
    clearTimeout(timeout);
    console.error('Database error:', err);
    client.end();
  }); 