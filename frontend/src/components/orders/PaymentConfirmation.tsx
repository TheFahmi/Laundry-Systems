import React, { useState, useEffect } from 'react';
import PaymentConfirmationModal from './PaymentConfirmationModal';
import PaymentConfirmationSheet from '../mobile/PaymentConfirmationSheet';

interface PaymentData {
  amount: number;
  change: number;
  method: string;
  status: string;
  referenceNumber?: string;
}

interface PaymentConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  paymentData: PaymentData;
  orderTotal: number;
  isLoading: boolean;
}

export default function PaymentConfirmation({
  isOpen,
  onClose,
  onConfirm,
  paymentData,
  orderTotal,
  isLoading
}: PaymentConfirmationProps) {
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if window is mobile size
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Check initially and when window resizes
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup event listener
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
  
  if (isMobile) {
    return (
      <PaymentConfirmationSheet
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={onConfirm}
        paymentData={paymentData}
        orderTotal={orderTotal}
        isLoading={isLoading}
      />
    );
  }
  
  return (
    <PaymentConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      paymentData={paymentData}
      orderTotal={orderTotal}
      isLoading={isLoading}
    />
  );
} 