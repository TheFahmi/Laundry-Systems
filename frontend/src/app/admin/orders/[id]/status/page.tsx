'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { createAuthHeaders } from '@/lib/api-utils';
import { toast } from 'react-toastify';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function OrderStatusPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [updating, setUpdating] = useState(false);
  
  // Available status options
  const statusOptions = [
    { value: 'new', label: 'Baru' },
    { value: 'processing', label: 'Diproses' },
    { value: 'washing', label: 'Mencuci' },
    { value: 'drying', label: 'Mengeringkan' },
    { value: 'folding', label: 'Melipat' },
    { value: 'ready', label: 'Siap Diambil' },
    { value: 'completed', label: 'Selesai' },
    { value: 'cancelled', label: 'Dibatalkan' },
  ];
  
  // Get order status badge variant
  const getStatusVariant = (status: string) => {
    const statusMap: Record<string, string> = {
      'new': 'bg-gray-200 text-gray-800',
      'processing': 'bg-blue-200 text-blue-800',
      'washing': 'bg-cyan-200 text-cyan-800',
      'drying': 'bg-purple-200 text-purple-800',
      'folding': 'bg-indigo-200 text-indigo-800',
      'ready': 'bg-amber-200 text-amber-800',
      'completed': 'bg-green-200 text-green-800',
      'cancelled': 'bg-red-200 text-red-800',
    };
    return statusMap[status?.toLowerCase()] || 'bg-gray-200 text-gray-800';
  };
  
  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/orders/${orderId}`, {
          headers: createAuthHeaders(),
          cache: 'no-store'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch order details');
        }
        
        const data = await response.json();
        setOrder(data.data || data);
        setSelectedStatus(data.data?.status || data.status || 'new');
        
      } catch (err: any) {
        console.error('Error fetching order:', err);
        setError(err.message || 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [orderId]);
  
  // Check if order is paid
  const isOrderPaid = () => {
    if (!order) return false;
    
    // Check different ways payment status might be stored
    const isPaid = order.isPaid || order.paymentStatus === 'paid';
    
    // Also check if there are completed payments
    const hasCompletedPayments = order.payments && 
      order.payments.some((p: any) => p.status === 'completed');
    
    return isPaid || hasCompletedPayments;
  };
  
  // Handle back button
  const handleBack = () => {
    router.back();
  };
  
  // Handle status update
  const handleUpdateStatus = async () => {
    if (!selectedStatus) {
      toast.error('Silakan pilih status terlebih dahulu');
      return;
    }
    
    setUpdating(true);
    
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...createAuthHeaders()
        },
        body: JSON.stringify({
          status: selectedStatus
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update order status');
      }
      
      toast.success('Status pesanan berhasil diperbarui');
      
      // If status changed to completed, also mark as paid if not already
      if (selectedStatus === 'completed' && order && !order.isPaid && order.paymentStatus !== 'paid') {
        await fetch(`/api/orders/${orderId}/payment-status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...createAuthHeaders()
          },
          body: JSON.stringify({
            paymentStatus: 'paid',
            isPaid: true
          }),
        });
        
        toast.success('Pesanan selesai dan ditandai sebagai Lunas');
      }
      
      // Go back to order details
      setTimeout(() => {
        router.back();
      }, 1000);
      
    } catch (err: any) {
      console.error('Error updating status:', err);
      toast.error(err.message || 'Gagal memperbarui status pesanan');
    } finally {
      setUpdating(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button 
          variant="outline" 
          onClick={handleBack}
          className="mt-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
      </div>
    );
  }
  
  // Prevent status changes for unpaid orders
  if (order && !isOrderPaid()) {
    return (
      <div className="flex flex-col h-screen">
        <div className="sticky top-0 z-10 bg-background border-b p-4 flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleBack}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex-1 text-center">
            <h1 className="text-lg font-semibold">Ubah Status Pesanan</h1>
          </div>
        </div>
        
        <div className="flex-1 p-4 space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Pesanan Belum Lunas</AlertTitle>
            <AlertDescription>
              Status pesanan hanya dapat diubah setelah pembayaran diselesaikan. Silakan proses pembayaran terlebih dahulu.
            </AlertDescription>
          </Alert>
          
          <Button 
            onClick={handleBack}
            className="w-full mt-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Detail Pesanan
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen">
      {/* Mobile Header */}
      <div className="sticky top-0 z-10 bg-background border-b p-4 flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleBack}
          className="rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex-1 text-center">
          <h1 className="text-lg font-semibold">Ubah Status Pesanan</h1>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 p-4 space-y-4">
        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-medium mb-4">ID Pesanan: {order?.orderNumber || orderId}</h2>
            
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-1">Status Saat Ini</p>
              <div className={`inline-block px-3 py-1 rounded-full text-sm ${getStatusVariant(order?.status)}`}>
                {order?.status || 'new'}
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="font-medium">Pilih Status Baru</p>
              <Select 
                value={selectedStatus} 
                onValueChange={setSelectedStatus}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Footer buttons */}
      <div className="sticky bottom-0 p-4 bg-background border-t">
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={handleBack}
            disabled={updating}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Batal
          </Button>
          
          <Button 
            variant="default" 
            className="flex-1"
            onClick={handleUpdateStatus}
            disabled={updating || selectedStatus === order?.status}
          >
            {updating ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                Memproses...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Simpan Perubahan
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
} 