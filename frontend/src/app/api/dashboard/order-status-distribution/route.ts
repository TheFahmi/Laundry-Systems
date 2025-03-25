import { NextResponse } from 'next/server';

export async function GET() {
  // Data contoh
  const orderStatusDistribution = [
    { status: 'Selesai', jumlah: 98, persentase: 81.7 },
    { status: 'Dalam Proses', jumlah: 15, persentase: 12.5 },
    { status: 'Menunggu', jumlah: 7, persentase: 5.8 }
  ];

  return NextResponse.json(orderStatusDistribution);
} 