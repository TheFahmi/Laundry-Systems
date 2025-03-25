const { Client } = require('pg');
require('dotenv').config({ path: __dirname + '/../.env' });
const { v4: uuidv4 } = require('uuid');

async function rollbackMigration() {
  console.log('Membaca konfigurasi database dari .env:');
  console.log('Host:', process.env.DB_HOST);
  console.log('Port:', process.env.DB_PORT);
  console.log('Username:', process.env.DB_USERNAME);
  console.log('Password:', process.env.DB_PASSWORD ? '********' : 'tidak ditemukan');
  console.log('Database:', process.env.DB_DATABASE);
  
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE || 'laundry_db',
  });

  try {
    await client.connect();
    console.log('Terhubung ke database');

    // Periksa apakah tabel-tabel dan kolom yang diperlukan ada
    console.log('Memeriksa struktur tabel...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('customers', 'orders', 'payments')
    `);
    
    const tables = tablesResult.rows.map(row => row.table_name);
    
    if (tables.length === 0) {
      console.log('Tidak ada tabel yang perlu diperbarui. Database sudah menggunakan UUID.');
      return;
    }

    // Memeriksa apakah kolom customerId, orderId, dan paymentId ada
    let hasCustomColumns = false;
    
    if (tables.includes('customers')) {
      const customerColumns = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'customers' 
        AND column_name = 'customerId'
      `);
      hasCustomColumns = hasCustomColumns || customerColumns.rows.length > 0;
    }
    
    if (tables.includes('orders')) {
      const orderColumns = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'orderId'
      `);
      hasCustomColumns = hasCustomColumns || orderColumns.rows.length > 0;
    }
    
    if (tables.includes('payments')) {
      const paymentColumns = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'payments' 
        AND column_name = 'paymentId'
      `);
      hasCustomColumns = hasCustomColumns || paymentColumns.rows.length > 0;
    }
    
    if (!hasCustomColumns) {
      console.log('Tidak ditemukan kolom ID kustom. Database sudah menggunakan UUID.');
      return;
    }

    // Menonaktifkan constraint foreign key sementara
    await client.query('SET CONSTRAINTS ALL DEFERRED');
    
    // Step 1: Membuat mapping dari ID lama ke ID baru (UUID)
    console.log('Mempersiapkan mapping ID untuk tabel customers...');
    const customerMap = {};
    const customers = await client.query('SELECT id, "customerId" FROM customers');
    for (const customer of customers.rows) {
      customerMap[customer.id] = uuidv4();
    }
    
    // Step 2: Membuat mapping untuk tabel orders
    console.log('Mempersiapkan mapping ID untuk tabel orders...');
    const orderMap = {};
    const orders = await client.query('SELECT id, "orderId" FROM orders');
    for (const order of orders.rows) {
      orderMap[order.id] = uuidv4();
    }
    
    // Step 3: Membuat mapping untuk tabel payments
    console.log('Mempersiapkan mapping ID untuk tabel payments...');
    const paymentMap = {};
    const payments = await client.query('SELECT id, "paymentId" FROM payments');
    for (const payment of payments.rows) {
      paymentMap[payment.id] = uuidv4();
    }
    
    // Step 4: Memperbarui ID di tabel payments (harus diperbarui terlebih dahulu karena memiliki foreign key ke orders)
    console.log('Memperbarui tabel payments...');
    for (const payment of payments.rows) {
      const newId = paymentMap[payment.id];
      await client.query('UPDATE payments SET id = $1 WHERE id = $2', [newId, payment.id]);
      console.log(`Payment ${payment.id} diubah menjadi ${newId}`);
    }
    
    // Step 5: Memperbarui order_id di tabel payments
    console.log('Memperbarui referensi order_id di tabel payments...');
    const paymentsWithOrderId = await client.query('SELECT id, order_id FROM payments');
    for (const payment of paymentsWithOrderId.rows) {
      if (payment.order_id && orderMap[payment.order_id]) {
        await client.query('UPDATE payments SET order_id = $1 WHERE id = $2', [orderMap[payment.order_id], payment.id]);
        console.log(`Referensi order_id di payment ${payment.id} diperbarui`);
      }
    }
    
    // Step 6: Memperbarui ID di tabel orders
    console.log('Memperbarui tabel orders...');
    for (const order of orders.rows) {
      const newId = orderMap[order.id];
      await client.query('UPDATE orders SET id = $1 WHERE id = $2', [newId, order.id]);
      console.log(`Order ${order.id} diubah menjadi ${newId}`);
    }
    
    // Step 7: Memperbarui customer_id di tabel orders
    console.log('Memperbarui referensi customer_id di tabel orders...');
    const ordersWithCustomerId = await client.query('SELECT id, customer_id FROM orders');
    for (const order of ordersWithCustomerId.rows) {
      if (order.customer_id && customerMap[order.customer_id]) {
        await client.query('UPDATE orders SET customer_id = $1 WHERE id = $2', [customerMap[order.customer_id], order.id]);
        console.log(`Referensi customer_id di order ${order.id} diperbarui`);
      }
    }
    
    // Step 8: Memperbarui ID di tabel customers
    console.log('Memperbarui tabel customers...');
    for (const customer of customers.rows) {
      const newId = customerMap[customer.id];
      await client.query('UPDATE customers SET id = $1 WHERE id = $2', [newId, customer.id]);
      console.log(`Customer ${customer.id} diubah menjadi ${newId}`);
    }
    
    // Step 9: Mengubah tipe data kolom ID menjadi uuid
    console.log('Mengubah tipe data kolom ID menjadi UUID...');
    await client.query('ALTER TABLE customers ALTER COLUMN id TYPE uuid USING id::uuid');
    await client.query('ALTER TABLE orders ALTER COLUMN id TYPE uuid USING id::uuid');
    await client.query('ALTER TABLE payments ALTER COLUMN id TYPE uuid USING id::uuid');
    
    // Step 10: Menghapus kolom customerId, orderId, dan paymentId
    console.log('Menghapus kolom ID tambahan...');
    await client.query('ALTER TABLE customers DROP COLUMN IF EXISTS "customerId"');
    await client.query('ALTER TABLE orders DROP COLUMN IF EXISTS "orderId"');
    await client.query('ALTER TABLE payments DROP COLUMN IF EXISTS "paymentId"');
    
    // Mengaktifkan kembali constraint foreign key
    await client.query('SET CONSTRAINTS ALL IMMEDIATE');
    
    console.log('Rollback migrasi berhasil selesai');
  } catch (error) {
    console.error('Terjadi error saat melakukan rollback migrasi:', error);
    console.error('Detail error:', error.message);
  } finally {
    await client.end();
    console.log('Koneksi database ditutup');
  }
}

rollbackMigration()
  .then(() => console.log('Proses rollback migrasi selesai'))
  .catch(error => console.error('Gagal melakukan rollback migrasi:', error)); 