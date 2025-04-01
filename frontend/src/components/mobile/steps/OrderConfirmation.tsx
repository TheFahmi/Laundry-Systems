'use client';

import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Loader2, User, UserIcon, PhoneIcon, MailIcon, HomeIcon, TruckIcon, CalendarIcon, FileTextIcon, MessageSquareIcon, ShoppingBagIcon, CheckCircleIcon } from 'lucide-react';

interface OrderConfirmationProps {
  orderData: any;
  isLoading: boolean;
  error: string | null;
}

export default function OrderConfirmation({ orderData, isLoading, error }: OrderConfirmationProps) {
  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return format(date, 'dd MMMM yyyy', { locale: id });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString || '-';
    }
  };

  // Total calculation
  const calculateTotal = () => {
    if (!orderData.items || !Array.isArray(orderData.items)) return 0;
    
    return orderData.items.reduce((total: number, item: any) => {
      const subtotal = Number(item.subtotal) || 0;
      return total + subtotal;
    }, 0);
  };

  return (
    <div className="space-y-6">
      {/* Error message if any */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Memproses pesanan...</p>
        </div>
      )}
      
      {!isLoading && !error && (
        <>
          {/* Customer Information */}
          <div>
            <div className="flex items-center mb-3">
              <UserIcon className="h-5 w-5 text-blue-500 mr-2" />
              <h3 className="text-base font-semibold">Informasi Pelanggan</h3>
            </div>
            <div className="border border-blue-200 rounded-md p-3 space-y-2 bg-blue-50/50">
              <p className="font-medium">{orderData.customer?.name || '-'}</p>
              <div className="flex items-center text-sm text-muted-foreground">
                <PhoneIcon className="h-3.5 w-3.5 mr-2 text-blue-400" />
                <p>{orderData.customer?.phone || '-'}</p>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <MailIcon className="h-3.5 w-3.5 mr-2 text-blue-400" />
                <p>{orderData.customer?.email || '-'}</p>
              </div>
              {orderData.customer?.address && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <HomeIcon className="h-3.5 w-3.5 mr-2 text-blue-400" />
                  <p>{orderData.customer.address}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Order Details */}
          <div>
            <div className="flex items-center mb-3">
              <FileTextIcon className="h-5 w-5 text-purple-500 mr-2" />
              <h3 className="text-base font-semibold">Detail Pesanan</h3>
            </div>
            <div className="border border-purple-200 rounded-md p-3 space-y-3 bg-purple-50/50">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground flex items-center">
                    {orderData.isDeliveryNeeded ? 
                      <TruckIcon className="h-3.5 w-3.5 mr-1 text-purple-400" /> : 
                      <HomeIcon className="h-3.5 w-3.5 mr-1 text-purple-400" />
                    }
                    Metode Pengambilan:
                  </p>
                  <p className="font-medium">
                    {orderData.isDeliveryNeeded ? 'Antar ke Alamat' : 'Diambil Sendiri'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground flex items-center">
                    <CalendarIcon className="h-3.5 w-3.5 mr-1 text-purple-400" />
                    Tanggal Pengambilan:
                  </p>
                  <p className="font-medium">{formatDate(orderData.pickupDate)}</p>
                </div>
                {orderData.isDeliveryNeeded && (
                  <div>
                    <p className="text-muted-foreground flex items-center">
                      <CalendarIcon className="h-3.5 w-3.5 mr-1 text-purple-400" />
                      Tanggal Pengiriman:
                    </p>
                    <p className="font-medium">{formatDate(orderData.deliveryDate)}</p>
                  </div>
                )}
              </div>
              
              {(orderData.notes || orderData.specialRequirements) && (
                <>
                  <Separator className="bg-purple-200" />
                  {orderData.notes && (
                    <div>
                      <p className="text-muted-foreground text-sm flex items-center">
                        <FileTextIcon className="h-3.5 w-3.5 mr-1 text-purple-400" />
                        Catatan:
                      </p>
                      <p className="text-sm">{orderData.notes}</p>
                    </div>
                  )}
                  {orderData.specialRequirements && (
                    <div>
                      <p className="text-muted-foreground text-sm flex items-center">
                        <MessageSquareIcon className="h-3.5 w-3.5 mr-1 text-purple-400" />
                        Permintaan Khusus:
                      </p>
                      <p className="text-sm">{orderData.specialRequirements}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          
          {/* Item List */}
          <div>
            <div className="flex items-center mb-3">
              <ShoppingBagIcon className="h-5 w-5 text-green-500 mr-2" />
              <h3 className="text-base font-semibold">Daftar Layanan</h3>
            </div>
            <div className="border border-green-200 rounded-md p-3 bg-green-50/50">
              <div className="space-y-3">
                {orderData.items && orderData.items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between text-sm">
                    <div>
                      <p>
                        {item.quantity} x {item.serviceName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        @ Rp {Number(item.price).toLocaleString('id-ID')}
                      </p>
                    </div>
                    <p className="font-medium">
                      Rp {Number(item.subtotal).toLocaleString('id-ID')}
                    </p>
                  </div>
                ))}
                
                <Separator className="bg-green-200" />
                
                <div className="flex justify-between">
                  <p className="font-medium">Total</p>
                  <p className="font-medium text-green-700">
                    Rp {calculateTotal().toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Confirmation Message */}
          <Alert className="bg-amber-50 border-amber-200 text-amber-800">
            <CheckCircleIcon className="h-4 w-4 text-amber-500 mr-2" />
            <AlertDescription>
              Silakan periksa detail pesanan. Klik tombol "Lanjutkan" untuk memproses pesanan ini.
            </AlertDescription>
          </Alert>
        </>
      )}
    </div>
  );
} 