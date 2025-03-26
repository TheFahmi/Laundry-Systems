'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import PaymentForm, { PaymentMethod, PaymentStatus } from '@/components/payments/PaymentForm';
import PaymentConfirmation from '@/components/payments/PaymentConfirmation';
import { Box, CircularProgress, Typography, Button } from '@mui/material';

interface OrderItem {
  serviceId: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  customerId: string;
  customerName?: string;
  items: OrderItem[];
  total?: number;
  status: string;
  created_at: string;
}

interface Payment {
  id: string;
  orderId: string;
  customerId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  notes?: string;
  transactionId?: string;
  created_at: string;
  updated_at: string;
}

export default function OrderPaymentPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [existingPayments, setExistingPayments] = useState<Payment[]>([]);
  const [customer, setCustomer] = useState<any>(null);
  const [processedPayment, setProcessedPayment] = useState<Payment | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderAndPayments = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        
        // Fetch order details
        const orderResponse = await fetch(`${apiUrl}/orders/${params.id}`);
        if (!orderResponse.ok) {
          throw new Error('Failed to fetch order');
        }
        const orderData = await orderResponse.json();
        setOrder(orderData);
        
        // Fetch customer details
        if (orderData.customerId) {
          const customerResponse = await fetch(`${apiUrl}/customers/${orderData.customerId}`);
          if (customerResponse.ok) {
            const customerData = await customerResponse.json();
            setCustomer(customerData);
            
            // Add customer name to order data
            orderData.customerName = customerData.name;
          }
        }
        
        // Fetch existing payments for this order
        const paymentsResponse = await fetch(`${apiUrl}/payments/order/${params.id}`);
        if (paymentsResponse.ok) {
          const paymentsData = await paymentsResponse.json();
          
          // Convert API response to ensure enum types are correct
          const typedPayments = paymentsData.map((payment: any) => ({
            ...payment,
            method: payment.method as PaymentMethod,
            status: payment.status as PaymentStatus
          }));
          
          setExistingPayments(typedPayments);
          
          // If there are completed payments, show the most recent one
          const completedPayments = typedPayments.filter((p: Payment) => p.status === PaymentStatus.COMPLETED);
          if (completedPayments.length > 0) {
            setProcessedPayment(completedPayments[completedPayments.length - 1]);
          }
        }
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setError(error.message || 'Error fetching order details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrderAndPayments();
  }, [params.id]);

  const calculateOrderTotal = (items: OrderItem[]) => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleSubmit = async (formData: any) => {
    setIsProcessing(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          orderId: params.id,
          customerId: order?.customerId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process payment');
      }

      const data = await response.json();
      toast.success('Payment processed successfully');
      
      // Ensure correct enum types
      setProcessedPayment({
        ...data,
        method: data.method as PaymentMethod,
        status: data.status as PaymentStatus
      });
    } catch (error: any) {
      console.error('Error processing payment:', error);
      toast.error(error.message || 'Failed to process payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const handleBackToForm = () => {
    setProcessedPayment(null);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" p={4}>
        <Typography color="error" variant="h6" gutterBottom>
          {error}
        </Typography>
        <Button variant="contained" onClick={() => router.push('/orders')}>
          Back to Orders
        </Button>
      </Box>
    );
  }

  if (!order) {
    return (
      <Box textAlign="center" p={4}>
        <Typography variant="h6" gutterBottom>
          Order not found
        </Typography>
        <Button variant="contained" onClick={() => router.push('/orders')}>
          Back to Orders
        </Button>
      </Box>
    );
  }

  // Calculate total if not provided
  const orderTotal = order.total || calculateOrderTotal(order.items);

  if (processedPayment) {
    return (
      <Box className="container mx-auto p-4">
        <Typography variant="h4" gutterBottom>
          Payment Receipt
        </Typography>
        
        <PaymentConfirmation 
          payment={processedPayment}
          orderDetails={{
            orderNumber: order.id.substring(0, 8).toUpperCase(),
            customerName: customer?.name,
            total: orderTotal
          }}
        />
        
        <Box textAlign="center" mt={4}>
          <Button variant="outlined" onClick={handleBackToForm}>
            Process Another Payment
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box className="container mx-auto p-4">
      <Typography variant="h4" gutterBottom>
        Process Payment
      </Typography>
      
      {existingPayments.length > 0 && (
        <Box mb={4}>
          <Typography variant="subtitle1" gutterBottom>
            This order has {existingPayments.length} existing payment(s)
          </Typography>
        </Box>
      )}
      
      <PaymentForm 
        orderId={params.id}
        orderAmount={orderTotal}
        customerId={order.customerId}
        onSubmit={handleSubmit} 
        onCancel={handleCancel} 
        isLoading={isProcessing}
      />
    </Box>
  );
} 