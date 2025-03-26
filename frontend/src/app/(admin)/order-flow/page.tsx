'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, Stepper, Step, StepLabel, Button, Typography, 
  Paper, Container, CircularProgress, Divider, Alert
} from '@mui/material';
import { toast } from 'react-toastify';
import OrderForm from '@/components/orders/OrderForm';
import PaymentForm, { PaymentMethod, PaymentStatus } from '@/components/payments/PaymentForm';
import PaymentConfirmation from '@/components/payments/PaymentConfirmation';

// Step definitions
const steps = ['Pilih Pelanggan & Layanan', 'Konfirmasi Order', 'Proses Pembayaran', 'Selesai'];

// Main Order Flow Component
export default function OrderFlow() {
  // State management
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Order and payment data
  const [orderData, setOrderData] = useState<any>(null);
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [customer, setCustomer] = useState<any>(null);
  
  // Tambahkan log debugging dan error handling
  useEffect(() => {
    // Function to check service API
    const checkServiceAPI = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/services?limit=1&page=1`);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Service API error:', errorData);
        } else {
          console.log('Service API check successful');
        }
      } catch (error) {
        console.error('Error checking service API:', error);
      }
    };
    
    checkServiceAPI();
  }, []);
  
  // Handler for OrderForm submission
  const handleOrderSubmit = async (data: any) => {
    setLoading(true);
    setError(null);
    setOrderData(data);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      console.log('Order data to submit:', data);
      
      // Create order in the backend
      const response = await fetch(`${apiUrl}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create order');
      }
      
      const orderResult = await response.json();
      console.log('Created order:', orderResult);
      setCreatedOrder(orderResult);
      
      // Fetch customer details
      if (data.customerId) {
        console.log('Fetching customer details for ID:', data.customerId);
        const customerResponse = await fetch(`${apiUrl}/customers/${data.customerId}`);
        
        if (customerResponse.ok) {
          const customerData = await customerResponse.json();
          console.log('Customer data fetched:', customerData);
          setCustomer(customerData);
        } else {
          console.error('Failed to fetch customer details');
          const errorData = await customerResponse.json();
          console.error(errorData);
        }
      }
      
      // Move to next step
      setActiveStep(1);
      toast.success('Order berhasil dibuat!');
    } catch (error: any) {
      console.error('Error creating order:', error);
      setError(error.message || 'Gagal membuat order');
      toast.error('Gagal membuat order');
    } finally {
      setLoading(false);
    }
  };
  
  // Handler for payment process
  const handlePaymentSubmit = async (data: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      // Process payment in the backend
      const response = await fetch(`${apiUrl}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          orderId: createdOrder.id,
          customerId: customer.id,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process payment');
      }
      
      const paymentResult = await response.json();
      setPaymentData(paymentResult);
      
      // Move to final step
      setActiveStep(3);
      toast.success('Pembayaran berhasil diproses!');
    } catch (error: any) {
      console.error('Error processing payment:', error);
      setError(error.message || 'Gagal memproses pembayaran');
      toast.error('Gagal memproses pembayaran');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle next step
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };
  
  // Handle previous step
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  // Handle reset to start over
  const handleReset = () => {
    setActiveStep(0);
    setOrderData(null);
    setCreatedOrder(null);
    setPaymentData(null);
    setCustomer(null);
    setError(null);
  };
  
  // Calculate order total
  const calculateTotal = (items: any[]) => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  // Render current step content
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <OrderForm 
            onSubmit={handleOrderSubmit}
            onCancel={() => {}}
            isLoading={loading}
          />
        );
        
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Konfirmasi Pesanan
            </Typography>
            
            {createdOrder && (
              <Paper sx={{ p: 3, mb: 3 }}>
                {/* Order Details */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Detail Order
                  </Typography>
                  <Typography variant="body2">
                    <strong>Order ID:</strong> {createdOrder.id}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Status:</strong> {createdOrder.status}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Tanggal:</strong> {new Date(createdOrder.created_at).toLocaleString()}
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                {/* Customer Details */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Detail Pelanggan
                  </Typography>
                  {customer && (
                    <>
                      <Typography variant="body2">
                        <strong>Nama:</strong> {customer.name}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Telepon:</strong> {customer.phone}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Alamat:</strong> {customer.address}
                      </Typography>
                    </>
                  )}
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                {/* Order Items */}
                <Typography variant="subtitle1" gutterBottom>
                  Item Pesanan
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Layanan</th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>Jumlah</th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>Harga</th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {createdOrder.items.map((item: any, index: number) => (
                        <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                          <td style={{ padding: '8px' }}>{item.name}</td>
                          <td style={{ padding: '8px', textAlign: 'right' }}>{item.quantity}</td>
                          <td style={{ padding: '8px', textAlign: 'right' }}>Rp {item.price.toLocaleString()}</td>
                          <td style={{ padding: '8px', textAlign: 'right' }}>Rp {(item.quantity * item.price).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={3} style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>Total:</td>
                        <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>
                          Rp {calculateTotal(createdOrder.items).toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </Box>
                
                {createdOrder.notes && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Catatan
                    </Typography>
                    <Typography variant="body2">
                      {createdOrder.notes}
                    </Typography>
                  </Box>
                )}
              </Paper>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button onClick={handleBack} disabled={loading}>
                Kembali
              </Button>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleNext}
                disabled={loading}
              >
                Lanjut ke Pembayaran
              </Button>
            </Box>
          </Box>
        );
        
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Proses Pembayaran
            </Typography>
            
            <PaymentForm
              orderId={createdOrder?.id || ''}
              orderAmount={calculateTotal(createdOrder?.items || [])}
              customerId={customer?.id || ''}
              onSubmit={handlePaymentSubmit}
              onCancel={handleBack}
              isLoading={loading}
            />
          </Box>
        );
        
      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Pesanan Selesai
            </Typography>
            
            {paymentData && (
              <PaymentConfirmation
                payment={paymentData}
                orderDetails={{
                  orderNumber: createdOrder?.id.substring(0, 8).toUpperCase(),
                  customerName: customer?.name,
                  total: calculateTotal(createdOrder?.items || [])
                }}
              />
            )}
            
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleReset}
              >
                Buat Pesanan Baru
              </Button>
            </Box>
          </Box>
        );
        
      default:
        return 'Unknown step';
    }
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Proses Order Laundry
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {loading && activeStep !== 0 ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : (
          getStepContent(activeStep)
        )}
      </Paper>
    </Container>
  );
} 