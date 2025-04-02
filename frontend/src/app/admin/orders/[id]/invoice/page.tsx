'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Printer, FileDown, Share2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface OrderItem {
  serviceName: string;
  quantity: number;
  price: number;
  weightBased?: boolean;
  weight?: number;
  subtotal: number;
  notes?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  items: OrderItem[];
  total: number;
  notes?: string;
  status: string;
  createdAt: string;
  payments?: Array<{
    id: string;
    amount: number;
    paymentMethod: string;
    status: string;
    createdAt: string;
    referenceNumber?: string;
  }>;
}

export default function InvoicePage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`/api/orders/${params.id}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch order details: ${response.status}`);
        }

        const data = await response.json();
        
        // Check for nested data structures
        let rawOrderData = data;
        if (data.data) {
          rawOrderData = data.data;
          
          if (rawOrderData.data) {
            rawOrderData = rawOrderData.data;
          }
        }
        
        // Process data to ensure all values are valid
        const processedOrder = {
          ...rawOrderData,
          items: (rawOrderData.items || []).map((item: OrderItem) => {
            // Get the correct price and quantity values
            const basePrice = Number(item.price) || 0;
            const quantity = item.weightBased 
              ? Number(item.weight) || 0 
              : Number(item.quantity) || 0;
            
            // Calculate the correct subtotal
            let subtotal: number;
            if (item.subtotal && !isNaN(Number(item.subtotal))) {
              subtotal = Number(item.subtotal);
            } else {
              subtotal = basePrice * quantity;
            }
            
            return {
              ...item,
              price: basePrice,
              quantity: item.weightBased ? item.quantity : quantity,
              weight: item.weightBased ? quantity : undefined,
              subtotal: subtotal
            };
          }),
          // Calculate or validate total
          total: Number(rawOrderData.totalAmount) || Number(rawOrderData.total) || 
            (rawOrderData.items || []).reduce((sum: number, item: OrderItem) => {
              const itemSubtotal = Number(item.subtotal) || 0;
              return sum + itemSubtotal;
            }, 0)
        };
        
        setOrder(processedOrder);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchOrderDetails();
    }
  }, [params.id]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Alternative: redirect to the print page which will auto-trigger printing
    window.open(`/invoices/${params.id}/print`, '_blank');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Invoice ${order?.orderNumber}`,
          text: `Invoice for order ${order?.orderNumber}`,
          url: window.location.href
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback - copy link to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard');
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <Alert variant="destructive">
          <AlertDescription>
            {error || 'Order not found'}
          </AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID').format(amount);
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd MMMM yyyy HH:mm', { locale: id });
  };

  const getPaymentMethodLabel = (method: string): string => {
    const methodLabels: Record<string, string> = {
      'cash': 'Tunai',
      'bank_transfer': 'Transfer Bank',
      'ewallet': 'E-Wallet',
      'other': 'Lainnya'
    };
    return methodLabels[method] || method;
  };

  const getStatusLabel = (status: string): string => {
    const statusLabels: Record<string, string> = {
      'new': 'Baru',
      'processing': 'Diproses',
      'ready': 'Siap Diambil',
      'completed': 'Selesai',
      'cancelled': 'Dibatalkan'
    };
    return statusLabels[status] || status;
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Action buttons - hidden during print */}
      <div className="print:hidden flex justify-between mb-4">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Bagikan
          </Button>
          <Button variant="outline" onClick={handleDownload}>
            <FileDown className="mr-2 h-4 w-4" />
            Unduh
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Cetak
          </Button>
        </div>
      </div>
      
      <Card className="mb-6">
        <CardContent className="p-6">
          {/* Invoice heading */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">LAUNDRY INVOICE</h1>
            <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
          </div>
          
          {/* Order and Customer Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500">Nomor Order</p>
              <p className="font-semibold">{order.orderNumber}</p>
              
              <p className="text-sm text-gray-500 mt-2">Tanggal</p>
              <p>{formatDate(order.createdAt)}</p>
              
              <p className="text-sm text-gray-500 mt-2">Status</p>
              <p>{getStatusLabel(order.status)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Pelanggan</p>
              <p className="font-semibold">{order.customer.name}</p>
              
              {order.customer.phone && (
                <>
                  <p className="text-sm text-gray-500 mt-2">Telepon</p>
                  <p>{order.customer.phone}</p>
                </>
              )}
              
              {order.customer.email && (
                <>
                  <p className="text-sm text-gray-500 mt-2">Email</p>
                  <p>{order.customer.email}</p>
                </>
              )}
            </div>
          </div>
          
          <Separator className="my-6" />
          
          {/* Items Table */}
          <div className="mb-6">
            <h2 className="font-semibold mb-3">Detail Item</h2>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Layanan</th>
                  <th className="text-right py-2">Jumlah</th>
                  <th className="text-right py-2">Harga</th>
                  <th className="text-right py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => {
                  const displayQuantity = item.weightBased ? 
                    `${item.weight} kg` : 
                    `${item.quantity} pcs`;
                  
                  return (
                    <tr key={index} className="border-b">
                      <td className="py-2">
                        <p>{item.serviceName}</p>
                        {item.notes && (
                          <p className="text-sm text-gray-500">{item.notes}</p>
                        )}
                      </td>
                      <td className="text-right py-2">{displayQuantity}</td>
                      <td className="text-right py-2">Rp {formatCurrency(item.price)}</td>
                      <td className="text-right py-2">Rp {formatCurrency(item.subtotal)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="text-right font-semibold py-3">Total</td>
                  <td className="text-right font-semibold py-3">Rp {formatCurrency(order.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          {/* Payment Info */}
          {order.payments && order.payments.length > 0 && (
            <>
              <Separator className="my-6" />
              
              <div className="mb-6">
                <h2 className="font-semibold mb-3">Informasi Pembayaran</h2>
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Tanggal</th>
                      <th className="text-left py-2">Metode</th>
                      <th className="text-left py-2">Referensi</th>
                      <th className="text-right py-2">Jumlah</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.payments.map((payment, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2">{formatDate(payment.createdAt)}</td>
                        <td className="py-2">{getPaymentMethodLabel(payment.paymentMethod)}</td>
                        <td className="py-2">{payment.referenceNumber || '-'}</td>
                        <td className="text-right py-2">Rp {formatCurrency(payment.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          
          {/* Notes */}
          {order.notes && (
            <>
              <Separator className="my-6" />
              
              <div>
                <h2 className="font-semibold mb-2">Catatan</h2>
                <p>{order.notes}</p>
              </div>
            </>
          )}
          
          {/* Footer - Terms and Contact */}
          <div className="mt-8 text-sm text-gray-500 text-center">
            <p>Terima kasih telah menggunakan jasa laundry kami</p>
            <p>Untuk pertanyaan, hubungi kami di 0812-3456-7890</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 