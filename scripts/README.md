# Script Database untuk Aplikasi Laundry

Folder ini berisi script untuk membuat struktur database dan data dummy untuk aplikasi laundry.

## File yang ada

1. `seed.sql` - Berisi SQL untuk membuat tabel dan memasukkan data dummy
2. `seed.js` - Script JavaScript untuk menjalankan SQL pada database PostgreSQL

## Cara Penggunaan

### Prasyarat

- PostgreSQL telah diinstal di komputer/server Anda
- Node.js telah diinstal di komputer Anda
- Database PostgreSQL bernama `laundry_db` telah dibuat

### Mengubah Konfigurasi Database

Sebelum menjalankan script, pastikan untuk mengubah konfigurasi database di file `seed.js` sesuai dengan pengaturan PostgreSQL Anda:

```javascript
const dbConfig = {
  user: 'postgres', // Ganti dengan username PostgreSQL Anda
  host: 'localhost', // Ganti jika database di host lain
  database: 'laundry_db', // Nama database
  password: 'postgres', // Ganti dengan password PostgreSQL Anda
  port: 5432, // Port default PostgreSQL
};
```

### Instalasi Dependensi

Jalankan perintah berikut di folder root proyek untuk menginstal paket `pg` yang diperlukan:

```bash
npm install pg
```

### Menjalankan Script

Untuk menjalankan script dan mengisi database dengan struktur tabel dan data dummy, jalankan:

```bash
node scripts/seed.js
```

## Struktur Database

Script akan membuat struktur database sebagai berikut:

1. **users** - Tabel untuk menyimpan pengguna sistem (admin, staff, manager)
2. **customers** - Tabel untuk menyimpan data pelanggan laundry
3. **services** - Tabel untuk menyimpan jenis layanan laundry
4. **transactions** - Tabel untuk menyimpan transaksi laundry

Selain itu, script juga akan membuat sebuah view bernama `transaction_report` yang menggabungkan data dari beberapa tabel untuk kebutuhan laporan.

## Data Dummy

Script akan mengisi setiap tabel dengan data dummy:
- 4 pengguna (admin, manager, staff1, staff2)
- 10 pelanggan
- 10 jenis layanan
- 12 transaksi dengan berbagai status

## Catatan Penting

- Script ini akan menghapus dan membuat ulang tabel-tabel yang disebutkan di atas. **Pastikan Anda tidak menjalankannya pada database yang berisi data penting!**
- Password default untuk semua pengguna adalah `password123` (dalam bentuk hash bcrypt) 