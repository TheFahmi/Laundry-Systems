'use client';

import {
  Box, Paper, Button, Typography,
  Card, CardContent, Grid, Divider,
  Chip
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { PaymentMethod, PaymentStatus } from './PaymentForm';

interface PaymentConfirmationProps {
  payment: {
    id: string;
    orderId: string;
    customerId: string;
    amount: number;
    method: PaymentMethod;
    status: PaymentStatus;
    notes?: string;
    transactionId?: string;
    created_at: string;
  };
  orderDetails?: {
    orderNumber?: string;
    customerName?: string;
    total?: number;
  };
}

export default function PaymentConfirmation({ payment, orderDetails }: PaymentConfirmationProps) {
  const router = useRouter();
  
  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // Get payment method display text
  const getPaymentMethodText = (method: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.CASH: return 'Tunai';
      case PaymentMethod.CREDIT_CARD: return 'Kartu Kredit';
      case PaymentMethod.DEBIT_CARD: return 'Kartu Debit';
      case PaymentMethod.TRANSFER: return 'Transfer Bank';
      case PaymentMethod.EWALLET: return 'E-Wallet';
      case PaymentMethod.OTHER: return 'Lainnya';
      default: return method;
    }
  };
  
  // Get status display
  const getStatusDisplay = (status: PaymentStatus) => {
    let color = 'default';
    switch (status) {
      case PaymentStatus.COMPLETED: 
        color = 'success';
        break;
      case PaymentStatus.PENDING: 
        color = 'warning';
        break;
      case PaymentStatus.FAILED: 
        color = 'error';
        break;
      case PaymentStatus.REFUNDED: 
        color = 'info';
        break;
      case PaymentStatus.CANCELLED: 
        color = 'default';
        break;
    }
    
    return (
      <Chip 
        label={status.charAt(0).toUpperCase() + status.slice(1)} 
        color={color as any} 
        variant="outlined" 
        size="small" 
      />
    );
  };
  
  const handleViewOrder = () => {
    router.push(`/orders/${payment.orderId}`);
  };
  
  const handlePrintReceipt = () => {
    window.print();
  };
  
  const handleBackToOrders = () => {
    router.push('/orders');
  };
  
  return (
    <Paper sx={{ p: 3, width: '100%', maxWidth: '800px', mx: 'auto' }} id="payment-receipt">
      <Box className="print-section">
        <Typography variant="h5" align="center" gutterBottom>
          Bukti Pembayaran
        </Typography>
        
        {/* Payment ID and Date */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="body2">
            <strong>Payment ID:</strong> {payment.id}
          </Typography>
          <Typography variant="body2">
            <strong>Tanggal:</strong> {formatDate(payment.created_at)}
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {/* Order and Customer Details */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Detail Pesanan
                </Typography>
                <Typography variant="body2">
                  <strong>Order ID:</strong> {payment.orderId}
                </Typography>
                {orderDetails?.orderNumber && (
                  <Typography variant="body2">
                    <strong>Nomor Pesanan:</strong> {orderDetails.orderNumber}
                  </Typography>
                )}
                {orderDetails?.total && (
                  <Typography variant="body2">
                    <strong>Total Pesanan:</strong> Rp {orderDetails.total.toLocaleString()}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Detail Pelanggan
                </Typography>
                <Typography variant="body2">
                  <strong>Customer ID:</strong> {payment.customerId}
                </Typography>
                {orderDetails?.customerName && (
                  <Typography variant="body2">
                    <strong>Nama:</strong> {orderDetails.customerName}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Payment Details */}
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Detail Pembayaran
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  <strong>Jumlah:</strong> Rp {payment.amount.toLocaleString()}
                </Typography>
                <Typography variant="body2">
                  <strong>Metode:</strong> {getPaymentMethodText(payment.method)}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  <strong>Status:</strong> {getStatusDisplay(payment.status)}
                </Typography>
                {payment.transactionId && (
                  <Typography variant="body2">
                    <strong>ID Transaksi:</strong> {payment.transactionId}
                  </Typography>
                )}
              </Grid>
              
              {payment.notes && (
                <Grid item xs={12}>
                  <Typography variant="body2">
                    <strong>Catatan:</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {payment.notes}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
        
        <Divider sx={{ mb: 3 }} />
        
        {/* Footer */}
        <Typography variant="body2" align="center" sx={{ mb: 2 }}>
          Terima kasih telah menggunakan layanan kami!
        </Typography>
      </Box>
      
      {/* Actions - not printed */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }} className="no-print">
        <Button variant="outlined" onClick={handleBackToOrders}>
          Kembali ke Daftar Order
        </Button>
        <Button variant="outlined" onClick={handleViewOrder}>
          Lihat Order
        </Button>
        <Button variant="contained" onClick={handlePrintReceipt}>
          Cetak Bukti Pembayaran
        </Button>
      </Box>
      
      {/* Print-only styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-section, .print-section * {
            visibility: visible;
          }
          .no-print {
            display: none;
          }
          .print-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </Paper>
  );
} 