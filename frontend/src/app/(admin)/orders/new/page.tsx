'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import OrderFlow from '@/components/orders/OrderFlow';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";

// Helper function to check if code is running in browser
const isBrowser = typeof window !== 'undefined';

export default function NewOrderPage() {
  const router = useRouter();
  const [success, setSuccess] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-4">Buat Pesanan Baru</h1>
      </div>
      
      {success && (
        <Alert className="mb-4 border-green-500 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100">
          <CheckCircle2 className="h-4 w-4 text-green-500 dark:text-green-400" />
          <AlertTitle>Sukses</AlertTitle>
          <AlertDescription>
            Pesanan berhasil dibuat!
          </AlertDescription>
        </Alert>
      )}
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}
      
      <OrderFlow 
        onComplete={(orderId) => {
          setSuccess(true);
          // Ensure all localStorage data is cleared when order is completed
          if (isBrowser) {
            localStorage.removeItem('orderActiveStep');
            localStorage.removeItem('orderData');
            localStorage.removeItem('orderPaymentData');
            localStorage.removeItem('orderItems');
            localStorage.removeItem('orderSkipPayment');
            localStorage.removeItem('createdOrder');
            
            // Remove any other order-related items
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && key.startsWith('order')) {
                keysToRemove.push(key);
              }
            }
            
            // Remove collected keys to avoid issues with changing localStorage during iteration
            keysToRemove.forEach(key => localStorage.removeItem(key));
          }
        }}
      />
    </div>
  );
} 