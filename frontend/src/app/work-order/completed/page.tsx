'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getOrderById } from '@/lib/orders';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { CheckCircle, Clock, Printer } from 'lucide-react';

export default function OrderCompletedPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orderId = searchParams.get('id');

  useEffect(() => {
    if (!orderId) {
      setError('ID pesanan tidak ditemukan');
      setLoading(false);
      return;
    }

    async function fetchOrderDetails() {
      try {
        setLoading(true);
        console.log('Fetching order with ID:', orderId);
        const response = await getOrderById(orderId);
        
        if (response && response.data) {
          console.log('Order data:', response.data);
          setOrder(response.data);
        } else {
          setError('Data pesanan tidak ditemukan');
        }
      } catch (err: any) {
        console.error('Error fetching order:', err);
        setError(err.message || 'Gagal mengambil data pesanan');
      } finally {
        setLoading(false);
      }
    }

    fetchOrderDetails();
  }, [orderId]);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy, HH:mm', { locale: id });
    } catch (e) {
      return dateString || 'Tanggal tidak valid';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Memuat data pesanan...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md text-center">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Terjadi Kesalahan</h2>
          <p className="text-gray-600 mb-4">{error || 'Tidak dapat menampilkan detail pesanan'}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-green-500 p-6 text-white text-center">
          <CheckCircle className="h-16 w-16 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Pesanan Selesai!</h1>
          <p className="mt-2">Terima kasih telah menggunakan layanan kami</p>
        </div>
        
        <div className="p-6">
          <div className="mb-6 text-center">
            <p className="text-sm text-gray-500">Nomor Pesanan</p>
            <p className="text-xl font-bold">{order.order_id || order.id}</p>
          </div>
          
          <div className="border-t border-b border-gray-100 py-4 mb-4">
            <h2 className="font-semibold mb-3">Detail Pesanan</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Nama Pelanggan:</span>
                <span className="font-medium">{order.name || order.customer?.name || 'Pelanggan'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tanggal Pemesanan:</span>
                <span>{formatDate(order.created_at || order.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  {order.status || 'Selesai'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="font-semibold mb-3">Item Pesanan</h2>
            <div className="space-y-3">
              {order.items && order.items.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between text-sm">
                  <div>
                    <p className="font-medium">{item.name || item.serviceName}</p>
                    <p className="text-gray-500 text-xs">
                      {item.weight ? `${item.weight} kg` : `${item.quantity} pcs`}
                    </p>
                  </div>
                  <p className="font-medium">{formatCurrency(item.subtotal || (item.price * (item.quantity || item.weight)))}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between">
              <span className="font-bold">Total</span>
              <span className="font-bold">{formatCurrency(order.total_price || order.total || 0)}</span>
            </div>
          </div>
          
          {order.notes && (
            <div className="mb-6 text-sm">
              <h2 className="font-semibold mb-2">Catatan</h2>
              <p className="text-gray-700 bg-gray-50 p-3 rounded">{order.notes}</p>
            </div>
          )}
          
          <div className="space-y-3">
            <Link 
              href={`/invoices/${order.id}/print`}
              className="block w-full py-2.5 bg-blue-500 text-white text-center rounded-lg hover:bg-blue-600 transition flex items-center justify-center"
            >
              <Printer className="w-4 h-4 mr-2" />
              Cetak Invoice
            </Link>
            
            <button
              onClick={() => router.push('/dashboard')}
              className="block w-full py-2.5 bg-gray-100 text-gray-700 text-center rounded-lg hover:bg-gray-200 transition"
            >
              Kembali ke Dashboard
            </button>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-100 text-center text-xs text-gray-500">
            <p>Pesanan dibuat pada {formatDate(order.created_at || order.createdAt)}</p>
            {order.updated_at && order.updated_at !== order.created_at && (
              <p>Terakhir diperbarui: {formatDate(order.updated_at || order.updatedAt)}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 