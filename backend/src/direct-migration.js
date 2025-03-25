const { Client } = require('pg');
require('dotenv').config();

async function runMigration() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'laundry_db',
  });

  try {
    await client.connect();
    console.log('Terhubung ke database');

    // Langkah 1: Mengubah semua tabel untuk menggunakan VARCHAR terlebih dahulu
    console.log('Mengubah tipe data semua tabel...');
    
    // Mendisable foreign key constraint sementara
    await client.query('SET CONSTRAINTS ALL DEFERRED');
    
    // Ubah tipe id di semua tabel ke VARCHAR
    await client.query('ALTER TABLE customers ALTER COLUMN id TYPE VARCHAR(255)');
    await client.query('ALTER TABLE orders ALTER COLUMN id TYPE VARCHAR(255)');
    await client.query('ALTER TABLE payments ALTER COLUMN id TYPE VARCHAR(255)');
    
    // Langkah 2: Tambah kolom ID serial di semua tabel
    console.log('Menambahkan kolom ID serial...');
    await client.query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS "customerId" SERIAL');
    await client.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS "orderId" SERIAL');
    await client.query('ALTER TABLE payments ADD COLUMN IF NOT EXISTS "paymentId" SERIAL');

    // Langkah 3: Update customers
    console.log('Memperbarui tabel customers...');
    const customerResult = await client.query(`SELECT "customerId", id FROM customers`);
    for (const customer of customerResult.rows) {
      const newId = `CUST-${String(customer.customerId).padStart(7, '0')}`;
      await client.query(`
        UPDATE customers SET id = $1 WHERE "customerId" = $2
      `, [newId, customer.customerId]);
      console.log(`Customer ${customer.customerId} diupdate ke ${newId}`);
    }

    // Langkah 4: Update orders
    console.log('Memperbarui tabel orders...');
    const orderResult = await client.query(`SELECT "orderId", id, customer_id FROM orders`);
    for (const order of orderResult.rows) {
      const newId = `ORD-${String(order.orderId).padStart(7, '0')}`;
      await client.query(`
        UPDATE orders SET id = $1 WHERE "orderId" = $2
      `, [newId, order.orderId]);
      console.log(`Order ${order.orderId} diupdate ke ${newId}`);
    }

    // Langkah 5: Update customer_id di orders
    console.log('Memperbarui referensi customer_id di orders...');
    const customerMap = {};
    const customersData = await client.query(`SELECT "customerId", id FROM customers`);
    for (const customer of customersData.rows) {
      customerMap[customer.customerId] = customer.id;
    }
    
    const ordersForUpdate = await client.query(`SELECT "orderId", customer_id FROM orders`);
    for (const order of ordersForUpdate.rows) {
      if (order.customer_id && customerMap[order.customer_id]) {
        await client.query(`
          UPDATE orders SET customer_id = $1 WHERE "orderId" = $2
        `, [customerMap[order.customer_id], order.orderId]);
        console.log(`Updated customer_id reference in order ${order.orderId}`);
      }
    }

    // Langkah 6: Update payments
    console.log('Memperbarui tabel payments...');
    const paymentQuery = `
      SELECT p."paymentId", p.id, p.created_at, o.id as order_id, c.id as customer_id
      FROM payments p
      LEFT JOIN orders o ON p.order_id = o.id
      LEFT JOIN customers c ON o.customer_id = c.id
    `;
    const paymentResult = await client.query(paymentQuery);
    for (const payment of paymentResult.rows) {
      const date = new Date(payment.created_at);
      const dateStr = date.toISOString().slice(2, 10).replace(/-/g, '');
      
      let customerIdStr = 'UNKN';
      if (payment.customer_id && payment.customer_id.startsWith('CUST-')) {
        customerIdStr = payment.customer_id.replace('CUST-', '');
      }
      
      const newId = `TRX-${dateStr}-${customerIdStr}-${String(payment.paymentId).padStart(10, '0')}`;
      
      await client.query(`
        UPDATE payments SET id = $1 WHERE "paymentId" = $2
      `, [newId, payment.paymentId]);
      console.log(`Payment ${payment.paymentId} diupdate ke ${newId}`);
    }

    // Reset foreign key constraint
    await client.query('SET CONSTRAINTS ALL IMMEDIATE');

    console.log('Migrasi berhasil dijalankan');
  } catch (error) {
    console.error('Terjadi error saat menjalankan migrasi:', error);
  } finally {
    await client.end();
    console.log('Koneksi database ditutup');
  }
}

runMigration()
  .then(() => console.log('Proses migrasi selesai'))
  .catch(error => console.error('Gagal menjalankan migrasi:', error)); 