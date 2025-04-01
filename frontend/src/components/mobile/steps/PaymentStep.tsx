'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  AlertCircle, 
  CreditCard, 
  CheckCircle2, 
  Banknote, 
  CreditCard as CreditCardIcon,
  Receipt, 
  Building, 
  Wallet, 
  MoreHorizontal,
  DollarSign,
  HashIcon,
  PenIcon,
  Clock
} from 'lucide-react';
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
import PaymentConfirmationSheet from '../PaymentConfirmationSheet';

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
  const [showConfirmationSheet, setShowConfirmationSheet] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: orderData.totalAmount || 0,
    paymentMethod: PaymentMethod.CASH,
    status: PaymentStatus.COMPLETED,
    transactionId: '',
    notes: '',
    referenceNumber: `PAY-${Date.now().toString().substring(0, 10)}`
  });

  // Listen for the 'payment:later' event
  useEffect(() => {
    const handlePayLater = () => {
      handlePaymentLater();
    };
    
    window.addEventListener('payment:later', handlePayLater);
    
    return () => {
      window.removeEventListener('payment:later', handlePayLater);
    };
  }, []);
  
  // Handle pay later option
  const handlePaymentLater = async () => {
    try {
      setIsLoading(true);
      
      // Create a pending payment record
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...createAuthHeaders()
        },
        body: JSON.stringify({
          orderId: orderId,
          amount: Number(paymentData.amount),
          paymentMethod: paymentData.paymentMethod,
          status: PaymentStatus.PENDING, // Use pending status
          transactionId: paymentData.transactionId,
          referenceNumber: paymentData.referenceNumber,
          notes: (paymentData.notes || '') + ' (Bayar Nanti)'
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `Failed to process payment: ${response.status}`);
      }
      
      // Show success notification
      toast({
        title: "Order dibuat",
        description: "Pesanan telah dibuat dengan status pembayaran menunggu.",
      });
      
      // Complete the payment flow
      onComplete();
      
    } catch (error: any) {
      console.error('Error setting up pay later:', error);
      setError(error.message || 'Gagal menyiapkan pembayaran nanti');
      
      toast({
        title: "Error",
        description: error.message || 'Gagal menyiapkan pembayaran nanti',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setShowConfirmationSheet(false);
    }
  };

  // Payment method label map
  const paymentMethodLabels: Record<string, string> = {
    [PaymentMethod.CASH]: 'Tunai',
    [PaymentMethod.CREDIT_CARD]: 'Kartu Kredit',
    [PaymentMethod.DEBIT_CARD]: 'Kartu Debit',
    [PaymentMethod.BANK_TRANSFER]: 'Transfer Bank',
    [PaymentMethod.EWALLET]: 'E-Wallet',
    [PaymentMethod.OTHER]: 'Lainnya'
  };

  // Payment method icon map
  const paymentMethodIcons: Record<string, React.ReactNode> = {
    [PaymentMethod.CASH]: <Banknote className="h-4 w-4 text-green-500" />,
    [PaymentMethod.CREDIT_CARD]: <CreditCardIcon className="h-4 w-4 text-blue-500" />,
    [PaymentMethod.DEBIT_CARD]: <CreditCardIcon className="h-4 w-4 text-purple-500" />,
    [PaymentMethod.BANK_TRANSFER]: <Building className="h-4 w-4 text-cyan-500" />,
    [PaymentMethod.EWALLET]: <Wallet className="h-4 w-4 text-amber-500" />,
    [PaymentMethod.OTHER]: <MoreHorizontal className="h-4 w-4 text-gray-500" />
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

  // Prepare data for the confirmation sheet
  const sheetPaymentData = {
    amount: paymentData.amount,
    change: paymentData.amount > orderData.totalAmount ? paymentData.amount - orderData.totalAmount : 0,
    method: paymentData.paymentMethod,
    status: paymentData.status,
    referenceNumber: paymentData.referenceNumber
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
          amount: Number(paymentData.amount),
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
      setShowConfirmationSheet(false); // Close the sheet
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
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-left mt-4">
          <p className="flex items-center gap-2">
            <span className="font-medium">Metode:</span> 
            <span className="flex items-center gap-1">
              {paymentMethodIcons[paymentData.paymentMethod]}
              {paymentMethodLabels[paymentData.paymentMethod]}
            </span>
          </p>
          <p className="flex items-center gap-2">
            <span className="font-medium">Referensi:</span> 
            <span className="flex items-center gap-1">
              <Receipt className="h-4 w-4 text-gray-500" />
              {paymentData.referenceNumber}
            </span>
          </p>
          {paymentData.transactionId && (
            <p className="flex items-center gap-2">
              <span className="font-medium">ID Transaksi:</span>
              <span className="flex items-center gap-1">
                <HashIcon className="h-4 w-4 text-gray-500" />
                {paymentData.transactionId}
              </span>
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-2">
        <CreditCard className="h-5 w-5 text-blue-500 mr-2" />
        <h2 className="text-xl font-semibold">Pembayaran</h2>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Order Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="font-medium flex items-center">
          <Receipt className="h-4 w-4 text-blue-500 mr-1" />
          Ringkasan Pesanan
        </p>
        <div className="mt-2">
          <p><span className="text-sm text-muted-foreground">ID Pesanan:</span> {orderId}</p>
          <p><span className="text-sm text-muted-foreground">Pelanggan:</span> {orderData.customer?.name}</p>
          <p className="font-semibold mt-1 text-blue-700">Total: Rp {orderData.totalAmount?.toLocaleString('id-ID')}</p>
        </div>
      </div>
      
      {/* Payment Form */}
      <div className="space-y-4">
        {/* Payment Amount */}
        <div className="space-y-2">
          <Label htmlFor="amount" className="flex items-center">
            <DollarSign className="h-4 w-4 text-green-500 mr-1" />
            Jumlah Pembayaran
          </Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            value={paymentData.amount}
            onChange={handleInputChange}
            className="border-green-200 bg-green-50/50 focus-visible:ring-green-300"
          />
        </div>
        
        {/* Display change amount if payment > total */}
        {paymentData.amount > orderData.totalAmount && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="font-medium text-green-700 flex items-center">
              <Banknote className="h-4 w-4 text-green-500 mr-1" />
              Kembalian
            </p>
            <p className="font-bold text-lg text-green-700 mt-1">
              Rp {(paymentData.amount - orderData.totalAmount).toLocaleString('id-ID')}
            </p>
          </div>
        )}
        
        {/* Payment Method */}
        <div className="space-y-2">
          <Label htmlFor="paymentMethod" className="flex items-center">
            <CreditCard className="h-4 w-4 text-purple-500 mr-1" />
            Metode Pembayaran
          </Label>
          <Select
            value={paymentData.paymentMethod}
            onValueChange={(value) => handleSelectChange('paymentMethod', value)}
          >
            <SelectTrigger id="paymentMethod" className="border-purple-200 bg-purple-50/50 focus:ring-purple-300">
              <SelectValue placeholder="Pilih metode pembayaran" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PaymentMethod).map(([key, value]) => (
                <SelectItem key={value} value={value}>
                  <div className="flex items-center gap-2">
                    {paymentMethodIcons[value]}
                    {paymentMethodLabels[value]}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Transaction ID - only for non-cash payments */}
        {paymentData.paymentMethod !== PaymentMethod.CASH && (
          <div className="space-y-2">
            <Label htmlFor="transactionId" className="flex items-center">
              <HashIcon className="h-4 w-4 text-amber-500 mr-1" />
              ID Transaksi
            </Label>
            <Input
              id="transactionId"
              name="transactionId"
              placeholder="ID Transaksi dari penyedia pembayaran"
              value={paymentData.transactionId}
              onChange={handleInputChange}
              className="border-amber-200 bg-amber-50/50 focus-visible:ring-amber-300"
            />
          </div>
        )}
        
        {/* Reference Number */}
        <div className="space-y-2">
          <Label htmlFor="referenceNumber" className="flex items-center">
            <Receipt className="h-4 w-4 text-cyan-500 mr-1" />
            Nomor Referensi
          </Label>
          <Input
            id="referenceNumber"
            name="referenceNumber"
            value={paymentData.referenceNumber}
            onChange={handleInputChange}
            className="border-cyan-200 bg-cyan-50/50 focus-visible:ring-cyan-300"
          />
        </div>
        
        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes" className="flex items-center">
            <PenIcon className="h-4 w-4 text-gray-500 mr-1" />
            Catatan Pembayaran
          </Label>
          <Textarea
            id="notes"
            name="notes"
            placeholder="Catatan tambahan (opsional)"
            value={paymentData.notes}
            onChange={handleInputChange}
            className="border-gray-200 bg-gray-50/50 focus-visible:ring-gray-300"
          />
        </div>
      </div>
      
      <Button 
        onClick={() => setShowConfirmationSheet(true)} 
        disabled={isLoading} 
        className="w-full mt-4 bg-green-600 hover:bg-green-700"
      >
        <CheckCircle2 className="h-4 w-4 mr-2" />
        Konfirmasi Pembayaran
      </Button>
      
      <Button 
        onClick={handlePaymentLater}
        disabled={isLoading} 
        variant="outline"
        className="w-full mt-2"
      >
        <Clock className="h-4 w-4 mr-2" />
        Bayar Nanti
      </Button>
      
      {/* Payment Confirmation Sheet */}
      <PaymentConfirmationSheet
        isOpen={showConfirmationSheet}
        onClose={() => setShowConfirmationSheet(false)}
        onConfirm={processPayment}
        paymentData={sheetPaymentData}
        orderTotal={orderData.totalAmount || 0}
        isLoading={isLoading}
      />
    </div>
  );
} 