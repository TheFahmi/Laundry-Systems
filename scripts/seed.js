const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Konfigurasi database 
// Pastikan untuk mengubah parameter sesuai dengan konfigurasi database Anda
const dbConfig = {
  user: 'postgres', 
  host: 'localhost',
  database: 'laundry_db',
  password: '@Gatauu123',
  port: 5432,
};

async function seedDatabase() {
  const pool = new Pool(dbConfig);
  let client;

  try {
    // Baca file SQL
    const sqlFilePath = path.join(__dirname, 'seed.sql');
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');

    // Connect ke database
    client = await pool.connect();
    console.log('Terhubung ke database PostgreSQL');

    // Jalankan script SQL
    console.log('Menjalankan script SQL untuk membuat tabel dan data dummy...');
    await client.query(sqlScript);
    
    console.log('Database berhasil di-seed! Tabel dan data dummy telah dibuat.');
  } catch (err) {
    console.error('Terjadi kesalahan:', err);
  } finally {
    // Tutup koneksi
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

// Jalankan fungsi seed
seedDatabase(); 