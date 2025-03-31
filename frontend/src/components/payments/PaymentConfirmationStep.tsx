'use client';

import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Alert,
  AlertDescription
} from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { PaymentData } from './PaymentFlow';
import { PaymentMethod } from './PaymentForm';

interface PaymentConfirmationStepProps {
  paymentData: PaymentData;
  orderNumber: string;
  customerName: string;
  orderTotal: number;
  paidAmount: number;
  remainingAmount: number;
}

export default function PaymentConfirmationStep({
  paymentData,
  orderNumber,
  customerName,
  orderTotal,
  paidAmount,
  remainingAmount
}: PaymentConfirmationStepProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID').format(value);
  };

  const getPaymentMethodLabel = (method: PaymentMethod): string => {
    const methodLabels: Record<string, string> = {
      [PaymentMethod.CASH]: 'Tunai',
      [PaymentMethod.CREDIT_CARD]: 'Kartu Kredit',
      [PaymentMethod.DEBIT_CARD]: 'Kartu Debit',
      [PaymentMethod.TRANSFER]: 'Transfer Bank',
      [PaymentMethod.EWALLET]: 'E-Wallet',
      [PaymentMethod.OTHER]: 'Lainnya'
    };
    return methodLabels[method] || method;
  };

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Konfirmasi Pembayaran</h3>
      
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pesanan</span>
              <span>{orderNumber}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pelanggan</span>
              <span>{customerName}</span>
            </div>
            
            <Separator className="my-2" />
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Metode</span>
              <span>{getPaymentMethodLabel(paymentData.paymentMethod)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Jumlah</span>
              <span className="font-medium">Rp {formatCurrency(paymentData.amount)}</span>
            </div>
            
            {paymentData.paymentMethod !== PaymentMethod.CASH && paymentData.transactionId && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">ID Transaksi</span>
                <span>{paymentData.transactionId}</span>
              </div>
            )}
            
            {paymentData.amount > remainingAmount && (
              <div className="p-2 bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-200 rounded-md text-sm">
                Kembalian: Rp {formatCurrency(paymentData.amount - remainingAmount)}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Alert className="bg-primary/10 text-primary border-primary">
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          Klik "Proses Pembayaran" untuk menyelesaikan transaksi
        </AlertDescription>
      </Alert>
    </div>
  );
}