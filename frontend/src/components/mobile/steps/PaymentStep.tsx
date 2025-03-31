'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CreditCard, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createAuthHeaders } from '@/lib/api-utils';
import { useToast } from '@/components/ui/use-toast';

enum PaymentMethod {
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer',
  EWALLET = 'ewallet',
  OTHER = 'other'
}

enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled'
}

interface PaymentStepProps {
  orderId: string | null;
  orderData: any;
  onComplete: () => void;
}

export default function PaymentStep({ orderId, orderData, onComplete }: PaymentStepProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: orderData.totalAmount || 0,
    paymentMethod: PaymentMethod.CASH,
    status: PaymentStatus.COMPLETED,
    transactionId: '',
    notes: '',
    referenceNumber: `PAY-${Date.now().toString().substring(0, 10)}`
  });

  // Payment method label map
  const paymentMethodLabels: Record<string, string> = {
    [PaymentMethod.CASH]: 'Tunai',
    [PaymentMethod.CREDIT_CARD]: 'Kartu Kredit',
    [PaymentMethod.DEBIT_CARD]: 'Kartu Debit',
    [PaymentMethod.BANK_TRANSFER]: 'Transfer Bank',
    [PaymentMethod.EWALLET]: 'E-Wallet',
    [PaymentMethod.OTHER]: 'Lainnya'
  };

  // Handle input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({
      ...prev,
      [name]: name === 'amount' ? Number(value) : value
    }));
  };

  // Handle select change
  const handleSelectChange = (name: string, value: string) => {
    setPaymentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Process payment
  const processPayment = async () => {
    if (!orderId) {
      setError('ID Pesanan tidak valid');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...createAuthHeaders()
        },
        body: JSON.stringify({
          orderId: orderId,
          amount: paymentData.amount,
          paymentMethod: paymentData.paymentMethod,
          status: paymentData.status,
          transactionId: paymentData.transactionId,
          referenceNumber: paymentData.referenceNumber,
          notes: paymentData.notes
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `Failed to process payment: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('Payment processed:', responseData);
      
      // Show success state
      setIsSuccess(true);
      
      toast({
        title: "Pembayaran Berhasil",
        description: `Pembayaran sebesar Rp ${paymentData.amount.toLocaleString('id-ID')} telah berhasil diproses.`,
      });
      
      // Move to next step after delay
      setTimeout(() => {
        onComplete();
      }, 2000);
      
    } catch (error: any) {
      console.error('Error processing payment:', error);
      setError(error.message || 'Gagal memproses pembayaran');
      
      toast({
        title: "Error",
        description: error.message || 'Gagal memproses pembayaran',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show success view if payment is processed
  if (isSuccess) {
    return (
      <div className="space-y-4 text-center py-6">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold">Pembayaran Berhasil</h2>
        <p className="text-muted-foreground">
          Pembayaran sebesar Rp {paymentData.amount.toLocaleString('id-ID')} telah berhasil diproses.
        </p>
        <div className="bg-muted/30 rounded-lg p-3 text-left mt-4">
          <p><span className="font-medium">Metode:</span> {paymentMethodLabels[paymentData.paymentMethod]}</p>
          <p><span className="font-medium">Referensi:</span> {paymentData.referenceNumber}</p>
          {paymentData.transactionId && (
            <p><span className="font-medium">ID Transaksi:</span> {paymentData.transactionId}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Pembayaran</h2>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Order Summary */}
      <div className="bg-muted/30 rounded-lg p-3">
        <p className="font-medium">Ringkasan Pesanan</p>
        <div className="mt-2">
          <p><span className="text-sm text-muted-foreground">ID Pesanan:</span> {orderId}</p>
          <p><span className="text-sm text-muted-foreground">Pelanggan:</span> {orderData.customer?.name}</p>
          <p className="font-semibold mt-1">Total: Rp {orderData.totalAmount?.toLocaleString('id-ID')}</p>
        </div>
      </div>
      
      {/* Payment Form */}
      <div className="space-y-4">
        {/* Payment Amount */}
        <div className="space-y-2">
          <Label htmlFor="amount">Jumlah Pembayaran</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            value={paymentData.amount}
            onChange={handleInputChange}
          />
        </div>
        
        {/* Payment Method */}
        <div className="space-y-2">
          <Label htmlFor="paymentMethod">Metode Pembayaran</Label>
          <Select
            value={paymentData.paymentMethod}
            onValueChange={(value) => handleSelectChange('paymentMethod', value)}
          >
            <SelectTrigger id="paymentMethod">
              <SelectValue placeholder="Pilih metode pembayaran" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PaymentMethod).map(([key, value]) => (
                <SelectItem key={value} value={value}>
                  {paymentMethodLabels[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Transaction ID - only for non-cash payments */}
        {paymentData.paymentMethod !== PaymentMethod.CASH && (
          <div className="space-y-2">
            <Label htmlFor="transactionId">ID Transaksi</Label>
            <Input
              id="transactionId"
              name="transactionId"
              placeholder="ID Transaksi dari penyedia pembayaran"
              value={paymentData.transactionId}
              onChange={handleInputChange}
            />
          </div>
        )}
        
        {/* Reference Number */}
        <div className="space-y-2">
          <Label htmlFor="referenceNumber">Nomor Referensi</Label>
          <Input
            id="referenceNumber"
            name="referenceNumber"
            value={paymentData.referenceNumber}
            onChange={handleInputChange}
          />
        </div>
        
        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Catatan Pembayaran</Label>
          <Textarea
            id="notes"
            name="notes"
            placeholder="Catatan tambahan untuk pembayaran ini..."
            value={paymentData.notes}
            onChange={handleInputChange}
            rows={3}
          />
        </div>
      </div>
      
      {/* Submit Button */}
      <Button 
        className="w-full mt-4" 
        onClick={processPayment}
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Memproses...
          </span>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Proses Pembayaran
          </>
        )}
      </Button>
    </div>
  );
} 