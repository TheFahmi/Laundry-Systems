import { NextResponse } from 'next/server';

export async function GET() {
  // Data contoh
  const revenueChart = [
    { tanggal: '2023-01', pendapatan: 2500000 },
    { tanggal: '2023-02', pendapatan: 3100000 },
    { tanggal: '2023-03', pendapatan: 2800000 },
    { tanggal: '2023-04', pendapatan: 3300000 },
    { tanggal: '2023-05', pendapatan: 3200000 },
    { tanggal: '2023-06', pendapatan: 3800000 }
  ];

  return NextResponse.json(revenueChart);
} 