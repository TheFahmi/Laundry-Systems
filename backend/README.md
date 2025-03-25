# Sistem Manajemen Laundry - Backend

Backend API RESTful untuk Sistem Manajemen Laundry komprehensif, dibangun dengan NestJS dan PostgreSQL.

## Fitur Utama

- **Manajemen Pelanggan**: Pendaftaran, profil, riwayat pesanan, dan loyalitas
- **Pemrosesan Pesanan**: Manajemen siklus hidup pesanan dari pembuatan hingga pengiriman
- **Katalog Layanan**: Konfigurasi layanan, harga, dan model penetapan harga
- **Kontrol Inventaris**: Pelacakan stok dan pemantauan persediaan
- **Pengelolaan Karyawan**: Administrasi pengguna, peran, dan izin
- **Pemrosesan Pembayaran**: Pencatatan transaksi dan rekonsiliasi
- **Analitik**: Pelaporan bisnis dan metrik KPI
- **Keamanan**: Autentikasi JWT dan otorisasi berbasis peran

## Teknologi

- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Validasi**: class-validator
- **Dokumentasi API**: Swagger/OpenAPI
- **Autentikasi**: JWT (JSON Web Tokens)

## Struktur Database

Database terdiri dari beberapa tabel utama:

- **customers**: Data pelanggan dan informasi kontak
- **orders**: Pesanan layanan dengan pelacakan status
- **services**: Jenis layanan yang tersedia dengan model penetapan harga
- **order_items**: Item yang terkait dengan pesanan
- **inventory**: Pelacakan persediaan dan tingkat stok
- **employees**: Informasi staf dan penugasan peran
- **payments**: Catatan transaksi dan metode pembayaran
- **expenses**: Pelacakan biaya bisnis dan kategorisasi

## Mulai

### Prasyarat

- Node.js (versi 16.x atau lebih tinggi)
- npm atau yarn
- PostgreSQL (versi 12 atau lebih tinggi)

### Instalasi

1. Clone repositori:
   ```bash
   git clone https://github.com/username/laundry-management-system.git
   cd laundry-management-system/backend
   ```

2. Instal dependensi:
   ```bash
   npm install
   # atau
   yarn install
   ```

3. Buat file `.env` dengan konten berikut (sesuaikan dengan pengaturan database Anda):
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=postgres
   DB_DATABASE=laundry_db
   NODE_ENV=development
   JWT_SECRET=laundry_app_secret_key
   PORT=3000
   ```

4. Buat database PostgreSQL dengan nama yang dikonfigurasi dalam `.env`

5. Jalankan aplikasi:
   ```bash
   npm run start:dev
   # atau
   yarn start:dev
   ```

6. Server API akan berjalan di http://localhost:3000

### Dokumentasi API

Dokumentasi Swagger tersedia di http://localhost:3000/api/docs ketika server berjalan.

## Struktur Proyek

```
backend/
├── src/                    # Kode sumber
│   ├── controllers/        # Pengendali API untuk menangani permintaan
│   ├── services/           # Logika bisnis
│   ├── models/             # Entitas dan skema database
│   ├── dto/                # Objek transfer data
│   ├── middleware/         # Middleware kustom
│   ├── main.ts             # Titik masuk aplikasi
│   └── app.module.ts       # Modul utama aplikasi
├── .env                    # Variabel lingkungan
├── package.json            # Dependensi dan skrip
└── README.md               # Dokumentasi proyek
```

## Dokumentasi API

API diorganisir mengikuti prinsip RESTful dan mencakup endpoint berikut:

### Customers

- `GET /customers` - Mendapatkan daftar pelanggan
- `GET /customers/:id` - Mendapatkan detail pelanggan
- `POST /customers` - Buat pelanggan baru
- `PUT /customers/:id` - Perbarui pelanggan
- `DELETE /customers/:id` - Hapus pelanggan

### Orders

- `GET /orders` - Mendapatkan daftar pesanan
- `GET /orders/:id` - Mendapatkan detail pesanan
- `POST /orders` - Buat pesanan baru
- `PUT /orders/:id` - Perbarui pesanan
- `PUT /orders/:id/status` - Perbarui status pesanan
- `DELETE /orders/:id` - Batalkan pesanan

### Services

- `GET /services` - Mendapatkan daftar layanan
- `GET /services/:id` - Mendapatkan detail layanan
- `POST /services` - Menambahkan layanan baru
- `PUT /services/:id` - Memperbarui layanan
- `DELETE /services/:id` - Menonaktifkan layanan

Dokumentasi komprehensif tersedia melalui antarmuka Swagger.

## Pengujian

```bash
# menjalankan unit test
npm run test

# menjalankan test integrasi
npm run test:e2e
```

## Lisensi

[ISC](LICENSE) 