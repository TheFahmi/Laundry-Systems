# Sistem Manajemen Laundry

Aplikasi manajemen laundry fullstack komprehensif dengan backend NestJS, database PostgreSQL, dan frontend Next.js.

## Ikhtisar Sistem

Sistem Manajemen Laundry adalah solusi end-to-end untuk bisnis laundry yang dirancang untuk mengotomatisasi dan mengoptimalkan operasi sehari-hari, memantau kinerja bisnis, dan meningkatkan pengalaman pelanggan. Sistem ini terdiri dari panel admin untuk manajemen internal dan portal pelanggan untuk pengalaman pengguna yang lancar.

## Fitur Utama

### Panel Admin
- Dashboard analitik dengan metrik bisnis utama
- Manajemen pelanggan (daftar, profil, histori)
- Pengolahan pesanan dan pelacakan status
- Katalog layanan dan manajemen harga
- Pengelolaan karyawan dan izin
- Pengendalian inventaris
- Pemrosesan pembayaran dan akuntansi
- Laporan dan analitik

### Portal Pelanggan
- Pendaftaran dan autentikasi
- Pembuatan dan pelacakan pesanan
- Notifikasi dan pembaruan status pesanan
- Manajemen profil
- Riwayat pesanan dan opsi pesanan ulang
- Opsi pembayaran terintegrasi

## Arsitektur

Proyek ini menggunakan arsitektur tiga tingkat:

1. **Backend**: API RESTful yang dibangun dengan NestJS
2. **Database**: PostgreSQL untuk penyimpanan data persisten
3. **Frontend**: Aplikasi Next.js dengan Material UI untuk antarmuka yang responsif

## Direktori Proyek

```
laundry-management-system/
├── backend/             # API NestJS
├── frontend/            # Aplikasi Next.js
└── README.md            # Dokumentasi proyek
```

## Teknologi yang Digunakan

### Backend
- NestJS (Node.js framework)
- TypeScript
- PostgreSQL
- TypeORM
- JWT untuk autentikasi
- Swagger untuk dokumentasi API

### Frontend
- Next.js
- React
- Material UI
- Zustand untuk manajemen state
- Next-Auth untuk autentikasi
- TanStack Table untuk manajemen tabel

## Instalasi dan Konfigurasi

### Prasyarat
- Node.js (v16.x atau lebih tinggi)
- npm atau yarn
- PostgreSQL (v12 atau lebih tinggi)

### Backend Setup

```bash
# Navigasi ke direktori backend
cd backend

# Instal dependensi
npm install

# Konfigurasi lingkungan
# Salin file .env.example menjadi .env dan sesuaikan
cp .env.example .env

# Buat database PostgreSQL

# Jalankan migrasi database
npm run migration:run

# Jalankan server development
npm run start:dev
```

### Frontend Setup

```bash
# Navigasi ke direktori frontend
cd frontend

# Instal dependensi
npm install

# Konfigurasi lingkungan
# Salin file .env.example menjadi .env.local dan sesuaikan
cp .env.example .env.local

# Jalankan server development
npm run dev
```

## Kontribusi

Kontribusi untuk peningkatan sistem sangat diterima. Silakan ikuti langkah-langkah berikut:

1. Fork repositori
2. Buat branch fitur (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buka Pull Request

## Lisensi

[ISC](LICENSE)

## Kontak

Nama Project - [Email](mailto:email@example.com)

Link Proyek: [https://github.com/username/laundry-management-system](https://github.com/username/laundry-management-system) 