import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Banknote, Building, QrCode } from "lucide-react";

interface PaymentData {
  amount: number;
  change: number;
  method: string;
  status: string;
  referenceNumber?: string;
}

interface PaymentConfirmationSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  paymentData: PaymentData;
  orderTotal: number;
  isLoading: boolean;
}

export default function PaymentConfirmationSheet({
  isOpen,
  onClose,
  onConfirm,
  paymentData,
  orderTotal,
  isLoading
}: PaymentConfirmationSheetProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return <Banknote className="h-5 w-5 text-green-500" />;
      case 'transfer':
        return <Building className="h-5 w-5 text-blue-500" />;
      case 'qris':
        return <QrCode className="h-5 w-5 text-purple-500" />;
      default:
        return <Banknote className="h-5 w-5 text-green-500" />;
    }
  };

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'cash':
        return 'Tunai';
      case 'transfer':
        return 'Transfer Bank';
      case 'qris':
        return 'QRIS';
      default:
        return 'Tunai';
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="px-0 pb-0">
        <SheetHeader className="px-4">
          <SheetTitle className="text-center text-xl">Konfirmasi Pembayaran</SheetTitle>
          <SheetDescription className="text-center">
            Pastikan detail pembayaran di bawah ini sudah benar
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-4 py-4 px-4">
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
            <span className="font-medium text-blue-700">Total Pesanan:</span>
            <span className="font-bold text-blue-800">Rp {formatCurrency(orderTotal)}</span>
          </div>
          
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="text-sm text-gray-500">Metode Pembayaran</div>
              <div className="flex items-center mt-1">
                {getPaymentMethodIcon(paymentData.method)}
                <span className="ml-2 font-medium">{getPaymentMethodName(paymentData.method)}</span>
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="text-sm text-gray-500">Jumlah Dibayar</div>
              <div className="font-medium mt-1">Rp {formatCurrency(paymentData.amount)}</div>
            </div>
            
            {paymentData.change > 0 && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                <div className="text-sm text-green-600">Kembalian</div>
                <div className="font-medium mt-1 text-green-700">Rp {formatCurrency(paymentData.change)}</div>
              </div>
            )}
            
            {paymentData.method !== 'cash' && paymentData.referenceNumber && (
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                <div className="text-sm text-purple-600">Nomor Referensi</div>
                <div className="font-medium mt-1 text-purple-700">{paymentData.referenceNumber}</div>
              </div>
            )}
            
            {/* Payment Status Indicator */}
            <div className={`p-3 rounded-lg border ${
              paymentData.status === 'completed' 
                ? 'bg-green-50 border-green-100' 
                : paymentData.status === 'pending'
                  ? 'bg-yellow-50 border-yellow-100'
                  : 'bg-gray-50 border-gray-100'
            }`}>
              <div className={`text-sm ${
                paymentData.status === 'completed' 
                  ? 'text-green-600' 
                  : paymentData.status === 'pending'
                    ? 'text-yellow-600'
                    : 'text-gray-600'
              }`}>Status Pembayaran</div>
              <div className={`font-medium mt-1 ${
                paymentData.status === 'completed' 
                  ? 'text-green-700' 
                  : paymentData.status === 'pending'
                    ? 'text-yellow-700'
                    : 'text-gray-700'
              }`}>
                {paymentData.status === 'completed' 
                  ? 'Selesai' 
                  : paymentData.status === 'pending'
                    ? 'Menunggu Konfirmasi'
                    : 'Belum Diproses'}
              </div>
            </div>
          </div>
        </div>
        
        <SheetFooter className="flex flex-col border-t p-4">
          <Button 
            type="button" 
            onClick={onConfirm} 
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
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
                <CheckCircle className="mr-2 h-4 w-4" />
                Konfirmasi Pembayaran
              </>
            )}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose} className="w-full mt-2">
            <XCircle className="mr-2 h-4 w-4" />
            Batal
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
} 