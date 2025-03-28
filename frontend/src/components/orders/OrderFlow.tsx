import React, { useState } from 'react';
import {
  Box, Paper, Stepper, Step, StepLabel, Button, Typography,
  CircularProgress, Alert, TextField, Grid, Divider
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import CustomerSelect from './CustomerSelect';
import ServiceSelect from './ServiceSelect';
import OrderSummary from './OrderSummary';
import PaymentStep from './PaymentStep';
import OrderConfirmation from './OrderConfirmation';

interface Service {
  id: string;
  name: string;
  price: number;
  priceModel?: 'per_kg' | 'per_piece' | 'flat_rate';
}

interface OrderItem {
  serviceId?: string;
  id?: string;
  serviceName: string;
  quantity: number;
  price: number;
  weightBased?: boolean;
  weight?: number;
  subtotal: number;
  service?: Service;
}

interface PaymentData {
  amount: number;
  change: number;
  method: string;
}

interface OrderFlowProps {
  onComplete?: (orderId: string) => void;
}

export default function OrderFlow({ onComplete }: OrderFlowProps) {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState({
    customerId: '',
    customerName: '',
    items: [] as OrderItem[],
    notes: '',
    total: 0
  });
  const [paymentData, setPaymentData] = useState<PaymentData>({
    amount: 0,
    change: 0,
    method: 'cash'
  });
  const [createdOrder, setCreatedOrder] = useState<{
    id: string;
    orderNumber: string;
    createdAt: string;
  } | null>(null);

  const steps = ['Pilih Pelanggan', 'Pilih Layanan', 'Detail Pesanan', 'Konfirmasi', 'Pembayaran', 'Selesai'];

  // Calculate subtotal correctly for weight-based items
  const calculateSubtotal = (item: OrderItem): number => {
    if (item.weightBased && item.weight !== undefined) {
      // For weight-based items, use weight
      return item.price * item.weight;
    } else {
      // For regular items, use quantity
      return item.price * item.quantity;
    }
  };

  // Calculate total amount considering weightBased items
  const calculateTotal = (items: OrderItem[]): number => {
    console.log("Calculating total from items:", items);
    
    const total = items.reduce((sum, item) => {
      // Use the subtotal directly from each item
      console.log(`Item ${item.serviceName} subtotal: ${item.subtotal}`);
      return sum + (item.subtotal || 0);
    }, 0);

    console.log("Final total:", total);
    return total;
  };

  // Handler untuk pemilihan pelanggan
  const handleCustomerSelect = (customerId: string, customerName: string) => {
    setOrderData(prev => ({
      ...prev,
      customerId,
      customerName
    }));
    handleNext();
  };

  // Handler untuk pemilihan layanan
  const handleServiceSelect = (items: OrderItem[]) => {
    // Keep the original items data and just ensure subtotal is calculated
    const itemsWithSubtotal = items.map(item => {
      // Calculate subtotal based on weight or quantity
      const subtotal = item.weightBased && item.weight !== undefined
        ? Math.round(item.price * item.weight)
        : item.price * item.quantity;
      
      console.log(`Calculating subtotal for ${item.serviceName}:`, {
        weightBased: item.weightBased,
        weight: item.weight,
        quantity: item.quantity,
        price: item.price,
        subtotal
      });
      
      return {
        ...item,
        subtotal
      };
    });
    
    const total = calculateTotal(itemsWithSubtotal);
    console.log("Setting order data with total:", total);
    
    setOrderData(prev => ({
      ...prev,
      items: itemsWithSubtotal,
      total
    }));
    handleNext();
  };

  // Handler untuk detail pesanan
  const handleOrderDetails = () => {
    handleNext();
  };

  // Handler untuk pembayaran
  const handlePaymentUpdate = (payment: PaymentData) => {
    setPaymentData(payment);
  };

  // Handler untuk konfirmasi dan submit pesanan
  const handleConfirmOrder = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      // Process items to include weight for weight-based items
      const processedItems = orderData.items.map(item => {
        // Base item properties
        const processedItem: any = {
          serviceId: item.serviceId,
          quantity: item.quantity,
          price: item.price
        };
        
        // Add weight property for weight-based items
        if (item.weightBased) {
          processedItem.weightBased = true;
          processedItem.weight = item.weight || 0.5;
          
          // For backend compatibility, we set quantity to 1 for weight-based items
          // but preserve the actual weight in the weight property
          processedItem.quantity = 1;
          
          console.log(`Processing weight-based item: ${item.serviceName}, Weight: ${processedItem.weight}kg`);
        }
        
        return processedItem;
      });
      
      // Create payload
      const payload = {
        customerId: orderData.customerId,
        items: processedItems,
        notes: orderData.notes,
        total: calculateTotal(orderData.items),
        payment: {
          amount: paymentData.amount,
          method: paymentData.method,
          change: paymentData.change
        }
      };

      console.log('Sending order payload:', JSON.stringify(payload));

      const response = await fetch(`${apiUrl}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal membuat pesanan');
      }

      const data = await response.json();
      toast.success('Pesanan berhasil dibuat!');
      
      // Set created order data
      setCreatedOrder({
        id: data.id || data.data?.id,
        orderNumber: data.orderNumber || data.data?.orderNumber || 'N/A',
        createdAt: new Date().toISOString()
      });
      
      // Move to completion step
      handleNext();
      
      // If onComplete callback is available, call it with the order ID
      if (onComplete) {
        onComplete(data.id || data.data?.id);
      }
    } catch (error: any) {
      console.error('Error creating order:', error);
      setError(error.message || 'Gagal membuat pesanan');
      toast.error(error.message || 'Gagal membuat pesanan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleCancel = () => {
    if (confirm('Apakah Anda yakin ingin membatalkan pembuatan pesanan ini?')) {
      router.push('/orders');
    }
  };

  // Render konten berdasarkan langkah aktif
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <CustomerSelect 
                 onSelect={handleCustomerSelect} 
                 selectedCustomerId={orderData.customerId} 
               />;
      case 1:
        return <ServiceSelect 
                 onSelect={handleServiceSelect} 
                 selectedItems={orderData.items} 
               />;
      case 2:
        return <Box sx={{ mt: 2 }}>
                 <Typography variant="h6" gutterBottom>Detail Pesanan</Typography>
                 <Typography variant="body1" gutterBottom>
                   Pelanggan: {orderData.customerName}
                 </Typography>
                 <Typography variant="body1" gutterBottom>
                   Total Item: {orderData.items.length}
                 </Typography>
                 <Typography variant="body1" gutterBottom>
                   Total Harga: Rp {orderData.total.toLocaleString('id-ID')}
                 </Typography>
                 <Box sx={{ mt: 2 }}>
                   <TextField
                     label="Catatan"
                     name="notes"
                     value={orderData.notes}
                     onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOrderData(prev => ({ ...prev, notes: e.target.value }))}
                     fullWidth
                     multiline
                     rows={4}
                   />
                 </Box>
               </Box>;
      case 3:
        return <OrderSummary 
                 orderData={orderData} 
               />;
      case 4:
        return <PaymentStep 
                 orderTotal={orderData.total}
                 onPaymentUpdate={handlePaymentUpdate}
                 paymentData={paymentData}
               />;
      case 5:
        return createdOrder ? (
          <OrderConfirmation
            orderId={createdOrder.id}
            orderNumber={createdOrder.orderNumber}
            customerName={orderData.customerName}
            totalAmount={orderData.total}
            items={orderData.items}
            paymentMethod={paymentData.method}
            paymentAmount={paymentData.amount}
            change={paymentData.change}
            createdAt={createdOrder.createdAt}
          />
        ) : null;
      default:
        return <div>Langkah tidak ditemukan</div>;
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Box>{getStepContent(activeStep)}</Box>
        
        {activeStep < 5 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button 
              onClick={handleCancel}
              sx={{ mr: 1 }}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Box>
              <Button
                disabled={activeStep === 0 || isLoading}
                onClick={handleBack}
                sx={{ mr: 1 }}
              >
                Kembali
              </Button>
              
              {activeStep === steps.length - 2 ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleConfirmOrder}
                  disabled={isLoading || paymentData.amount < orderData.total}
                >
                  {isLoading ? <CircularProgress size={24} /> : 'Konfirmasi & Buat Pesanan'}
                </Button>
              ) : activeStep === steps.length - 3 ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                >
                  Lanjut ke Pembayaran
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                  disabled={
                    (activeStep === 0 && !orderData.customerId) ||
                    (activeStep === 1 && orderData.items.length === 0) ||
                    isLoading
                  }
                >
                  Lanjut
                </Button>
              )}
            </Box>
          </Box>
        )}
        
        {activeStep === 5 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => router.push('/orders')}
            >
              Kembali ke Daftar Pesanan
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
} 