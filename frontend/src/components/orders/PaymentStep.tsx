'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';

interface PaymentData {
  amount: number;
  change: number;
  method: string;
  status: string;
}

interface PaymentStepProps {
  total: number;
  onPaymentUpdate: (paymentData: PaymentData) => void;
  onProcessPayment: () => void;
  onBack: () => void;
  isLoading: boolean;
  autoProcess?: boolean;
}

export default function PaymentStep({ 
  total, 
  onPaymentUpdate, 
  onProcessPayment, 
  onBack,
  isLoading,
  autoProcess = false
}: PaymentStepProps) {
  const [amount, setAmount] = useState<number>(total);
  const [method, setMethod] = useState<string>('cash');
  const [change, setChange] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const prevPaymentDataRef = React.useRef('');
  const autoProcessRef = React.useRef(false);

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
      status: 'pending'
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
      status: 'pending'
    };
    
    // Use JSON.stringify to compare objects for equality
    const currentPaymentDataStr = JSON.stringify(paymentData);
    
    if (prevPaymentDataRef.current !== currentPaymentDataStr) {
      prevPaymentDataRef.current = currentPaymentDataStr;
      onPaymentUpdate(paymentData);
    }
  }, [amount, total, method, onPaymentUpdate]);

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

  const handleQuickAmount = (value: number) => {
    setAmount(value);
    // Immediately update payment data when quick amount is selected
    onPaymentUpdate({
      amount: value,
      change: Math.max(0, value - total),
      method,
      status: 'pending'
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
    
    setIsProcessing(true);
    
    // Slight delay to ensure we don't get caught in a state update cycle
    setTimeout(() => {
      onProcessPayment();
      // Reset processing flag after a delay
      setTimeout(() => {
        setIsProcessing(false);
      }, 100);
    }, 0);
  };

  // Memoize the payment method options to prevent rerenders
  const PaymentOptions = React.memo(({ currentMethod, onMethodChange }: { currentMethod: string, onMethodChange: (value: string) => void }) => (
    <div className="space-y-3">
      <Label>Metode Pembayaran</Label>
      <RadioGroup 
        value={currentMethod} 
        onValueChange={onMethodChange}
        className="flex flex-col space-y-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="cash" id="cash" />
          <Label htmlFor="cash">Tunai</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="transfer" id="transfer" />
          <Label htmlFor="transfer">Transfer Bank</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="qris" id="qris" />
          <Label htmlFor="qris">QRIS</Label>
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
        >
          {option.label}
        </Button>
      ))}
    </div>
  ));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <PaymentOptions 
            currentMethod={method} 
            onMethodChange={handleMethodChange} 
          />
        </div>
        
        <div>
          <div className="space-y-4">
            <p className="text-sm font-medium">
              Total Pesanan: Rp {formatCurrency(total)}
            </p>
            
            <div className="space-y-2">
              <Label htmlFor="payment-amount">Jumlah Pembayaran</Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 border border-r-0 border-input rounded-l-md bg-muted text-muted-foreground">
                  Rp
                </span>
                <Input
                  id="payment-amount"
                  type="number"
                  value={amount || ''}
                  onChange={handleAmountChange}
                  className="rounded-l-none"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm">Jumlah Cepat:</Label>
              <QuickAmountButtons 
                amounts={quickAmounts} 
                onSelect={handleQuickAmount} 
              />
            </div>
            
            <Card>
              <CardContent className="p-4">
                <p className="font-medium">
                  Kembalian: Rp {formatCurrency(change)}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} type="button">
          Kembali
        </Button>
        <Button 
          onClick={handleProcessPayment} 
          disabled={isLoading || isProcessing || amount < total}
        >
          {isLoading || isProcessing ? (
            <>
              <div className="mr-2 animate-spin">⟳</div>
              Memproses...
            </>
          ) : (
            "Proses Pembayaran"
          )}
        </Button>
      </div>
    </div>
  );
} 