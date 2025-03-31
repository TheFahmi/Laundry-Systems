'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from 'react-toastify';
import { Check, ArrowLeft, MoreVertical, Clock, CreditCard } from 'lucide-react';
import { createAuthHeaders } from '@/lib/api-utils';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface OrderDetailsMobileProps {
  order: any;
  onRefresh: () => void;
}

export default function OrderDetailsMobile({ order, onRefresh }: OrderDetailsMobileProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  
  const isFullyPaid = order.paymentStatus === 'paid' || order.isPaid;
  
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

  return (
    <div className="flex flex-col h-full">
      {/* Mobile Header */}
      <div className="sticky top-0 z-10 bg-background border-b p-4 flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleBack}
          className="rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex-1 text-center">
          <h1 className="text-lg font-semibold truncate">
            {order.orderNumber || `ORD-${order.id.substring(0, 8)}`}
          </h1>
        </div>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-xl">
            <SheetHeader className="mb-4">
              <SheetTitle>Pengaturan Pesanan</SheetTitle>
              <SheetDescription>
                Pilih tindakan untuk pesanan ini
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-3 px-1">
              {!isFullyPaid && (
                <Button 
                  variant="default" 
                  className="w-full justify-start py-6"
                  onClick={() => setOpenStatusDialog(true)}
                >
                  <CreditCard className="mr-3 h-5 w-5" />
                  <span>Tandai sebagai Lunas</span>
                </Button>
              )}
              
              <Button 
                variant="default" 
                className="w-full justify-start py-6"
                onClick={() => router.push(`/orders/${order.id}/payment`)}
              >
                <CreditCard className="mr-3 h-5 w-5" />
                <span>Proses Pembayaran</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start py-6"
                onClick={handleBack}
              >
                <ArrowLeft className="mr-3 h-5 w-5" />
                <span>Kembali ke Daftar</span>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
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
            onClick={() => setOpenStatusDialog(true)}
          >
            <Check className="mr-2 h-4 w-4" />
            Tandai Lunas
          </Button>
        )}
        
        {isFullyPaid && (
          <Button 
            variant="outline" 
            className="flex-1"
            disabled
          >
            <Check className="mr-2 h-4 w-4" />
            Lunas
          </Button>
        )}
      </div>
      
      {/* Dialog for marking as paid */}
      <Dialog open={openStatusDialog} onOpenChange={setOpenStatusDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Konfirmasi Pembayaran</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menandai pesanan ini sebagai Lunas?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex sm:justify-between">
            <Button 
              variant="outline" 
              onClick={() => setOpenStatusDialog(false)}
            >
              Batal
            </Button>
            <Button
              variant="default"
              onClick={handleUpdatePaymentStatus}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Tandai Lunas
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 