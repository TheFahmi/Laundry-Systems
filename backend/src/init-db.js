require('dotenv').config({ path: __dirname + '/../.env' });
const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');

async function initDb() {
  console.log('Membaca konfigurasi database dari .env:');
  console.log('Host:', process.env.DB_HOST);
  console.log('Port:', process.env.DB_PORT);
  console.log('Username:', process.env.DB_USERNAME);
  console.log('Password:', process.env.DB_PASSWORD ? '********' : 'tidak ditemukan');
  console.log('Database:', process.env.DB_DATABASE);

  // Koneksi ke PostgreSQL untuk membuat database
  const adminClient = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD, // Gunakan password dari .env
    database: 'postgres', // Koneksi ke database default untuk membuat database baru
  });

  const dbName = process.env.DB_DATABASE || 'laundry_db';

  try {
    await adminClient.connect();
    console.log('Terhubung ke PostgreSQL');

    // Putuskan semua koneksi aktif ke database
    try {
      await adminClient.query(`
        SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = $1
        AND pid <> pg_backend_pid();
      `, [dbName]);
      console.log('Semua koneksi ke database berhasil diputus');
    } catch (err) {
      console.log('Tidak ada koneksi aktif untuk diputus:', err.message);
    }

    // Drop database jika sudah ada
    try {
      await adminClient.query(`DROP DATABASE IF EXISTS ${dbName}`);
      console.log(`Database ${dbName} dihapus jika sudah ada`);
    } catch (err) {
      console.error('Error saat menghapus database:', err.message);
    }

    // Buat database baru
    try {
      await adminClient.query(`CREATE DATABASE ${dbName}`);
      console.log(`Database ${dbName} berhasil dibuat`);
    } catch (err) {
      console.error('Error saat membuat database:', err.message);
      throw err;
    }
  } catch (error) {
    console.error('Error inisialisasi database:', error);
    console.error('Detail error:', error.message);
  } finally {
    await adminClient.end();
    console.log('Koneksi ke database postgres ditutup');
  }

  // Koneksi ke database yang baru dibuat untuk membuat tabel-tabel
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD, // Gunakan password dari .env
    database: dbName,
  });

  try {
    await client.connect();
    console.log(`Terhubung ke database ${dbName}`);

    // Buat tipe enum
    await client.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'orderstatus') THEN
          CREATE TYPE OrderStatus AS ENUM ('new', 'processing', 'washing', 'drying', 'folding', 'ready', 'delivered', 'cancelled');
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'paymentstatus') THEN
          CREATE TYPE PaymentStatus AS ENUM ('pending', 'completed', 'failed', 'refunded', 'cancelled');
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'paymentmethod') THEN
          CREATE TYPE PaymentMethod AS ENUM ('cash', 'credit_card', 'debit_card', 'transfer', 'ewallet', 'other');
        END IF;
      END $$;
    `);

    // Buat tabel customers
    await client.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        address TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
      );
    `);
    console.log('Tabel customers berhasil dibuat/diperbarui');

    // Buat tabel orders
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_number VARCHAR(255) UNIQUE NOT NULL,
        customer_id UUID REFERENCES customers(id),
        status OrderStatus DEFAULT 'new',
        total_amount DECIMAL(10, 2) DEFAULT 0,
        total_weight DECIMAL(10, 2) DEFAULT 0,
        notes TEXT,
        special_requirements TEXT,
        pickup_date TIMESTAMP,
        delivery_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
      );
    `);
    console.log('Tabel orders berhasil dibuat/diperbarui');

    // Buat tabel order_items
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID REFERENCES orders(id),
        service_name VARCHAR(255) NOT NULL,
        quantity INTEGER DEFAULT 1,
        unit_price DECIMAL(10, 2) NOT NULL,
        total_price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
      );
    `);
    console.log('Tabel order_items berhasil dibuat/diperbarui');

    // Buat tabel payments
    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        reference_number VARCHAR(255) UNIQUE NOT NULL,
        customer_id UUID REFERENCES customers(id),
        order_id UUID REFERENCES orders(id),
        amount DECIMAL(10, 2) NOT NULL,
        method PaymentMethod DEFAULT 'cash',
        status PaymentStatus DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
      );
    `);
    console.log('Tabel payments berhasil dibuat/diperbarui');

    try {
      // Gunakan transaksi untuk memastikan konsistensi data
      await client.query('BEGIN');

      // 1. Tambah customer
      const customerResult = await client.query(`
        INSERT INTO customers (name, email, phone, address, notes)
        VALUES 
          ('Budi Santoso', 'budi@example.com', '08123456789', 'Jl. Merdeka 123, Jakarta', 'Pelanggan reguler')
        RETURNING id;
      `);
      const customerId1 = customerResult.rows[0].id;
      console.log('Customer ID 1:', customerId1);
      
      const customerResult2 = await client.query(`
        INSERT INTO customers (name, email, phone, address, notes)
        VALUES 
          ('Siti Rahma', 'siti@example.com', '08987654321', 'Jl. Damai 45, Bandung', 'Pelanggan baru')
        RETURNING id;
      `);
      const customerId2 = customerResult2.rows[0].id;
      console.log('Customer ID 2:', customerId2);
      
      const customerResult3 = await client.query(`
        INSERT INTO customers (name, email, phone, address, notes)
        VALUES 
          ('Ahmad Ridwan', 'ahmad@example.com', '08765432109', 'Jl. Melati 78, Surabaya', 'Pelanggan premium')
        RETURNING id;
      `);
      const customerId3 = customerResult3.rows[0].id;
      console.log('Customer ID 3:', customerId3);
      
      const customerResult4 = await client.query(`
        INSERT INTO customers (name, email, phone, address, notes)
        VALUES 
          ('Dewi Kartika', 'dewi@example.com', '08123789456', 'Jl. Anggrek 23, Yogyakarta', 'Alergi pewangi bunga')
        RETURNING id;
      `);
      const customerId4 = customerResult4.rows[0].id;
      console.log('Customer ID 4:', customerId4);
      
      const customerResult5 = await client.query(`
        INSERT INTO customers (name, email, phone, address, notes)
        VALUES 
          ('Rudi Hermawan', 'rudi@example.com', '08567891234', 'Jl. Kenanga 56, Semarang', 'Pakaian khusus dijemur di tempat teduh')
        RETURNING id;
      `);
      const customerId5 = customerResult5.rows[0].id;
      console.log('Customer ID 5:', customerId5);
      
      console.log('Data customers berhasil ditambahkan');

      // 2. Tambah orders
      // Order 1
      const orderResult1 = await client.query(`
        INSERT INTO orders (order_number, customer_id, status, total_amount, total_weight, notes, pickup_date, delivery_date)
        VALUES 
          ('ORD-0000001', $1, 'processing', 75000, 3.5, 'Pakaian warna putih dipisah', NOW(), NOW() + INTERVAL '2 days')
        RETURNING id;
      `, [customerId1]);
      const orderId1 = orderResult1.rows[0].id;
      console.log('Order ID 1:', orderId1);
      
      // Order 2
      const orderResult2 = await client.query(`
        INSERT INTO orders (order_number, customer_id, status, total_amount, total_weight, notes, pickup_date, delivery_date)
        VALUES 
          ('ORD-0000002', $1, 'washing', 120000, 5.0, 'Perlu diambil sebelum jam 5 sore', NOW() - INTERVAL '1 day', NOW() + INTERVAL '1 day')
        RETURNING id;
      `, [customerId2]);
      const orderId2 = orderResult2.rows[0].id;
      console.log('Order ID 2:', orderId2);
      
      // Order 3
      const orderResult3 = await client.query(`
        INSERT INTO orders (order_number, customer_id, status, total_amount, total_weight, notes, pickup_date, delivery_date)
        VALUES 
          ('ORD-0000003', $1, 'folding', 95000, 4.0, 'Pakaian bayi, gunakan deterjen khusus', NOW() - INTERVAL '2 days', NOW() + INTERVAL '12 hours')
        RETURNING id;
      `, [customerId3]);
      const orderId3 = orderResult3.rows[0].id;
      console.log('Order ID 3:', orderId3);
      
      // Order 4
      const orderResult4 = await client.query(`
        INSERT INTO orders (order_number, customer_id, status, total_amount, total_weight, notes, pickup_date, delivery_date)
        VALUES 
          ('ORD-0000004', $1, 'ready', 145000, 6.5, 'Layanan express', NOW() - INTERVAL '3 days', NOW())
        RETURNING id;
      `, [customerId4]);
      const orderId4 = orderResult4.rows[0].id;
      console.log('Order ID 4:', orderId4);
      
      // Order 5
      const orderResult5 = await client.query(`
        INSERT INTO orders (order_number, customer_id, status, total_amount, total_weight, notes, pickup_date, delivery_date)
        VALUES 
          ('ORD-0000005', $1, 'delivered', 80000, 3.0, 'Layanan regular', NOW() - INTERVAL '5 days', NOW() - INTERVAL '2 days')
        RETURNING id;
      `, [customerId5]);
      const orderId5 = orderResult5.rows[0].id;
      console.log('Order ID 5:', orderId5);
      
      // Order 6 (customer yang sama dengan order lain)
      const orderResult6 = await client.query(`
        INSERT INTO orders (order_number, customer_id, status, total_amount, total_weight, notes, pickup_date, delivery_date)
        VALUES 
          ('ORD-0000006', $1, 'new', 55000, 2.5, 'Perlu diambil besok pagi', NOW(), NOW() + INTERVAL '3 days')
        RETURNING id;
      `, [customerId1]);
      const orderId6 = orderResult6.rows[0].id;
      console.log('Order ID 6:', orderId6);
      
      console.log('Data orders berhasil ditambahkan');

      // 3. Tambah order items
      // Order Items untuk Order 1
      await client.query(`
        INSERT INTO order_items (order_id, service_name, quantity, unit_price, total_price)
        VALUES 
          ($1, 'Cuci Kering Regular', 3.5, 15000, 52500),
          ($1, 'Setrika', 3.5, 8000, 28000);
      `, [orderId1]);
      
      // Order Items untuk Order 2
      await client.query(`
        INSERT INTO order_items (order_id, service_name, quantity, unit_price, total_price)
        VALUES 
          ($1, 'Cuci Kering Premium', 5.0, 18000, 90000),
          ($1, 'Setrika', 5.0, 8000, 40000),
          ($1, 'Parfum Premium', 1, 10000, 10000);
      `, [orderId2]);
      
      // Order Items untuk Order 3
      await client.query(`
        INSERT INTO order_items (order_id, service_name, quantity, unit_price, total_price)
        VALUES 
          ($1, 'Cuci Kering Baby Clothes', 4.0, 20000, 80000),
          ($1, 'Setrika Lembut', 4.0, 10000, 40000);
      `, [orderId3]);
      
      // Order Items untuk Order 4
      await client.query(`
        INSERT INTO order_items (order_id, service_name, quantity, unit_price, total_price)
        VALUES 
          ($1, 'Cuci Kering Express', 6.5, 25000, 162500),
          ($1, 'Setrika Express', 6.5, 12000, 78000),
          ($1, 'Dry Cleaning (Jas)', 1, 50000, 50000);
      `, [orderId4]);
      
      // Order Items untuk Order 5
      await client.query(`
        INSERT INTO order_items (order_id, service_name, quantity, unit_price, total_price)
        VALUES 
          ($1, 'Cuci Kering Regular', 3.0, 15000, 45000),
          ($1, 'Setrika', 3.0, 8000, 24000),
          ($1, 'Lipat Rapi', 3.0, 5000, 15000);
      `, [orderId5]);
      
      // Order Items untuk Order 6
      await client.query(`
        INSERT INTO order_items (order_id, service_name, quantity, unit_price, total_price)
        VALUES 
          ($1, 'Cuci Kering Regular', 2.5, 15000, 37500),
          ($1, 'Setrika', 2.5, 8000, 20000);
      `, [orderId6]);
      
      console.log('Data order_items berhasil ditambahkan');

      // 4. Tambah payments
      // Payment untuk Order 1
      await client.query(`
        INSERT INTO payments (reference_number, customer_id, order_id, amount, method, status, notes)
        VALUES 
          ('PAY-0000001', $1, $2, 75000, 'cash', 'completed', 'Pembayaran lunas');
      `, [customerId1, orderId1]);
      
      // Payment untuk Order 2
      await client.query(`
        INSERT INTO payments (reference_number, customer_id, order_id, amount, method, status, notes)
        VALUES 
          ('PAY-0000002', $1, $2, 60000, 'credit_card', 'completed', 'Pembayaran uang muka'),
          ('PAY-0000003', $1, $2, 60000, 'transfer', 'pending', 'Pembayaran sisa pelunasan');
      `, [customerId2, orderId2]);
      
      // Payment untuk Order 3
      await client.query(`
        INSERT INTO payments (reference_number, customer_id, order_id, amount, method, status, notes)
        VALUES 
          ('PAY-0000004', $1, $2, 95000, 'ewallet', 'completed', 'Pembayaran via OVO');
      `, [customerId3, orderId3]);
      
      // Payment untuk Order 4
      await client.query(`
        INSERT INTO payments (reference_number, customer_id, order_id, amount, method, status, notes)
        VALUES 
          ('PAY-0000005', $1, $2, 145000, 'debit_card', 'completed', 'Pembayaran via EDC BCA');
      `, [customerId4, orderId4]);
      
      // Payment untuk Order 5
      await client.query(`
        INSERT INTO payments (reference_number, customer_id, order_id, amount, method, status, notes)
        VALUES 
          ('PAY-0000006', $1, $2, 80000, 'cash', 'completed', 'Pembayaran saat pengambilan');
      `, [customerId5, orderId5]);
      
      // Payment untuk Order 6 - belum lunas
      await client.query(`
        INSERT INTO payments (reference_number, customer_id, order_id, amount, method, status, notes)
        VALUES 
          ('PAY-0000007', $1, $2, 25000, 'cash', 'completed', 'Pembayaran uang muka');
      `, [customerId1, orderId6]);
      
      console.log('Data payments berhasil ditambahkan');

      await client.query('COMMIT');
      console.log('Semua data contoh berhasil ditambahkan');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error saat menambahkan data contoh:', error);
      console.error('Detail error:', error.message);
    }

    console.log('Database berhasil diinisialisasi');
  } catch (error) {
    console.error('Terjadi error saat membuat tabel:', error);
    console.error('Detail error:', error.message);
  } finally {
    await client.end();
    console.log(`Koneksi ke database ${dbName} ditutup`);
  }
}

initDb()
  .then(() => console.log('Inisialisasi database selesai'))
  .catch(err => console.error('Terjadi error saat inisialisasi database:', err)); 