import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Banknote, Building, QrCode, Clock, AlertCircle, CreditCard, Smartphone } from "lucide-react";
import BottomSheet from './BottomSheet';
import { PaymentStatus } from '@/types/payment';

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
  setPaymentData: (data: PaymentData) => void;
  orderTotal: number;
  isLoading: boolean;
}

export default function PaymentConfirmationSheet({
  isOpen,
  onClose,
  onConfirm,
  paymentData,
  setPaymentData,
  orderTotal,
  isLoading
}: PaymentConfirmationSheetProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState<'method' | 'confirm'>('method');

  // Handle opening and closing with animation
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Start the animation after a small delay to ensure the component is mounted
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      // Wait for the animation to complete before unmounting
      const timer = setTimeout(() => {
        setIsVisible(false);
        setStep('method'); // Reset to first step when closing
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

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
      case 'bank_transfer':
        return <Building className="h-5 w-5 text-blue-500" />;
      case 'qris':
      case 'ewallet':
        return <QrCode className="h-5 w-5 text-purple-500" />;
      case 'credit_card':
      case 'debit_card':
      case 'card':
        return <CreditCard className="h-5 w-5 text-orange-500" />;
      default:
        return <Banknote className="h-5 w-5 text-green-500" />;
    }
  };

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'cash':
        return 'Tunai';
      case 'transfer':
      case 'bank_transfer':
        return 'Transfer Bank';
      case 'qris':
      case 'ewallet':
        return 'E-Wallet';
      case 'credit_card':
        return 'Kartu Kredit';
      case 'debit_card':
        return 'Kartu Debit';
      case 'card':
        return 'Kartu Debit/Kredit';
      default:
        return 'Tunai';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case PaymentStatus.COMPLETED:
        return {
          bg: 'bg-green-50',
          border: 'border-green-100',
          text: 'text-green-700',
          icon: <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
        };
      case PaymentStatus.PENDING:
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-100',
          text: 'text-amber-700',
          icon: <Clock className="h-5 w-5 text-amber-500 mr-2" />
        };
      case PaymentStatus.FAILED:
        return {
          bg: 'bg-red-50',
          border: 'border-red-100',
          text: 'text-red-700',
          icon: <XCircle className="h-5 w-5 text-red-500 mr-2" />
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-100',
          text: 'text-gray-700',
          icon: <AlertCircle className="h-5 w-5 text-gray-500 mr-2" />
        };
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case PaymentStatus.COMPLETED:
        return 'Selesai';
      case PaymentStatus.PENDING:
        return 'Belum Dibayar';
      case PaymentStatus.FAILED:
        return 'Gagal';
      case PaymentStatus.REFUNDED:
        return 'Dikembalikan';
      case PaymentStatus.CANCELLED:
        return 'Dibatalkan';
      default:
        return 'Tidak Diketahui';
    }
  };

  const handleSelectPaymentMethod = (method: string) => {
    setPaymentData({ ...paymentData, method });
    setStep('confirm');
  };

  if (!isVisible) return null;

  const statusStyle = getStatusColor(paymentData.status);

  // Available payment methods
  const paymentMethods = [
    { id: 'cash', label: 'Tunai', icon: <Banknote className="h-5 w-5" /> },
    { id: 'bank_transfer', label: 'Transfer Bank', icon: <Building className="h-5 w-5" /> },
    { id: 'card', label: 'Kartu Debit/Kredit', icon: <CreditCard className="h-5 w-5" /> },
    { id: 'ewallet', label: 'E-Wallet', icon: <Smartphone className="h-5 w-5" /> },
  ];

  return (
    <BottomSheet 
      isOpen={isOpen} 
      onClose={onClose}
      title={step === 'method' ? "Pilih Metode Pembayaran" : "Konfirmasi Pembayaran"}
      description={step === 'method' 
        ? "Pilih metode pembayaran yang digunakan pelanggan" 
        : "Pastikan detail pembayaran di bawah ini sudah benar"}
      showHandle={true}
    >
      {step === 'method' ? (
        <div className="space-y-4 py-4 px-4">
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
            <span className="font-medium text-blue-700">Total Pesanan:</span>
            <span className="font-bold text-blue-800">Rp {formatCurrency(orderTotal)}</span>
          </div>
          
          <div className="space-y-2">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                className={`w-full flex items-center justify-between p-4 rounded-lg border 
                  ${paymentData.method === method.id 
                    ? 'border-primary bg-primary/5 text-primary' 
                    : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                onClick={() => handleSelectPaymentMethod(method.id)}
              >
                <div className="flex items-center">
                  <div className={`p-2 rounded-full mr-3 ${
                    paymentData.method === method.id 
                      ? 'bg-primary/10 text-primary' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {method.icon}
                  </div>
                  <span className="font-medium">{method.label}</span>
                </div>
                {paymentData.method === method.id && (
                  <CheckCircle className="h-5 w-5 text-primary" />
                )}
              </button>
            ))}
          </div>
          
          <div className="flex gap-3 mt-6">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Batal
            </Button>
            <Button 
              className="flex-1" 
              disabled={!paymentData.method} 
              onClick={() => setStep('confirm')}
            >
              Lanjut
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 py-4 px-4">
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
            <span className="font-medium text-blue-700">Total Pesanan:</span>
            <span className="font-bold text-blue-800">Rp {formatCurrency(orderTotal)}</span>
          </div>
          
          {/* Payment Status */}
          <div className={`p-3 rounded-lg border ${statusStyle.bg} ${statusStyle.border}`}>
            <div className="text-sm text-gray-500">Status Pembayaran</div>
            <div className={`flex items-center mt-1 font-medium ${statusStyle.text}`}>
              {statusStyle.icon}
              {getStatusLabel(paymentData.status)}
            </div>
            {paymentData.status === PaymentStatus.PENDING && (
              <p className="text-xs mt-1 text-amber-600">
                Pesanan ini akan ditandai sebagai belum dibayar. Pelanggan dapat membayar nanti.
              </p>
            )}
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
              <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                <div className="text-sm font-medium text-green-600">Kembalian</div>
                <div className="font-bold text-lg mt-1 text-green-700">Rp {formatCurrency(paymentData.change)}</div>
              </div>
            )}
            
            {paymentData.method !== 'cash' && paymentData.referenceNumber && (
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                <div className="text-sm text-purple-600">Nomor Referensi</div>
                <div className="font-medium mt-1 text-purple-700">{paymentData.referenceNumber}</div>
              </div>
            )}
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setStep('method')} 
              className="flex-1"
              disabled={isLoading}
            >
              Kembali
            </Button>
            <Button 
              onClick={onConfirm} 
              disabled={isLoading} 
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses...
                </>
              ) : (
                'Konfirmasi'
              )}
            </Button>
          </div>
        </div>
      )}
    </BottomSheet>
  );
}