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
import { Textarea } from '@/components/ui/textarea';

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
  onNotesChange?: (notes: string) => void;
}

export default function OrderConfirmation({
  orderData,
  onConfirm,
  onBack,
  isLoading,
  onSkipPayment,
  confirmButtonText,
  onNotesChange
}: OrderConfirmationProps) {
  const router = useRouter();
  // Set initial state but don't trigger effects immediately
  const [skipPayment, setSkipPayment] = React.useState(false);
  const [notes, setNotes] = React.useState(orderData.notes || '');
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

  // Update parent component when notes change
  useEffect(() => {
    if (onNotesChange && notes !== orderData.notes) {
      onNotesChange(notes);
    }
  }, [notes, orderData.notes, onNotesChange]);

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

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-green-50 rounded-full border-2 border-green-100">
          <CheckCircle2 className="h-8 w-8 text-green-500" />
        </div>
        <h2 className="text-2xl font-semibold mt-4">Konfirmasi Pesanan</h2>
        <p className="text-muted-foreground mt-1">Silakan periksa dan konfirmasi detail pesanan Anda</p>
      </div>
      
      <div className="space-y-5">
        {/* Customer Information - Enhanced */}
        <div className="rounded-md border p-4 bg-slate-50/50">
          <div className="flex items-center gap-2 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <h3 className="font-medium text-slate-800">Informasi Pelanggan</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-500">Nama</p>
              <p className="font-medium text-slate-900">{orderData.customerName}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Jumlah Item</p>
              <p className="font-medium text-slate-900">{orderData.items.length}</p>
            </div>
          </div>
        </div>
        
        <Separator />
        
        {/* Items List - Enhanced */}
        <div className="rounded-md border overflow-hidden">
          <div className="bg-slate-50 px-4 py-3 border-b">
            <h3 className="font-medium text-slate-800">Daftar Layanan</h3>
          </div>
          <Table>
            <TableHeader className="bg-slate-50/80">
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
                  <TableCell className="font-medium">{item.serviceName}</TableCell>
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
          <div className="bg-slate-50 p-4 flex justify-between items-center font-medium">
            <span className="text-slate-800">Total</span>
            <span className="text-slate-900 text-lg">Rp {formatCurrency(orderData.total)}</span>
          </div>
        </div>
        
        {/* Notes section with textarea for adding/editing notes - REDESIGNED */}
        <div className="rounded-md border p-4 bg-blue-50/50">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              <h3 className="font-medium text-blue-800">Catatan Pesanan</h3>
            </div>
            
            <div className="text-sm text-blue-700 mb-2">
              Tambahkan catatan untuk instruksi penanganan khusus, preferensi, atau informasi tambahan lainnya
            </div>
            
            <Textarea 
              id="order-notes"
              placeholder="Contoh: Pakaian putih diproses terpisah, seragam disetrika rapi, parfum minimal, dll."
              value={notes}
              onChange={handleNotesChange}
              className="min-h-[100px] bg-white border-blue-200 focus:border-blue-400 focus:ring-blue-400"
            />
          </div>
        </div>
        
        {/* Skip Payment section - REDESIGNED */}
        <div className="rounded-md border p-4 bg-violet-50/50">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-600">
                  <rect width="20" height="14" x="2" y="5" rx="2"/>
                  <line x1="2" x2="22" y1="10" y2="10"/>
                </svg>
                <h3 className="font-medium text-violet-800">Tunda Pembayaran</h3>
              </div>
              <p className="text-sm text-violet-700">
                Aktifkan opsi ini jika pelanggan akan membayar nanti
              </p>
            </div>
            <Switch
              id="skipPayment"
              checked={skipPayment}
              onCheckedChange={handleSkipPaymentChange}
              className="data-[state=checked]:bg-violet-600"
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-between pt-6 mt-6 border-t">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
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
          className="gap-2 min-w-32"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Memproses...
            </>
          ) : (
            <>
              {confirmButtonText || 'Konfirmasi Pesanan'}
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"/>
                <path d="m12 5 7 7-7 7"/>
              </svg>
            </>
          )}
        </Button>
      </div>
    </div>
  );
} 