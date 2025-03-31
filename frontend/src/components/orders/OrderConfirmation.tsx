'use client';

import React, { useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Printer, ExternalLink, CheckCircle2 } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface Service {
  id: string;
  name: string;
  price: number;
  priceModel?: 'per_kg' | 'per_piece' | 'flat_rate';
}

interface OrderItem {
  serviceId?: string;
  serviceName: string;
  quantity: number;
  price: number;
  weightBased?: boolean;
  weight?: number;
  subtotal: number;
  service?: Service;
}

interface OrderConfirmationProps {
  orderData: {
    customerId: string;
    customerName: string;
    items: OrderItem[];
    notes: string;
    total: number;
  };
  onConfirm: () => void;
  onBack: () => void;
  isLoading: boolean;
  onSkipPayment: (skip: boolean) => void;
  confirmButtonText?: string;
}

export default function OrderConfirmation({
  orderData,
  onConfirm,
  onBack,
  isLoading,
  onSkipPayment,
  confirmButtonText
}: OrderConfirmationProps) {
  const router = useRouter();
  // Set initial state but don't trigger effects immediately
  const [skipPayment, setSkipPayment] = React.useState(false);
  const initialRenderRef = React.useRef(true);
  // Add ref to track if we're processing a state change
  const isProcessingRef = React.useRef(false);

  // Only notify parent when skipPayment changes after initial render
  useEffect(() => {
    if (initialRenderRef.current) {
      initialRenderRef.current = false;
      return;
    }
    
    // Prevent unnecessary updates by adding this check
    if (!isProcessingRef.current) {
      isProcessingRef.current = true;
      // Simply notify parent of the change, but don't trigger automatic transitions
      onSkipPayment(skipPayment);
      // Reset processing flag after a short delay to allow state to settle
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 0);
    }
  }, [skipPayment, onSkipPayment]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleSkipPaymentChange = useCallback((checked: boolean) => {
    // Only update if the value has actually changed and we're not already processing
    if (checked !== skipPayment && !isProcessingRef.current) {
      setSkipPayment(checked);
    }
  }, [skipPayment]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center">
        <div className="border border-green-200 rounded-full bg-green-50 p-3">
          <CheckCircle2 className="h-6 w-6 text-green-500" />
        </div>
      </div>
      
      <div className="space-y-5">
        <h3 className="text-lg font-medium">Detail Pesanan</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Pelanggan</p>
            <p className="font-medium">{orderData.customerName}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Jumlah Item</p>
            <p className="font-medium">{orderData.items.length}</p>
          </div>
        </div>
        
        <Separator />
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Layanan</TableHead>
                <TableHead className="text-right">Jumlah/Berat</TableHead>
                <TableHead className="text-right">Harga</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderData.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.serviceName}</TableCell>
                  <TableCell className="text-right">
                    {item.weightBased ? `${item.weight} kg` : `${item.quantity}`}
                  </TableCell>
                  <TableCell className="text-right">
                    Rp {formatCurrency(item.price)}
                  </TableCell>
                  <TableCell className="text-right">
                    Rp {formatCurrency(item.subtotal)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="bg-muted/50 p-4 flex justify-between items-center">
            <span className="font-medium">Total</span>
            <span className="font-medium">Rp {formatCurrency(orderData.total)}</span>
          </div>
        </div>
        
        {orderData.notes && (
          <div>
            <h4 className="text-sm font-medium mb-1">Catatan</h4>
            <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
              {orderData.notes}
            </p>
          </div>
        )}
        
        <div className="flex items-center justify-between space-x-2 rounded-md border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="skipPayment">Tunda Pembayaran</Label>
            <p className="text-sm text-muted-foreground">
              Aktifkan opsi ini jika pelanggan akan membayar nanti
            </p>
          </div>
          <Switch
            id="skipPayment"
            checked={skipPayment}
            onCheckedChange={handleSkipPaymentChange}
          />
        </div>
      </div>
      
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Kembali
        </Button>
        <Button 
          onClick={(e) => {
            // Prevent any additional state updates during button click
            e.preventDefault();
            isProcessingRef.current = true;
            
            // Slight delay to ensure we don't get caught in a state update cycle
            setTimeout(() => {
              onConfirm();
              // Reset processing flag after execution
              setTimeout(() => {
                isProcessingRef.current = false;
              }, 100);
            }, 0);
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="mr-2 animate-spin">⟳</div>
              Memproses...
            </>
          ) : confirmButtonText ? (
            confirmButtonText
          ) : skipPayment ? (
            "Buat Pesanan"
          ) : (
            "Lanjut ke Pembayaran"
          )}
        </Button>
      </div>
    </div>
  );
} 