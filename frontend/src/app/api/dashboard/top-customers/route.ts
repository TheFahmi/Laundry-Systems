import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Mendapatkan parameter limit dari query string
  const searchParams = request.nextUrl.searchParams;
  const limitStr = searchParams.get('limit');
  const limit = limitStr ? parseInt(limitStr, 10) : 5;
  
  // Data contoh
  const topCustomers = [
    {
      id: '1',
      nama: 'PT Maju Bersama',
      totalPesanan: 24,
      totalNilai: 4800000
    },
    {
      id: '2',
      nama: 'Hotel Sejahtera',
      totalPesanan: 18,
      totalNilai: 3600000
    },
    {
      id: '3',
      nama: 'Restoran Bahagia',
      totalPesanan: 15,
      totalNilai: 2250000
    },
    {
      id: '4',
      nama: 'Klinik Sehat',
      totalPesanan: 12,
      totalNilai: 1800000
    },
    {
      id: '5',
      nama: 'Kantor Kreasi',
      totalPesanan: 10,
      totalNilai: 1500000
    }
  ].slice(0, limit);

  return NextResponse.json(topCustomers);
} 