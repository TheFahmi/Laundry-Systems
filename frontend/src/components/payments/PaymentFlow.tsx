'use client';

import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Alert,
  AlertDescription,
  AlertTitle
} from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Loader2, CheckCircle, Check } from 'lucide-react';
import PaymentMethodStep from './PaymentMethodStep';
import PaymentAmountStep from './PaymentAmountStep';
import { PaymentMethod, PaymentStatus } from './PaymentForm';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { createAuthHeaders } from '@/lib/api-utils';
import { formatRupiah } from '@/lib/utils';

// Generate a payment reference number
const generateReferenceNumber = (orderId: string): string => {
  const timestamp = Date.now().toString().slice(-6);
  const orderIdShort = orderId.substring(0, 6);
  return `REF-${orderIdShort}-${timestamp}`;
};

export interface PaymentData {
  amount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  transactionId?: string;
}

interface PaymentFlowProps {
  orderId: string;
  orderNumber: string;
  orderTotal: number;
  customerName: string;
  onComplete: (payment: any) => void;
  onCancel: () => void;
  existingPayments?: any[];
}

export default function PaymentFlow({
  orderId,
  orderNumber,
  orderTotal,
  customerName,
  onComplete,
  onCancel,
  existingPayments = []
}: PaymentFlowProps) {
  const router = useRouter();
  
  // Define steps before using it in any hooks
  const steps = ['Pelanggan', 'Pembayaran'];
  
  // Add a state to track payment sub-state: 'input', 'confirming', 'success'
  const [paymentState, setPaymentState] = useState<'input' | 'confirming' | 'success'>('input');
  
  const [activeStep, setActiveStep] = useState(() => {
    // Try to load saved step from localStorage
    const savedStep = localStorage.getItem(`payment_step_${orderId}`);
    return savedStep ? parseInt(savedStep, 10) : 0;
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedPayment, setProcessedPayment] = useState<any | null>(() => {
    // Try to load saved payment from localStorage
    const savedPayment = localStorage.getItem(`payment_processed_${orderId}`);
    if (savedPayment) {
      try {
        return JSON.parse(savedPayment);
      } catch (e) {
        console.error('Failed to parse saved payment:', e);
      }
    }
    return null;
  });
  
  // Calculate the amount that remains to be paid
  const paidAmount = existingPayments
    .filter(p => p.status === 'completed')
    .reduce((total, payment) => total + Number(payment.amount || 0), 0);
    
  const remainingAmount = Math.max(0, orderTotal - paidAmount);
  
  // Payment form data
  const [paymentData, setPaymentData] = useState<PaymentData>(() => {
    // Try to load saved payment data from localStorage
    const savedPaymentData = localStorage.getItem(`payment_data_${orderId}`);
    if (savedPaymentData) {
      try {
        return JSON.parse(savedPaymentData);
      } catch (e) {
        console.error('Failed to parse saved payment data:', e);
      }
    }
    return {
      amount: remainingAmount,
      paymentMethod: PaymentMethod.CASH,
      notes: '',
      transactionId: ''
    };
  });

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(`payment_step_${orderId}`, activeStep.toString());
    localStorage.setItem(`payment_data_${orderId}`, JSON.stringify(paymentData));
    if (processedPayment) {
      localStorage.setItem(`payment_processed_${orderId}`, JSON.stringify(processedPayment));
    }
  }, [activeStep, paymentData, processedPayment, orderId]);

  // Clear payment data when component unmounts if payment is not complete
  useEffect(() => {
    return () => {
      if (activeStep !== steps.length - 1) {
        // Keep data for now
      }
    };
  }, [activeStep, steps.length]);

  const handleNext = () => {
    if (activeStep === 0) {
      // Moving from customer step to payment step
      setActiveStep(1);
    } else if (activeStep === 1) {
      // In payment step
      if (paymentState === 'input') {
        // Validate payment inputs
        if (!paymentData.paymentMethod) {
          toast.error("Silakan pilih metode pembayaran terlebih dahulu");
          return;
        }
        
        if (!paymentData.amount || paymentData.amount <= 0) {
          toast.error("Silakan masukkan jumlah pembayaran yang valid");
          return;
        }
        
        // Move to confirmation state
        setPaymentState('confirming');
      } else if (paymentState === 'confirming') {
        // Process payment
        handleSubmitPayment();
      } else if (paymentState === 'success') {
        // Clear the payment flow and start over
        clearPaymentState();
        setActiveStep(0);
        setPaymentState('input');
      }
    }
  };

  const handleBack = () => {
    if (activeStep === 1) {
      if (paymentState === 'confirming') {
        // Go back to payment input state
        setPaymentState('input');
      } else if (paymentState === 'input') {
        // Go back to customer step
        setActiveStep(0);
      }
    }
  };

  const handleUpdatePaymentData = (data: Partial<PaymentData>) => {
    setPaymentData(prev => ({ ...prev, ...data }));
  };

  // Clear all payment state from localStorage
  const clearPaymentState = () => {
    localStorage.removeItem(`payment_step_${orderId}`);
    localStorage.removeItem(`payment_data_${orderId}`);
    localStorage.removeItem(`payment_processed_${orderId}`);
  };

  const handleSubmitPayment = async () => {
    try {
      setIsProcessing(true);
      
      // Prepare payment data for submission
      const paymentSubmission = {
        orderId: orderNumber,
        amount: paymentData.amount,
        paymentMethod: paymentData.paymentMethod,
        notes: paymentData.notes || '',
        transactionId: paymentData.transactionId || ''
      };
      
      // Simulating API call with a timeout
      setTimeout(() => {
        const mockResponse = {
          id: Math.random().toString(36).substr(2, 9),
          ...paymentSubmission,
          status: "success",
          date: new Date().toISOString()
        };
        
        setProcessedPayment(mockResponse);
        setPaymentState('success');
        setIsProcessing(false);
        
        toast.success(`Pembayaran sebesar ${formatRupiah(paymentData.amount)} telah diterima`);
        
        // In a real implementation, this would be:
        // const response = await axios.post('/api/payments', paymentSubmission);
        // setProcessedPayment(response.data);
      }, 1500);
    } catch (error) {
      setIsProcessing(false);
      toast.error("Terjadi kesalahan saat memproses pembayaran. Silakan coba lagi.");
      console.error("Payment submission error:", error);
    }
  };

  // Render the current step content
  const getStepContent = (step: number) => {
    switch (step) {
      case 0: // Pelanggan step - just show customer info
        return (
          <div className="p-4 border rounded-md bg-slate-50 dark:bg-slate-900 text-center">
            <h3 className="font-medium mb-1">Informasi Pelanggan</h3>
            <p className="text-lg mb-4">{customerName}</p>
            <p className="text-sm text-muted-foreground mb-2">ID Pesanan: {orderNumber}</p>
            <p className="text-sm text-muted-foreground">Total Pesanan: Rp {new Intl.NumberFormat('id-ID').format(orderTotal)}</p>
          </div>
        );
      case 1: // Payment method and amount combined
        if (paymentState === 'success' && processedPayment) {
          return (
            <PaymentSuccessStep 
              payment={processedPayment}
              orderNumber={orderNumber}
              customerName={customerName}
            />
          );
        } else if (paymentState === 'confirming') {
          return (
            <PaymentConfirmationStep 
              paymentData={paymentData} 
              orderNumber={orderNumber}
              customerName={customerName}
              orderTotal={orderTotal}
              paidAmount={paidAmount}
              remainingAmount={remainingAmount}
            />
          );
        } else {
          return (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <PaymentMethodStep 
                  paymentMethod={paymentData.paymentMethod} 
                  onSelect={(method) => handleUpdatePaymentData({ paymentMethod: method })} 
                />
              </div>
              
              <div>
                <PaymentAmountStep 
                  orderTotal={orderTotal}
                  paidAmount={paidAmount}
                  remainingAmount={remainingAmount}
                  amount={paymentData.amount}
                  onAmountChange={(amount) => handleUpdatePaymentData({ amount })} 
                  paymentMethod={paymentData.paymentMethod}
                  onTransactionIdChange={(transactionId) => handleUpdatePaymentData({ transactionId })}
                  transactionId={paymentData.transactionId || ''}
                  onNotesChange={(notes) => handleUpdatePaymentData({ notes })}
                  notes={paymentData.notes || ''}
                />
              </div>
            </div>
          );
        }
      default:
        return (
          <div className="text-center p-4 text-destructive">
            Langkah tidak ditemukan
          </div>
        );
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <div className="p-6">
        <div className="flex justify-center mb-8">
          <div className="flex items-center">
            {steps.map((label, index) => (
              <div key={label} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    activeStep >= index 
                      ? 'bg-primary text-white border-primary' 
                      : 'border-gray-300 text-gray-500'
                  }`}
                >
                  {activeStep > index ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div 
                    className={`h-1 w-12 mx-1 ${
                      activeStep > index ? 'bg-black' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        
        <CardContent className="p-0">
          {getStepContent(activeStep)}
        </CardContent>
      </div>
      
      <CardFooter className="p-6 flex justify-between border-t">
        <Button
          variant="outline"
          onClick={activeStep === 0 ? onCancel : handleBack}
          disabled={isProcessing || (activeStep === 1 && paymentState === 'success')}
        >
          {activeStep === 0 ? 'Batal' : 'Kembali'}
        </Button>
        
        <Button
          onClick={handleNext}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
              Memproses...
            </>
          ) : activeStep === 0 ? (
            'Lanjutkan'
          ) : paymentState === 'input' ? (
            'Lanjutkan ke Konfirmasi'
          ) : paymentState === 'confirming' ? (
            'Proses Pembayaran'
          ) : (
            'Selesai'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

// Payment Confirmation Step Component
const PaymentConfirmationStep = ({ 
  paymentData, 
  orderNumber,
  customerName,
  orderTotal,
  paidAmount,
  remainingAmount 
}: { 
  paymentData: PaymentData; 
  orderNumber: string;
  customerName: string;
  orderTotal: number;
  paidAmount: number;
  remainingAmount: number;
}) => {
  return (
    <div className="space-y-6 p-4 border rounded-lg">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-1">Konfirmasi Pembayaran</h3>
        <p className="text-muted-foreground">Silakan periksa detail pembayaran sebelum melanjutkan</p>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Nomor Order:</span>
          <span className="font-medium">{orderNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Pelanggan:</span>
          <span className="font-medium">{customerName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total Order:</span>
          <span className="font-medium">{formatRupiah(orderTotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Sudah Dibayar:</span>
          <span className="font-medium">{formatRupiah(paidAmount)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Sisa Tagihan:</span>
          <span className="font-medium">{formatRupiah(remainingAmount)}</span>
        </div>
        <hr />
        <div className="flex justify-between">
          <span className="text-muted-foreground">Metode Pembayaran:</span>
          <span className="font-medium">{paymentData.paymentMethod}</span>
        </div>
        {paymentData.transactionId && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">ID Transaksi:</span>
            <span className="font-medium">{paymentData.transactionId}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-muted-foreground">Jumlah Pembayaran:</span>
          <span className="font-medium">{formatRupiah(paymentData.amount || 0)}</span>
        </div>
        {paymentData.notes && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Catatan:</span>
            <span className="font-medium">{paymentData.notes}</span>
          </div>
        )}
      </div>
      
      <div className="p-3 bg-muted rounded-lg text-sm">
        <p>Pastikan jumlah pembayaran dan metode pembayaran sudah benar sebelum melanjutkan.</p>
      </div>
    </div>
  );
}

// Payment Success Step Component
const PaymentSuccessStep = ({ 
  payment, 
  orderNumber,
  customerName
}: { 
  payment: any; 
  orderNumber: string;
  customerName: string;
}) => {
  return (
    <div className="space-y-6 p-6 border rounded-lg text-center">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">Pembayaran Berhasil!</h3>
        <p className="text-muted-foreground">Pembayaran untuk order {orderNumber} telah berhasil diproses.</p>
      </div>
      
      <div className="bg-muted p-4 rounded-lg space-y-3 text-left">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Pelanggan:</span>
          <span className="font-medium">{customerName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Jumlah:</span>
          <span className="font-medium">{formatRupiah(payment.amount)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Metode Pembayaran:</span>
          <span className="font-medium">{payment.paymentMethod}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tanggal & Waktu:</span>
          <span className="font-medium">{new Date(payment.date).toLocaleString('id-ID')}</span>
        </div>
        {payment.transactionId && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">ID Transaksi:</span>
            <span className="font-medium">{payment.transactionId}</span>
          </div>
        )}
      </div>
      
      <div className="space-y-4 pt-4">
        <p className="text-sm text-muted-foreground">
          Anda akan menerima bukti pembayaran melalui email.
        </p>
        <div className="flex justify-center space-x-3">
          <Button variant="outline" onClick={() => window.print()}>
            Cetak Bukti
          </Button>
        </div>
      </div>
    </div>
  );
} 