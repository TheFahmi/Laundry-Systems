# Sistem Manajemen Laundry - Frontend

Frontend untuk Sistem Manajemen Laundry komprehensif yang menangani data pelanggan, pemrosesan pesanan, pelacakan inventaris, manajemen karyawan, dan pelaporan keuangan.

## Fitur Utama

### Panel Admin

- **Dasbor Analitik**: Visualisasi KPI dan metrik bisnis kunci
- **Manajemen Pelanggan**: Administrasi profil dan detail pelanggan
- **Kontrol Pesanan**: Pemantauan status dan manajemen siklus hidup pesanan
- **Antarmuka Inventaris**: Visualisasi tingkat stok dan pelacakan inventaris
- **Portal Karyawan**: Penjadwalan dan tinjauan kinerja
- **Laporan Keuangan**: Analisis pendapatan dan pelacakan pengeluaran
- **Konfigurasi Sistem**: Manajemen layanan dan harga

### Portal Pelanggan

- **Autentikasi**: Fungsi pendaftaran dan login
- **Manajemen Pesanan**: Pemilihan layanan dan pengiriman
- **Sistem Pelacakan**: Pemantauan status pesanan secara real-time
- **Antarmuka Pembayaran**: Riwayat dan catatan transaksi
- **Manajemen Profil**: Pembaruan informasi dan preferensi
- **Komunikasi**: Permintaan khusus dan persyaratan

## Teknologi

- **Framework**: Next.js dengan App Router
- **UI Library**: Material UI dan Tailwind CSS
- **State Management**: React Context API dan Zustand
- **Grafik & Visualisasi**: Chart.js
- **Form Handling**: React Hook Form dengan validasi Zod
- **Autentikasi**: NextAuth.js
- **Data Fetching**: SWR untuk fetching data real-time

## Mulai

### Prasyarat

- Node.js (versi 16.x atau lebih tinggi)
- npm atau yarn

### Instalasi

1. Clone repositori:
   ```bash
   git clone https://github.com/username/laundry-management-system.git
   cd laundry-management-system/frontend
   ```

2. Instal dependensi:
   ```bash
   npm install
   # atau
   yarn install
   ```

3. Salin file .env.example ke .env.local dan sesuaikan:
   ```bash
   cp .env.example .env.local
   ```

4. Jalankan server pengembangan:
   ```bash
   npm run dev
   # atau
   yarn dev
   ```

5. Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

## Struktur Proyek

```
frontend/
├── public/           # File statis dan aset
├── src/              # Kode sumber
│   ├── app/          # Rute aplikasi Next.js (App Router)
│   │   ├── admin/    # Rute panel admin
│   │   └── customers/ # Rute portal pelanggan
│   ├── components/   # Komponen React
│   │   ├── ui/       # Komponen UI dasar
│   │   ├── forms/    # Komponen form
│   │   ├── admin/    # Komponen khusus admin
│   │   └── customer/ # Komponen khusus pelanggan
│   ├── hooks/        # Custom hooks React
│   ├── lib/          # Utilitas dan fungsi pembantu
│   └── services/     # Layanan API dan fetch data
└── README.md         # Dokumentasi proyek
```

## Penerapan

Proyek ini dapat dibangun untuk produksi menggunakan:

```bash
npm run build
# atau
yarn build
```

## Integrasi dengan Backend

Frontend ini mengonsumsi API RESTful dari backend NestJS yang dapat ditemukan di direktori `/backend` dari repositori utama.

## Lisensi

[ISC](LICENSE)
