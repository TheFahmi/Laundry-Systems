'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from 'react-toastify';
import { Check, ArrowLeft, MoreVertical, Clock, CreditCard } from 'lucide-react';
import { createAuthHeaders } from '@/lib/api-utils';
import PaymentConfirmationSheet from './PaymentConfirmationSheet';
import BottomSheet from './BottomSheet';
import ActionSheet, { ActionItem } from './ActionSheet';

// Tipe data untuk PaymentData
interface PaymentData {
  amount: number;
  change: number;
  method: string;
  status: string;
  referenceNumber?: string;
}

interface OrderDetailsMobileProps {
  order: any;
  onRefresh: () => void;
}

export default function OrderDetailsMobile({ order, onRefresh }: OrderDetailsMobileProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData>({
    amount: Number(order.totalAmount) || 0,
    change: 0,
    method: 'cash',
    status: 'completed',
    referenceNumber: `REF-${Date.now().toString().substring(0, 8)}`
  });
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  
  // Calculate if the order is fully paid based on completed payments
  const hasCompletedPayments = order.payments && 
    order.payments.some((p: any) => p.status === 'completed');
  
  const isFullyPaid = order.paymentStatus === 'paid' || order.isPaid || hasCompletedPayments;
  
  // Get order status badge variant
  const getStatusVariant = (status: string) => {
    const statusMap: Record<string, "default" | "destructive" | "outline" | "secondary" | "success" | "warning"> = {
      'new': 'default',
      'processing': 'secondary',
      'ready': 'secondary',
      'completed': 'success',
      'cancelled': 'destructive',
      'pending': 'warning',
      'washing': 'secondary',
      'drying': 'secondary',
      'folding': 'secondary',
      'delivered': 'success'
    };
    return statusMap[status?.toLowerCase()] || 'default';
  };

  const handleBack = () => {
    router.push('/orders');
  };

  const handleUpdatePaymentStatus = async () => {
    setIsUpdating(true);
    
    try {
      const response = await fetch(`/api/orders/${order.id}/payment-status`, {
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `Failed to update payment status: ${response.status}`);
      }

      toast.success('Status pembayaran berhasil diperbarui menjadi Lunas');
      onRefresh();
    } catch (error: any) {
      console.error('Error updating payment status:', error);
      toast.error(error.message || 'Gagal memperbarui status pembayaran');
    } finally {
      setIsUpdating(false);
      setOpenStatusDialog(false);
    }
  };

  const handleCompleteExistingPayment = async () => {
    setIsProcessingPayment(true);
    
    try {
      // Memanggil API untuk menyelesaikan pembayaran dengan metode yang dipilih
      const response = await fetch(`/api/orders/${order.id}/completed-payment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...createAuthHeaders()
        },
        body: JSON.stringify({
          paymentMethod: paymentData.method
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `Failed to complete payment: ${response.status}`);
      }
      
      toast.success('Pembayaran berhasil diselesaikan!');
      setShowPaymentSheet(false);
      onRefresh();
    } catch (error: any) {
      console.error('Error completing payment:', error);
      toast.error(error.message || 'Gagal menyelesaikan pembayaran');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleConfirmPayment = async () => {
    // Jika ada pembayaran tertunda, selesaikan pembayaran tersebut
    if (order.payments && order.payments.some((p: any) => p.status === 'pending')) {
      await handleCompleteExistingPayment();
      return;
    }
    
    // Jika tidak ada pembayaran tertunda, buat pembayaran baru
    setIsProcessingPayment(true);
    
    try {
      // Create payment record
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...createAuthHeaders()
        },
        body: JSON.stringify({
          orderId: order.id,
          amount: Number(paymentData.amount),
          paymentMethod: paymentData.method,
          status: paymentData.status,
          referenceNumber: paymentData.referenceNumber,
          notes: `Payment processed via mobile app`
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `Failed to process payment: ${response.status}`);
      }

      // Update order payment status
      await fetch(`/api/orders/${order.id}/payment-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...createAuthHeaders()
        },
        body: JSON.stringify({
          paymentStatus: 'paid',
          isPaid: true,
          paymentMethod: paymentData.method
        }),
      });

      toast.success('Pembayaran berhasil diproses!');
      setShowPaymentSheet(false);
      onRefresh();
    } catch (error: any) {
      console.error('Error processing payment:', error);
      toast.error(error.message || 'Gagal memproses pembayaran');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Auto-update payment status if order has completed payments
  useEffect(() => {
    const autoUpdatePaymentStatus = async () => {
      // If there are completed payments but order is not marked as paid
      if (hasCompletedPayments && !order.isPaid && order.paymentStatus !== 'paid') {
        try {
          await handleUpdatePaymentStatus();
        } catch (error) {
          console.error('Failed to auto-update payment status:', error);
        }
      }
    };
    
    autoUpdatePaymentStatus();
  }, [hasCompletedPayments, order.isPaid, order.paymentStatus]);

  return (
    <div className="flex flex-col h-full">
      {/* Mobile Header */}
      <div className="sticky top-0 z-10 bg-background border-b p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Pesanan #{order.id}</h1>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full"
          onClick={() => setActionSheetOpen(true)}
        >
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>

      {/* Main content */}
      <div className="flex-1 p-4 space-y-4 pb-24">
        {/* Status card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={getStatusVariant(order.status)} className="mt-1">
                  {order.status}
                </Badge>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Pembayaran</p>
                <Badge variant={isFullyPaid ? "success" : "warning"} className="mt-1">
                  {isFullyPaid ? "Lunas" : "Belum Lunas"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Customer info */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-2">Detail Pelanggan</h3>
            <p className="text-sm">
              <span className="text-muted-foreground">Nama:</span>{" "}
              {order.customer?.name || "N/A"}
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Telepon:</span>{" "}
              {order.customer?.phone || "N/A"}
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Email:</span>{" "}
              {order.customer?.email || "N/A"}
            </p>
          </CardContent>
        </Card>
        
        {/* Order info */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-2">Detail Pesanan</h3>
            <p className="text-sm">
              <span className="text-muted-foreground">Tanggal:</span>{" "}
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Total:</span>{" "}
              Rp {new Intl.NumberFormat('id-ID').format(order.totalAmount || 0)}
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Berat:</span>{" "}
              {order.totalWeight || 0} kg
            </p>
          </CardContent>
        </Card>
        
        {/* Payment Details */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-2">Detail Pembayaran</h3>
            {order.payments && order.payments.length > 0 ? (
              <div className="space-y-2">
                {order.payments.map((payment: any, index: number) => (
                  <div key={index} className="text-sm border-b pb-2">
                    <div className="flex justify-between">
                      <span className="font-medium">#{index + 1} {payment.paymentMethod || payment.payment_method}</span>
                      <span>Rp {new Intl.NumberFormat('id-ID').format(payment.amount || 0)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>{new Date(payment.createdAt || payment.created_at).toLocaleDateString()}</span>
                      <Badge variant={payment.status === 'completed' ? "success" : "warning"}>
                        {payment.status === 'completed' ? 'Selesai' : 'Menunggu'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground p-2 bg-gray-50 rounded">
                Belum ada riwayat pembayaran
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Items */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-2">Item ({order.items?.length || 0})</h3>
            <div className="space-y-2">
              {order.items?.map((item: any, index: number) => (
                <div key={index} className="flex justify-between text-sm border-b pb-2">
                  <span>{item.service?.name || "Item"} x{item.quantity || 1}</span>
                  <span>Rp {new Intl.NumberFormat('id-ID').format(item.subtotal || 0)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Footer action buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 flex space-x-2">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={handleBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
        
        {!isFullyPaid && (
          <Button 
            variant="default" 
            className="flex-1"
            onClick={() => {
              setShowPaymentSheet(true);
              // Make sure the payment sheet is visible in the next render cycle
              setTimeout(() => {
                const sheet = document.querySelector('[data-state="open"]');
                if (!sheet) {
                  console.log('Sheet not found, forcing visibility');
                  setShowPaymentSheet(true);
                }
              }, 100);
            }}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Proses Pembayaran
          </Button>
        )}
      </div>
      
      {/* Payment Confirmation Sheet */}
      <PaymentConfirmationSheet
        isOpen={showPaymentSheet}
        onClose={() => setShowPaymentSheet(false)}
        onConfirm={handleConfirmPayment}
        paymentData={paymentData}
        setPaymentData={setPaymentData}
        orderTotal={order.totalAmount || 0}
        isLoading={isProcessingPayment}
      />
      
      {/* Payment Status Dialog */}
      <BottomSheet 
        isOpen={openStatusDialog} 
        onClose={() => setOpenStatusDialog(false)}
        title="Update Status Pembayaran"
        description="Anda yakin ingin menandai pesanan ini sebagai Lunas?"
      >
        <div className="flex flex-col p-4 gap-4 border-t">
          <Button 
            onClick={handleUpdatePaymentStatus}
            disabled={isUpdating}
            className="w-full"
          >
            {isUpdating ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Memproses...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Konfirmasi
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setOpenStatusDialog(false)}
            disabled={isUpdating}
            className="w-full"
          >
            Batal
          </Button>
        </div>
      </BottomSheet>

      {/* Action Sheet for order settings */}
      <ActionSheet
        isOpen={actionSheetOpen}
        onClose={() => setActionSheetOpen(false)}
        title="Pengaturan Pesanan"
        description="Pilih tindakan untuk pesanan ini"
        actions={[
          ...((!isFullyPaid) ? [{
            icon: <CreditCard className="h-5 w-5" />,
            label: "Proses Pembayaran",
            onClick: () => {
              setActionSheetOpen(false);
              setTimeout(() => setShowPaymentSheet(true), 300);
            }
          }] : []),
          {
            icon: <Clock className="h-5 w-5" />,
            label: "Ubah Status Pesanan",
            onClick: () => {
              router.push(`/orders/${order.id}/status`);
            }
          },
          {
            icon: <ArrowLeft className="h-5 w-5" />,
            label: "Kembali ke Daftar",
            onClick: handleBack,
            variant: "outline"
          }
        ]}
      />
    </div>
  );
} 