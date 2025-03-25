import { NextResponse } from 'next/server';

export async function GET() {
  // Data contoh
  const dashboardSummary = {
    totalPendapatan: 15000000,
    totalPesanan: 120,
    pesananSelesai: 98,
    pelangganAktif: 45
  };

  return NextResponse.json(dashboardSummary);
} 