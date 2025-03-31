'use client';

import { useState, useEffect } from 'react';
import {
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  Input
} from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Textarea
} from "@/components/ui/textarea";
import { Loader2 } from 'lucide-react';

export enum PaymentMethod {
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  TRANSFER = 'transfer',
  EWALLET = 'ewallet',
  OTHER = 'other'
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled'
}

interface PaymentFormProps {
  orderId: string;
  orderAmount: number;
  customerId: string;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
  initialData?: {
    id?: string;
    amount?: number;
    method?: PaymentMethod;
    status?: PaymentStatus;
    notes?: string;
  };
}

export default function PaymentForm({ 
  orderId, 
  orderAmount, 
  customerId, 
  onSubmit, 
  onCancel, 
  isLoading,
  initialData 
}: PaymentFormProps) {
  const [formValues, setFormValues] = useState({
    orderId: orderId,
    amount: initialData?.amount || orderAmount,
    paymentMethod: initialData?.method || PaymentMethod.CASH,
    status: initialData?.status || PaymentStatus.COMPLETED,
    notes: initialData?.notes || '',
    transactionId: '',
    referenceNumber: `PAY-${Date.now().toString().substring(0, 10)}`
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle select change for payment method and status
  const handleSelectChange = (name: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formValues.amount || formValues.amount <= 0) {
      errors.amount = 'Jumlah pembayaran harus lebih dari 0';
    }
    
    if (!formValues.paymentMethod) {
      errors.paymentMethod = 'Metode pembayaran wajib dipilih';
    }
    
    if (!formValues.status) {
      errors.status = 'Status pembayaran wajib dipilih';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Prepare data for submission - only include fields needed for payment DTO
    const submitData = {
      orderId: formValues.orderId,
      amount: Number(formValues.amount),
      paymentMethod: formValues.paymentMethod,
      status: formValues.status,
      notes: formValues.notes,
      transactionId: formValues.transactionId,
      referenceNumber: formValues.referenceNumber
    };
    
    onSubmit(submitData);
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Informasi Pembayaran</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Order Summary */}
          <Card className="border">
            <CardContent className="p-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Detail Pesanan
              </h4>
              <div className="space-y-1">
                <p className="text-sm">
                  Order ID: {orderId}
                </p>
                <p className="text-sm">
                  Total: Rp {orderAmount.toLocaleString('id-ID')}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Payment Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Jumlah Pembayaran *</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                value={formValues.amount}
                onChange={handleInputChange}
                min={1}
                disabled={isLoading}
                required
              />
              {formErrors.amount && (
                <p className="text-destructive text-sm">{formErrors.amount}</p>
              )}
            </div>
            
            {/* Payment Method */}
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Metode Pembayaran *</Label>
              <Select 
                name="paymentMethod"
                value={formValues.paymentMethod} 
                onValueChange={(value) => handleSelectChange('paymentMethod', value)}
                disabled={isLoading}
              >
                <SelectTrigger id="paymentMethod">
                  <SelectValue placeholder="Pilih metode pembayaran" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PaymentMethod.CASH}>Tunai</SelectItem>
                  <SelectItem value={PaymentMethod.CREDIT_CARD}>Kartu Kredit</SelectItem>
                  <SelectItem value={PaymentMethod.DEBIT_CARD}>Kartu Debit</SelectItem>
                  <SelectItem value={PaymentMethod.TRANSFER}>Transfer Bank</SelectItem>
                  <SelectItem value={PaymentMethod.EWALLET}>E-Wallet</SelectItem>
                  <SelectItem value={PaymentMethod.OTHER}>Lainnya</SelectItem>
                </SelectContent>
              </Select>
              {formErrors.paymentMethod && (
                <p className="text-destructive text-sm">{formErrors.paymentMethod}</p>
              )}
            </div>
            
            {/* Payment Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status Pembayaran *</Label>
              <Select 
                name="status"
                value={formValues.status} 
                onValueChange={(value) => handleSelectChange('status', value)}
                disabled={isLoading}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Pilih status pembayaran" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PaymentStatus.PENDING}>Menunggu</SelectItem>
                  <SelectItem value={PaymentStatus.COMPLETED}>Selesai</SelectItem>
                  <SelectItem value={PaymentStatus.FAILED}>Gagal</SelectItem>
                  <SelectItem value={PaymentStatus.REFUNDED}>Dikembalikan</SelectItem>
                  <SelectItem value={PaymentStatus.CANCELLED}>Dibatalkan</SelectItem>
                </SelectContent>
              </Select>
              {formErrors.status && (
                <p className="text-destructive text-sm">{formErrors.status}</p>
              )}
            </div>
            
            {/* Transaction ID (for non-cash payments) */}
            {formValues.paymentMethod !== PaymentMethod.CASH && (
              <div className="space-y-2">
                <Label htmlFor="transactionId">ID Transaksi</Label>
                <Input
                  id="transactionId"
                  name="transactionId"
                  value={formValues.transactionId}
                  onChange={handleInputChange}
                  placeholder="ID transaksi dari payment gateway"
                  disabled={isLoading}
                />
              </div>
            )}
            
            {/* Notes */}
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="notes">Catatan</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Catatan tambahan (opsional)"
                value={formValues.notes}
                onChange={handleInputChange}
                disabled={isLoading}
                rows={3}
              />
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Batal
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : 'Simpan Pembayaran'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
} 