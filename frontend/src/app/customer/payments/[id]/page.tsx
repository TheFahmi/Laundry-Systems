'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  IconButton,
  Stack
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Receipt as ReceiptIcon,
  AccountBalance as BankIcon,
  CreditCard as CreditCardIcon,
  MonetizationOn as CashIcon,
  AccessTime as TimeIcon,
  EventNote as OrderIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Print as PrintIcon,
  FileDownload as DownloadIcon,
  Launch as LaunchIcon
} from '@mui/icons-material';
import Link from 'next/link';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { usePaymentDetails } from '@/services/usePaymentQuery';

// Format payment method display
const getPaymentMethodDisplay = (method: string) => {
  switch (method.toLowerCase()) {
    case 'cash':
      return { 
        text: 'Tunai', 
        icon: <CashIcon fontSize="small" /> 
      };
    case 'bank_transfer':
      return { 
        text: 'Transfer Bank', 
        icon: <BankIcon fontSize="small" /> 
      };
    case 'credit_card':
    case 'debit_card':
      return { 
        text: 'Kartu', 
        icon: <CreditCardIcon fontSize="small" /> 
      };
    default:
      return { 
        text: method, 
        icon: <ReceiptIcon fontSize="small" /> 
      };
  }
};

// Get status chip properties
const getStatusProperties = (status: string) => {
  switch (status.toLowerCase()) {
    case 'paid':
    case 'completed':
      return { 
        color: 'success', 
        text: 'Lunas', 
        icon: <CheckCircleIcon fontSize="small" /> 
      };
    case 'pending':
      return { 
        color: 'warning', 
        text: 'Menunggu', 
        icon: <TimeIcon fontSize="small" /> 
      };
    case 'failed':
      return { 
        color: 'error', 
        text: 'Gagal', 
        icon: <CancelIcon fontSize="small" /> 
      };
    case 'refunded':
      return { 
        color: 'info', 
        text: 'Dikembalikan', 
        icon: <ReceiptIcon fontSize="small" /> 
      };
    default:
      return { 
        color: 'default', 
        text: status, 
        icon: <ReceiptIcon fontSize="small" /> 
      };
  }
};

// Format date to Indonesian format
const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), 'dd MMMM yyyy, HH.mm', { locale: id });
  } catch (error) {
    return dateString;
  }
};

// Format currency to Rupiah
const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export default function PaymentDetailPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  
  // Fetch payment details
  const {
    data: payment,
    isLoading,
    isError,
    error
  } = usePaymentDetails(id);
  
  // Go back to payments list
  const handleGoBack = () => {
    router.push('/customer/payments');
  };
  
  // Handle print payment receipt
  const handlePrint = () => {
    window.print();
  };
  
  // Loading state
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
      </Box>
    );
  }
  
  // Error state
  if (isError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error instanceof Error ? error.message : 'Terjadi kesalahan saat memuat detail pembayaran'}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleGoBack}
        >
          Kembali ke Daftar Pembayaran
        </Button>
      </Box>
    );
  }
  
  // No payment data
  if (!payment) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Pembayaran tidak ditemukan
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleGoBack}
        >
          Kembali ke Daftar Pembayaran
        </Button>
      </Box>
    );
  }
  
  // Get payment status properties
  const statusProps = getStatusProperties(payment.status);
  const paymentMethodProps = getPaymentMethodDisplay(payment.paymentMethod);
  
  return (
    <Box>
      {/* Header & Navigation */}
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          variant="text"
          startIcon={<ArrowBackIcon />}
          onClick={handleGoBack}
          sx={{ mr: 2 }}
        >
          Kembali
        </Button>
        <Typography variant="h4" component="h1">
          Detail Pembayaran
        </Typography>
      </Box>
      
      {/* Print bar - Only visible when printing */}
      <Box 
        sx={{ 
          display: 'none', 
          '@media print': { 
            display: 'block',
            mb: 3,
            textAlign: 'center'
          }
        }}
      >
        <Typography variant="h5" gutterBottom>
          Bukti Pembayaran
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {payment.orderNumber || `Order ID: ${payment.orderId}`}
        </Typography>
      </Box>
      
      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Payment Summary */}
        <Grid item xs={12} md={8}>
          <Paper 
            sx={{ 
              p: 3, 
              position: 'relative',
              '@media print': {
                boxShadow: 'none',
                border: '1px solid #eee'
              }
            }}
          >
            {/* Action buttons - Hide when printing */}
            <Box 
              sx={{ 
                position: 'absolute', 
                top: 16, 
                right: 16,
                '@media print': { display: 'none' }
              }}
            >
              <Stack direction="row" spacing={1}>
                <IconButton onClick={handlePrint} size="small" title="Cetak">
                  <PrintIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Box>
            
            <Box display="flex" alignItems="center" mb={2}>
              <Typography variant="h6" component="h2">
                Informasi Pembayaran
              </Typography>
              <Chip
                icon={statusProps.icon}
                label={statusProps.text}
                color={statusProps.color as any}
                size="small"
                sx={{ ml: 2 }}
              />
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  ID Pembayaran
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {payment.id}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Tanggal & Waktu
                </Typography>
                <Typography variant="body1">
                  {formatDate(payment.createdAt)}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Jumlah
                </Typography>
                <Typography variant="h6" color="primary" fontWeight={700}>
                  {formatRupiah(payment.amount)}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Metode Pembayaran
                </Typography>
                <Box display="flex" alignItems="center">
                  {paymentMethodProps.icon}
                  <Typography variant="body1" sx={{ ml: 1 }}>
                    {paymentMethodProps.text}
                  </Typography>
                </Box>
                {payment.transactionId && (
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                    ID Transaksi: {payment.transactionId}
                  </Typography>
                )}
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 3 }} />
            
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Detail Pesanan
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Nomor Pesanan
                  </Typography>
                  <Link 
                    href={`/customer/orders/${payment.orderId}`}
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                  >
                    <OrderIcon sx={{ mr: 1, fontSize: 18 }} color="primary" />
                    <Typography variant="body1" color="primary" fontWeight={500}>
                      {payment.orderNumber || `Order ID: ${payment.orderId}`}
                    </Typography>
                  </Link>
                </Grid>
                
                {payment.notes && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Catatan
                    </Typography>
                    <Typography variant="body2">
                      {payment.notes}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Paper>
        </Grid>
        
        {/* Right Side Panel */}
        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ mb: 3, '@media print': { display: 'none' } }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Tindakan
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Stack spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<PrintIcon />}
                  onClick={handlePrint}
                  fullWidth
                >
                  Cetak Bukti Pembayaran
                </Button>
                
                <Button
                  variant="outlined"
                  component={Link}
                  href={`/customer/orders/${payment.orderId}`}
                  startIcon={<LaunchIcon />}
                  fullWidth
                >
                  Lihat Detail Pesanan
                </Button>
              </Stack>
            </CardContent>
          </Card>
          
          <Card variant="outlined" sx={{ '@media print': { display: 'none' } }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Bantuan
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="body2" paragraph>
                Jika Anda memiliki pertanyaan tentang pembayaran ini, silakan hubungi layanan pelanggan kami.
              </Typography>
              
              <Link href="/customer/help" style={{ textDecoration: 'none' }}>
                <Button
                  variant="text"
                  color="primary"
                  fullWidth
                >
                  Bantuan & FAQ
                </Button>
              </Link>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Print footer - Only visible when printing */}
      <Box 
        sx={{ 
          display: 'none', 
          '@media print': { 
            display: 'block',
            mt: 4,
            pt: 2,
            borderTop: '1px solid #eee',
            textAlign: 'center'
          }
        }}
      >
        <Typography variant="caption" color="textSecondary">
          Bukti pembayaran ini dicetak pada {new Date().toLocaleString('id-ID')}. 
          Terima kasih telah menggunakan layanan kami.
        </Typography>
      </Box>
    </Box>
  );
} 