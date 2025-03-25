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