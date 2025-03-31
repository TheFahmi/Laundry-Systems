'use client';

import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Input
} from "@/components/ui/input";
import {
  Textarea
} from "@/components/ui/textarea";
import { PaymentMethod } from './PaymentForm';

interface PaymentAmountStepProps {
  orderTotal: number;
  paidAmount: number;
  remainingAmount: number;
  amount: number;
  onAmountChange: (amount: number) => void;
  paymentMethod: PaymentMethod;
  transactionId: string;
  onTransactionIdChange: (id: string) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
}

export default function PaymentAmountStep({
  orderTotal,
  paidAmount,
  remainingAmount,
  amount,
  onAmountChange,
  paymentMethod,
  transactionId,
  onTransactionIdChange,
  notes,
  onNotesChange
}: PaymentAmountStepProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID').format(value);
  };

  // Common Indonesian cash denominations
  const denominations = [
    5000, 10000, 20000, 50000, 100000
  ];

  // Create common amount options based on remaining amount
  // Add exact amount option plus some common Indonesian denominations
  const quickAmounts = [
    ...(remainingAmount > 0 ? [{ value: remainingAmount, label: 'Bayar Pas', color: 'default' as const }] : []),
    ...denominations
      .filter(value => value >= remainingAmount && value <= Math.max(remainingAmount * 2, 100000))
      .map(value => ({ 
        value, 
        label: formatCurrency(value), 
        color: 'outline' as const 
      }))
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium mb-2">Jumlah Pembayaran</h3>
        <span className="text-sm text-muted-foreground">
          Sisa: Rp {formatCurrency(remainingAmount)}
        </span>
      </div>

      <div className="space-y-4">
        {/* Amount input and quick amounts */}
        <div>
          <div className="relative mb-3">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className="text-muted-foreground">Rp</span>
            </div>
            <Input
              type="number"
              value={amount}
              onChange={(e) => onAmountChange(Number(e.target.value))}
              placeholder="Masukkan jumlah"
              className="pl-8"
            />
          </div>
          
          {amount <= 0 && (
            <p className="text-destructive text-xs mb-2">Jumlah harus lebih dari 0</p>
          )}
          
          {/* Quick amount buttons */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {quickAmounts.map((option) => (
              <Button
                key={option.value}
                variant={option.color}
                size="sm"
                onClick={() => onAmountChange(option.value)}
                className={`h-9 ${option.color === 'default' ? 'bg-primary text-primary-foreground' : ''}`}
              >
                {option.value === remainingAmount ? option.label : `Rp ${option.label}`}
              </Button>
            ))}
          </div>
        </div>

        {/* Transaction ID for non-cash payments */}
        {paymentMethod !== PaymentMethod.CASH && (
          <div className="mb-3">
            <Label htmlFor="transaction-id">
              ID Transaksi
            </Label>
            <Input
              id="transaction-id"
              value={transactionId}
              onChange={(e) => onTransactionIdChange(e.target.value)}
              placeholder="Masukkan ID transaksi"
              className="mt-1"
            />
            {!transactionId && (
              <p className="text-destructive text-xs mt-1">Wajib diisi</p>
            )}
          </div>
        )}

        {/* Notes - optional */}
        <div>
          <Label htmlFor="payment-notes" className="flex justify-between">
            <span>Catatan</span>
            <span className="text-muted-foreground text-xs">Opsional</span>
          </Label>
          <Textarea
            id="payment-notes"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Tambahkan catatan jika perlu"
            rows={2}
            className="mt-1"
          />
        </div>

        {/* Payment Summary Card */}
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Bayar</span>
              <span className="text-xl font-medium">Rp {formatCurrency(amount)}</span>
            </div>
            
            {amount > remainingAmount && (
              <div className="flex items-center justify-between mt-2 text-amber-600">
                <span>Kembalian</span> 
                <span>Rp {formatCurrency(amount - remainingAmount)}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}