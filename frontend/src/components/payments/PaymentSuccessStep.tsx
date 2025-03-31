'use client';

import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface PaymentSuccessStepProps {
  payment: any;
  orderNumber: string;
  customerName: string;
}

export default function PaymentSuccessStep({
  payment,
  orderNumber,
  customerName
}: PaymentSuccessStepProps) {
  if (!payment) {
    return (
      <div className="text-center py-4">
        <span className="text-destructive">Data pembayaran tidak tersedia</span>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID').format(value);
  };

  const getPaymentMethodLabel = (method: string): string => {
    const methodLabels: Record<string, string> = {
      'cash': 'Tunai',
      'credit_card': 'Kartu Kredit',
      'debit_card': 'Kartu Debit',
      'transfer': 'Transfer Bank',
      'ewallet': 'E-Wallet',
      'other': 'Lainnya'
    };
    return methodLabels[method] || method;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return 'Tanggal tidak valid';
      }
      
      return format(date, 'dd MMM yyyy, HH:mm', { locale: id });
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Tanggal tidak valid';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle className="h-5 w-5" />
        <h3 className="text-lg font-medium">Pembayaran Berhasil</h3>
      </div>

      <Card>
        <CardContent className="p-4 relative">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handlePrint}
            className="absolute top-2 right-2 flex items-center gap-1"
          >
            <Printer className="h-3 w-3" />
            <span className="text-xs">Cetak</span>
          </Button>

          <div className="grid grid-cols-2 gap-y-2 text-sm pt-6">
            <div className="text-muted-foreground">No. Referensi</div>
            <div>{payment.referenceNumber || payment.id}</div>
            
            <div className="text-muted-foreground">Tanggal & Waktu</div>
            <div>
              {payment.createdAt ? formatDate(payment.createdAt) : 
               payment.date ? formatDate(payment.date) : 
               formatDate(new Date().toISOString())}
            </div>
            
            <div className="text-muted-foreground">Pesanan</div>
            <div>{orderNumber}</div>
            
            <div className="text-muted-foreground">Pelanggan</div>
            <div>{customerName}</div>
            
            <div className="text-muted-foreground">Metode</div>
            <div>{getPaymentMethodLabel(payment.method || payment.paymentMethod)}</div>
            
            <div className="text-muted-foreground">Jumlah</div>
            <div className="font-medium">Rp {formatCurrency(payment.amount)}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}