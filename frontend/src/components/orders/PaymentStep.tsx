'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, 
  Banknote, 
  Building, 
  QrCode, 
  DollarSign, 
  Calculator, 
  ArrowLeft, 
  CheckCircle,
  Loader2
} from 'lucide-react';
import PaymentConfirmation from './PaymentConfirmation';

interface PaymentData {
  amount: number;
  change: number;
  method: string;
  status: string;
  referenceNumber?: string;
}

interface PaymentStepProps {
  orderData?: any; // Order data from parent
  paymentData?: PaymentData; // Payment data from parent
  total?: number; // Optional now, can be derived from orderData
  onPaymentUpdate: (paymentData: PaymentData) => void;
  onPaymentSubmit?: () => void; // Renamed from onProcessPayment
  onBack?: () => void; // Made optional
  isLoading: boolean;
  autoProcess?: boolean;
  error?: string | null; // Add error property
}

export default function PaymentStep({ 
  orderData,
  paymentData: initialPaymentData,
  total: propTotal, 
  onPaymentUpdate, 
  onPaymentSubmit, // Renamed from onProcessPayment
  onBack,
  isLoading,
  autoProcess = false,
  error
}: PaymentStepProps) {
  // Use total from orderData if available, otherwise use prop
  const total = orderData?.total || propTotal || 0;
  
  // Initialize state from props or defaults
  const [amount, setAmount] = useState<number>(initialPaymentData?.amount || total);
  const [method, setMethod] = useState<string>(initialPaymentData?.method || 'cash');
  const [change, setChange] = useState<number>(initialPaymentData?.change || 0);
  const [referenceNumber, setReferenceNumber] = useState<string>(initialPaymentData?.referenceNumber || `REF-${Date.now()}`);
  const [isProcessing, setIsProcessing] = useState(false);
  const prevPaymentDataRef = React.useRef('');
  const autoProcessRef = React.useRef(false);
  
  // Add state for confirmation dialog
  const [showConfirmation, setShowConfirmation] = useState(false);

  const quickAmounts = [
    { id: 'exact', value: total, label: 'Uang Pas' },
    { id: 'rp10k', value: 10000, label: 'Rp 10.000' },
    { id: 'rp20k', value: 20000, label: 'Rp 20.000' },
    { id: 'rp50k', value: 50000, label: 'Rp 50.000' },
    { id: 'rp100k', value: 100000, label: 'Rp 100.000' },
  ].filter(option => option.value >= total);

  // Initialize payment data when component mounts
  useEffect(() => {
    // Set initial payment data with the order total
    onPaymentUpdate({
      amount: total,
      change: 0,
      method,
      status: 'pending',
      referenceNumber
    });
    // Only run once on mount with the initial values
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Calculate change whenever amount or order total changes
    const calculatedChange = Math.max(0, amount - total);
    setChange(calculatedChange);
    
    // Update parent component with payment data - only when values actually change
    const paymentData = {
      amount,
      change: calculatedChange,
      method,
      status: 'pending',
      referenceNumber
    };
    
    // Use JSON.stringify to compare objects for equality
    const currentPaymentDataStr = JSON.stringify(paymentData);
    
    if (prevPaymentDataRef.current !== currentPaymentDataStr) {
      prevPaymentDataRef.current = currentPaymentDataStr;
      onPaymentUpdate(paymentData);
    }
  }, [amount, total, method, referenceNumber, onPaymentUpdate]);

  useEffect(() => {
    // Only run auto-process once when amount is enough and not already processing
    if (autoProcess && amount >= total && !isProcessing && !autoProcessRef.current && !isLoading) {
      // Add a check to make the auto-process optional and disabled by default
      if (false) { // Disabled auto-processing
        autoProcessRef.current = true;
        setTimeout(() => {
          handleProcessPayment({ preventDefault: () => {} } as React.MouseEvent);
        }, 500);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, total, autoProcess, isProcessing, isLoading]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setAmount(value);
  };

  const handleMethodChange = useCallback((value: string) => {
    setMethod(value);
  }, []);

  const handleReferenceNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReferenceNumber(e.target.value);
  };

  const handleQuickAmount = (value: number) => {
    setAmount(value);
    // Immediately update payment data when quick amount is selected
    onPaymentUpdate({
      amount: value,
      change: Math.max(0, value - total),
      method,
      status: 'pending',
      referenceNumber
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleProcessPayment = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Prevent multiple clicks
    if (isProcessing || isLoading) return;
    
    // Show confirmation dialog instead of directly processing
    setShowConfirmation(true);
  };
  
  // Add new handler for confirming the payment
  const handleConfirmPayment = () => {
    setIsProcessing(true);
    
    // Slight delay to ensure we don't get caught in a state update cycle
    setTimeout(() => {
      if (onPaymentSubmit) {
        onPaymentSubmit();
      }
      // Reset processing flag after a delay
      setTimeout(() => {
        setIsProcessing(false);
        setShowConfirmation(false);
      }, 100);
    }, 0);
  };
  
  // Add handler for closing the confirmation dialog
  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
  };

  // Memoize the payment method options to prevent rerenders
  const PaymentOptions = React.memo(({ currentMethod, onMethodChange }: { currentMethod: string, onMethodChange: (value: string) => void }) => (
    <div className="space-y-3">
      <Label className="flex items-center gap-2">
        <CreditCard className="h-4 w-4 text-purple-500" />
        Metode Pembayaran
      </Label>
      <RadioGroup 
        value={currentMethod} 
        onValueChange={onMethodChange}
        className="flex flex-col space-y-3"
      >
        <div className="flex items-center space-x-2 p-3 rounded-md border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
          <RadioGroupItem value="cash" id="cash" className="text-green-500 border-green-500" />
          <Label htmlFor="cash" className="flex items-center cursor-pointer">
            <Banknote className="h-4 w-4 text-green-500 mr-2" />
            Tunai
          </Label>
        </div>
        <div className="flex items-center space-x-2 p-3 rounded-md border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
          <RadioGroupItem value="transfer" id="transfer" className="text-blue-500 border-blue-500" />
          <Label htmlFor="transfer" className="flex items-center cursor-pointer">
            <Building className="h-4 w-4 text-blue-500 mr-2" />
            Transfer Bank
          </Label>
        </div>
        <div className="flex items-center space-x-2 p-3 rounded-md border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
          <RadioGroupItem value="qris" id="qris" className="text-purple-500 border-purple-500" />
          <Label htmlFor="qris" className="flex items-center cursor-pointer">
            <QrCode className="h-4 w-4 text-purple-500 mr-2" />
            QRIS
          </Label>
        </div>
      </RadioGroup>
    </div>
  ));

  // Memoize the quick amount buttons to prevent rerenders
  const QuickAmountButtons = React.memo(({ amounts, onSelect }: { 
    amounts: { id: string, value: number, label: string }[], 
    onSelect: (value: number) => void 
  }) => (
    <div className="flex flex-wrap gap-2">
      {amounts.map((option) => (
        <Button 
          key={option.id}
          variant="outline"
          size="sm"
          onClick={() => onSelect(option.value)}
          className={option.id === 'exact' ? "border-green-200 bg-green-50 hover:bg-green-100 text-green-700" : ""}
        >
          {option.label}
        </Button>
      ))}
    </div>
  ));

  // Add error display if provided
  const ErrorDisplay = error ? (
    <div className="bg-red-50 border border-red-200 text-red-800 rounded p-3 mb-4">
      <p className="text-sm">{error}</p>
    </div>
  ) : null;

  return (
    <div className="space-y-4">
      {ErrorDisplay}
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <PaymentOptions 
              currentMethod={method} 
              onMethodChange={handleMethodChange} 
            />

            {/* Reference Number Input - Only show for non-cash payments */}
            {method !== 'cash' && (
              <div className="mt-4 space-y-2">
                <Label htmlFor="reference-number" className="flex items-center">
                  <QrCode className="h-4 w-4 text-purple-500 mr-1" />
                  Nomor Referensi
                </Label>
                <Input
                  id="reference-number"
                  type="text"
                  value={referenceNumber}
                  onChange={handleReferenceNumberChange}
                  placeholder="Masukkan nomor referensi pembayaran"
                  className="border-purple-200 focus-visible:ring-purple-300"
                />
                <p className="text-xs text-gray-500">
                  Masukkan nomor referensi untuk pembayaran digital atau transfer bank
                </p>
              </div>
            )}
          </div>
          
          <div>
            <div className="space-y-4">
              <p className="text-sm font-medium flex items-center">
                <DollarSign className="h-4 w-4 text-blue-500 mr-1" />
                Total Pesanan: <span className="text-blue-700 ml-1">Rp {formatCurrency(total)}</span>
              </p>
              
              <div className="space-y-2">
                <Label htmlFor="payment-amount" className="flex items-center">
                  <DollarSign className="h-4 w-4 text-green-500 mr-1" />
                  Jumlah Pembayaran
                </Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 border border-r-0 border-input rounded-l-md bg-green-50 text-green-700 border-green-200">
                    Rp
                  </span>
                  <Input
                    id="payment-amount"
                    type="number"
                    value={amount || ''}
                    onChange={handleAmountChange}
                    className="rounded-l-none border-green-200 focus-visible:ring-green-300"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm flex items-center">
                  <Calculator className="h-4 w-4 text-amber-500 mr-1" />
                  Jumlah Cepat:
                </Label>
                <QuickAmountButtons 
                  amounts={quickAmounts} 
                  onSelect={handleQuickAmount} 
                />
              </div>
              
              <Card className="border-cyan-200 bg-cyan-50/50">
                <CardContent className="p-4">
                  <p className="font-medium flex items-center">
                    <Calculator className="h-4 w-4 text-cyan-500 mr-2" />
                    Kembalian: <span className="text-cyan-700 ml-1">Rp {formatCurrency(change)}</span>
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between mt-6">
          {onBack && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onBack}
              disabled={isLoading}
              className="flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Button>
          )}
          
          <Button 
            type="submit"
            onClick={handleProcessPayment}
            disabled={amount < total || isLoading || isProcessing}
            className="ml-auto bg-green-600 hover:bg-green-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Proses Pembayaran
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Payment Confirmation Dialog/Sheet */}
      <PaymentConfirmation
        isOpen={showConfirmation}
        onClose={handleCloseConfirmation}
        onConfirm={handleConfirmPayment}
        paymentData={{
          amount,
          change,
          method,
          status: 'pending',
          referenceNumber: method !== 'cash' ? referenceNumber : undefined
        }}
        orderTotal={total}
        isLoading={isLoading}
      />
    </div>
  );
} 