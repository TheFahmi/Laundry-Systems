'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import OrderForm from '@/components/orders/OrderForm';

interface OrderItem {
  serviceId?: string;
  name: string;
  quantity: number;
  price: number;
}

interface OrderFormData {
  customerId: string;
  items: OrderItem[];
  notes: string;
}

export default function NewOrderPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: OrderFormData) => {
    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create order');
      }

      const data = await response.json();
      toast.success('Order created successfully');
      router.push(`/orders/${data.id}`);
    } catch (error: any) {
      console.error('Error creating order:', error);
      toast.error(error.message || 'Failed to create order');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Create New Order</h1>
      <OrderForm 
        onSubmit={handleSubmit} 
        onCancel={handleCancel} 
        isLoading={isLoading} 
      />
    </div>
  );
} 