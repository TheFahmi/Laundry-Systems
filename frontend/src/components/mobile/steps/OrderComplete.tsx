'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Download, Share2, ArrowRight, Printer } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface OrderCompleteProps {
  orderId: string | null;
  orderData: any;
}

export default function OrderComplete({ orderId, orderData }: OrderCompleteProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }

      const responseData = await response.json();
      
      // Handle different response structures
      let orderData;
      
      if (responseData.data?.data) {
        // Nested data.data structure
        orderData = responseData.data.data;
      } else if (responseData.data) {
        // Single level of nesting
        orderData = responseData.data;
      } else {
        // Direct response
        orderData = responseData;
      }
      
      setOrderDetails(orderData);
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate a random order number if not available
  const orderNumber = orderDetails?.orderNumber || 
                     `ORD-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 90000) + 10000}`;

  const handlePrintInvoice = () => {
    router.push(`/orders/${orderId}/invoice`);
  };

  const handleShareOrder = () => {
    if (navigator.share) {
      navigator.share({
        title: `Order #${orderNumber}`,
        text: `Detail pesanan laundry #${orderNumber}`,
        url: `${window.location.origin}/orders/${orderId}`,
      }).catch((error) => console.log('Error sharing:', error));
    }
  };

  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
        <Check className="h-10 w-10 text-green-600" />
      </div>
      
      <div>
        <h2 className="text-xl font-semibold">Pesanan Berhasil Dibuat!</h2>
        <p className="text-muted-foreground mt-1">
          {orderData.payments && orderData.payments.length > 0 && 
           orderData.payments[0].status === 'completed' 
            ? "Pesanan telah dibuat dan pembayaran telah diproses."
            : "Pesanan telah dibuat dan akan dibayar nanti."}
        </p>
      </div>

      <div className="bg-muted/30 rounded-lg p-4 text-left">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Nomor Pesanan:</p>
          <p className="font-semibold text-lg">{orderNumber}</p>
          
          <p className="text-sm text-muted-foreground mt-2">Pelanggan:</p>
          <p className="font-semibold">{orderData.customer?.name}</p>
          
          <p className="text-sm text-muted-foreground mt-2">Total:</p>
          <p className="font-semibold">Rp {orderData.totalAmount?.toLocaleString('id-ID')}</p>
          
          <p className="text-sm text-muted-foreground mt-2">Status:</p>
          {(orderData.payments && orderData.payments.length > 0 && 
            orderData.payments[0].status === 'completed') || 
            orderData.isPaid === true ? (
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Lunas
            </div>
          ) : (
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Belum Lunas
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          className="flex items-center justify-center"
          onClick={handlePrintInvoice}
        >
          <Printer className="mr-2 h-4 w-4" />
          Cetak Invoice
        </Button>
        
        <Button
          variant="outline"
          className="flex items-center justify-center"
          onClick={handleShareOrder}
        >
          <Share2 className="mr-2 h-4 w-4" />
          Bagikan
        </Button>
      </div>
      
      <div className="pt-4">
        <Link href={`/orders/${orderId}`} passHref>
          <Button className="w-full">
            Lihat Detail Pesanan
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
} 