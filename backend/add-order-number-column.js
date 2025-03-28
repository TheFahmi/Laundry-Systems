const { Client } = require('pg');
require('dotenv').config();

async function addOrderNumberColumn() {
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

    // Check if order_number column exists
    console.log('Checking if order_number column exists...');
    const checkResult = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'orders' AND column_name = 'order_number';
    `);

    if (checkResult.rowCount === 0) {
      console.log('order_number column does not exist. Adding it...');
      
      // Add the order_number column
      await client.query(`
        ALTER TABLE orders
        ADD COLUMN order_number VARCHAR(50);
      `);
      console.log('Added order_number column to orders table');
      
      // Generate unique order numbers for existing records
      console.log('Generating order numbers for existing orders...');
      
      // Get all orders without order numbers
      const ordersResult = await client.query(`
        SELECT id
        FROM orders
        WHERE order_number IS NULL;
      `);
      
      console.log(`Found ${ordersResult.rowCount} orders needing order numbers`);
      
      // Update each order with a unique order number
      let updatedCount = 0;
      for (const row of ordersResult.rows) {
        const orderId = row.id;
        
        // Generate order number: ORD-YYYYMMDD-XXXXX
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
        const orderNumber = `ORD-${year}${month}${day}-${random}`;
        
        // Update the order
        await client.query(`
          UPDATE orders
          SET order_number = $1
          WHERE id = $2;
        `, [orderNumber, orderId]);
        
        updatedCount++;
        console.log(`Updated order ${orderId} with order_number ${orderNumber}`);
      }
      
      console.log(`Updated ${updatedCount} orders with generated order numbers`);
      
      // Add default value and NOT NULL constraint
      console.log('Adding default constraint and setting NOT NULL...');
      await client.query(`
        ALTER TABLE orders
        ALTER COLUMN order_number SET DEFAULT 'ORD-00000000-00000',
        ALTER COLUMN order_number SET NOT NULL;
      `);
    } else {
      console.log('order_number column already exists');
      
      // Make sure it has a default and NOT NULL constraint
      console.log('Ensuring proper constraints on order_number column...');
      
      // Check for NULL values
      const nullOrdersResult = await client.query(`
        SELECT id
        FROM orders
        WHERE order_number IS NULL;
      `);
      
      if (nullOrdersResult.rowCount > 0) {
        console.log(`Found ${nullOrdersResult.rowCount} orders with NULL order_number`);
        
        // Update each order with a unique order number
        let updatedCount = 0;
        for (const row of nullOrdersResult.rows) {
          const orderId = row.id;
          
          // Generate order number: ORD-YYYYMMDD-XXXXX
          const date = new Date();
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
          const orderNumber = `ORD-${year}${month}${day}-${random}`;
          
          // Update the order
          await client.query(`
            UPDATE orders
            SET order_number = $1
            WHERE id = $2;
          `, [orderNumber, orderId]);
          
          updatedCount++;
          console.log(`Updated order ${orderId} with order_number ${orderNumber}`);
        }
        
        console.log(`Updated ${updatedCount} orders with generated order numbers`);
      }
      
      // Set default and NOT NULL constraints
      await client.query(`
        ALTER TABLE orders
        ALTER COLUMN order_number SET DEFAULT 'ORD-00000000-00000',
        ALTER COLUMN order_number SET NOT NULL;
      `);
    }
    
    console.log('Successfully ensured order_number column is properly set up');
  } catch (error) {
    console.error('Error adding/fixing order_number column:', error);
    console.error(error.stack);
  } finally {
    await client.end();
    console.log('Connection closed');
  }
}

addOrderNumberColumn(); 