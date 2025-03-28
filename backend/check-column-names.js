const { Client } = require('pg');
require('dotenv').config();

async function checkColumnNames() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    database: process.env.DB_DATABASE,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL database');

    // Check the orders table structure using pg_attribute (more direct query)
    console.log('Checking orders table column details...');
    const result = await client.query(`
      SELECT a.attname AS column_name, 
             format_type(a.atttypid, a.atttypmod) AS data_type,
             a.attnotnull AS not_null,
             (SELECT pg_get_expr(d.adbin, d.adrelid) FROM pg_attrdef d 
              WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum) AS default_value
      FROM pg_attribute a
      JOIN pg_class c ON a.attrelid = c.oid
      JOIN pg_namespace n ON c.relnamespace = n.oid
      WHERE c.relname = 'orders'
        AND a.attnum > 0
        AND NOT a.attisdropped
      ORDER BY a.attnum;
    `);

    console.log('Column details in orders table:');
    result.rows.forEach(row => {
      console.log(`- ${row.column_name} (${row.data_type}), Not Null: ${row.not_null}, Default: ${row.default_value || 'none'}`);
    });

    // Check specifically for order_number column
    const orderNumberResult = await client.query(`
      SELECT a.attname AS column_name, 
             format_type(a.atttypid, a.atttypmod) AS data_type,
             a.attnotnull AS not_null,
             (SELECT pg_get_expr(d.adbin, d.adrelid) FROM pg_attrdef d 
              WHERE d.adrelid = a.attrelid AND d.adnum = a.attnum) AS default_value
      FROM pg_attribute a
      JOIN pg_class c ON a.attrelid = c.oid
      JOIN pg_namespace n ON c.relnamespace = n.oid
      WHERE c.relname = 'orders'
        AND a.attname = 'order_number';
    `);

    if (orderNumberResult.rowCount > 0) {
      console.log('\nOrder number column details:');
      console.log(orderNumberResult.rows[0]);
    } else {
      console.log('\nOrder number column not found');
    }

    // Check for null values in order_number
    const nullResult = await client.query(`
      SELECT COUNT(*) AS null_count 
      FROM orders 
      WHERE order_number IS NULL;
    `);

    console.log(`\nFound ${nullResult.rows[0].null_count} orders with NULL order_number`);

  } catch (error) {
    console.error('Error checking column names:', error);
    console.error(error.stack);
  } finally {
    await client.end();
    console.log('Connection closed');
  }
}

checkColumnNames(); 