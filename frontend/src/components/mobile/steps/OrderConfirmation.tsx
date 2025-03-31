'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface OrderConfirmationProps {
  orderData: any;
  isLoading: boolean;
  error: string | null;
}

export default function OrderConfirmation({ 
  orderData, 
  isLoading,
  error 
}: OrderConfirmationProps) {
  // Format date helper
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Belum ditentukan';
    
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: id });
    } catch (error) {
      return 'Format tanggal tidak valid';
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Konfirmasi Pesanan</h2>
      
      {isLoading && (
        <div className="py-4 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
          <p className="ml-2">Memproses pesanan...</p>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <ScrollArea className="h-[400px] pr-4">
        {/* Customer Information */}
        <div className="space-y-2">
          <h3 className="font-medium">Informasi Pelanggan</h3>
          <div className="bg-muted/30 rounded-lg p-3">
            <p><span className="font-medium">Nama:</span> {orderData.customer?.name || 'N/A'}</p>
            <p><span className="font-medium">Telepon:</span> {orderData.customer?.phone || 'N/A'}</p>
            <p><span className="font-medium">Email:</span> {orderData.customer?.email || 'N/A'}</p>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        {/* Service Items */}
        <div className="space-y-2">
          <h3 className="font-medium">Item Layanan</h3>
          {orderData.items && orderData.items.length > 0 ? (
            <div className="space-y-2">
              {orderData.items.map((item: any, index: number) => (
                <div key={index} className="bg-muted/30 rounded-lg p-3">
                  <p className="font-medium">{item.serviceName}</p>
                  {item.weightBased ? (
                    <p className="text-sm">{item.weight} kg x Rp {item.price.toLocaleString('id-ID')}</p>
                  ) : (
                    <p className="text-sm">{item.quantity} x Rp {item.price.toLocaleString('id-ID')}</p>
                  )}
                  {item.notes && (
                    <p className="text-sm text-muted-foreground mt-1">Catatan: {item.notes}</p>
                  )}
                  <p className="text-sm font-medium mt-1">Subtotal: Rp {item.subtotal.toLocaleString('id-ID')}</p>
                </div>
              ))}
              
              <div className="bg-primary/10 rounded-lg p-3 mt-3">
                <p className="font-bold">Total: Rp {orderData.totalAmount.toLocaleString('id-ID')}</p>
                <p className="text-sm">Total Berat: {orderData.totalWeight.toFixed(2)} kg</p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Tidak ada item yang dipilih</p>
          )}
        </div>
        
        <Separator className="my-4" />
        
        {/* Delivery Information */}
        <div className="space-y-2">
          <h3 className="font-medium">Informasi Pengiriman</h3>
          <div className="bg-muted/30 rounded-lg p-3">
            <p>
              <span className="font-medium">Opsi Pengiriman:</span> {
                orderData.isDeliveryNeeded ? 'Antar ke Alamat' : 'Diambil Sendiri'
              }
            </p>
            <p>
              <span className="font-medium">Tanggal Pengambilan:</span> {
                formatDate(orderData.pickupDate)
              }
            </p>
            {orderData.isDeliveryNeeded && (
              <p>
                <span className="font-medium">Tanggal Pengiriman:</span> {
                  formatDate(orderData.deliveryDate)
                }
              </p>
            )}
          </div>
        </div>
        
        <Separator className="my-4" />
        
        {/* Notes & Requirements */}
        <div className="space-y-2">
          <h3 className="font-medium">Catatan & Permintaan</h3>
          <div className="bg-muted/30 rounded-lg p-3">
            <p className="font-medium">Catatan:</p>
            <p className="text-sm">{orderData.notes || 'Tidak ada catatan'}</p>
            
            <p className="font-medium mt-2">Permintaan Khusus:</p>
            <p className="text-sm">{orderData.specialRequirements || 'Tidak ada permintaan khusus'}</p>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        {/* Confirmation Notice */}
        <Alert className="mt-4 border-green-500 bg-green-50 text-green-800">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Siap untuk diproses</AlertTitle>
          <AlertDescription>
            Silahkan periksa kembali detail pesanan di atas dan tekan tombol "Buat Pesanan" untuk melanjutkan.
          </AlertDescription>
        </Alert>
      </ScrollArea>
    </div>
  );
} 