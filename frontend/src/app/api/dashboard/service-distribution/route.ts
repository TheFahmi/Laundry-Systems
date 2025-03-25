import { NextResponse } from 'next/server';

export async function GET() {
  // Data contoh
  const serviceDistribution = [
    { layanan: 'Cuci Setrika', jumlah: 50, persentase: 41.7 },
    { layanan: 'Cuci Kering', jumlah: 30, persentase: 25 },
    { layanan: 'Setrika', jumlah: 25, persentase: 20.8 },
    { layanan: 'Premium', jumlah: 15, persentase: 12.5 }
  ];

  return NextResponse.json(serviceDistribution);
} 