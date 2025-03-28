'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import OrderFlow from '@/components/orders/OrderFlow';
import { Alert } from '@mui/material';
import PageHeader from '@/components/PageHeader';

export default function NewOrderPage() {
  const router = useRouter();
  const [success, setSuccess] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <PageHeader title="Buat Pesanan Baru" />
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Pesanan berhasil dibuat!
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <OrderFlow 
        onComplete={(orderId) => {
          setSuccess(true);
        }}
      />
    </div>
  );
} 