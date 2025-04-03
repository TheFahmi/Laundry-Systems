'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  Divider,
  CircularProgress,
  Chip,
  Alert,
  Card,
  CardContent,
  IconButton,
  Stack
} from '@mui/material';
import {
  ArrowBack,
  Receipt,
  AccountBalance,
  CreditCard,
  MonetizationOn,
  AccessTime,
  EventNote,
  CheckCircle,
  Cancel,
  Print,
  Launch
} from '@mui/icons-material';
import Link from 'next/link';
import { usePaymentDetails } from '@/services/usePaymentQuery';

// Utility functions
const getPaymentMethodDisplay = (method: string) => {
  switch (method?.toLowerCase()) {
    case 'cash':
      return { 
        text: 'Tunai', 
        icon: <MonetizationOn fontSize="small" /> 
      };
    case 'transfer':
      return { 
        text: 'Transfer Bank', 
        icon: <AccountBalance fontSize="small" /> 
      };
    case 'credit_card':
    case 'credit':
    case 'debit_card':
    case 'debit':
      return { 
        text: 'Kartu', 
        icon: <CreditCard fontSize="small" /> 
      };
    default:
      return { 
        text: method || 'Unknown', 
        icon: <Receipt fontSize="small" /> 
      };
  }
};

// Get status chip properties
const getStatusProperties = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'paid':
    case 'completed':
      return { 
        color: 'success', 
        text: 'Lunas', 
        icon: <CheckCircle fontSize="small" /> 
      };
    case 'pending':
      return { 
        color: 'warning', 
        text: 'Menunggu', 
        icon: <AccessTime fontSize="small" /> 
      };
    case 'cancelled':
    case 'failed':
      return { 
        color: 'error', 
        text: 'Gagal', 
        icon: <Cancel fontSize="small" /> 
      };
    case 'partial':
      return { 
        color: 'info', 
        text: 'Sebagian', 
        icon: <Receipt fontSize="small" /> 
      };
    default:
      return { 
        color: 'default', 
        text: status || 'Unknown', 
        icon: <Receipt fontSize="small" /> 
      };
  }
};

// Format date to Indonesian format
const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Format currency to Rupiah
const formatRupiah = (amount: number) => {
  if (!amount && amount !== 0) return 'Rp0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export default function PaymentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  
  // Use our custom hook with fixed implementation
  const { payment, isLoading, error, fetchPaymentDetails } = usePaymentDetails({ 
    id,
    autoFetch: true
  });
  
  // Additional state for direct API fallback
  const [directLoading, setDirectLoading] = useState(false);
  const [directPayment, setDirectPayment] = useState<any>(null);
  const [directError, setDirectError] = useState<string | null>(null);

  // If hook returns error, try direct API call as fallback
  useEffect(() => {
    if (error && !directLoading && !directPayment) {
      let isMounted = true;
      
      const fetchDirectly = async () => {
        try {
          setDirectLoading(true);
          console.log(`[PaymentDetailPage] Fetching payment directly: ${id}`);
          
          const response = await fetch(`/api/customers/payments/${id}`);
          
          if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
          }
          
          const data = await response.json();
          console.log(`[PaymentDetailPage] Direct fetch success:`, data);
          
          if (isMounted) {
            setDirectPayment(data);
            setDirectError(null);
          }
        } catch (err) {
          console.error('[PaymentDetailPage] Direct fetch error:', err);
          if (isMounted) {
            setDirectError(err instanceof Error ? err.message : 'Failed to load payment details');
          }
        } finally {
          if (isMounted) {
            setDirectLoading(false);
          }
        }
      };
      
      fetchDirectly();
      
      return () => { isMounted = false; };
    }
  }, [error, id, directPayment]);

  // Handle go back
  const handleGoBack = () => {
    router.push('/customer/payments');
  };

  // Print payment receipt
  const handlePrint = () => {
    window.print();
  };

  const isLoadingAny = isLoading || directLoading;
  const hasError = (error && directError) || (error && !directPayment);
  const paymentData = payment || directPayment;

  // Loading state
  if (isLoadingAny) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
      </Box>
    );
  }
  
  // Error state
  if (hasError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || directError || 'Terjadi kesalahan saat memuat detail pembayaran'}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={handleGoBack}
        >
          Kembali ke Daftar Pembayaran
        </Button>
      </Box>
    );
  }
  
  // No payment data
  if (!paymentData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Pembayaran tidak ditemukan (ID: {id})
        </Alert>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={handleGoBack}
          >
            Kembali ke Daftar Pembayaran
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => {
              console.log("Retry: Fetching payment", id);
              fetchPaymentDetails();
            }}
          >
            Coba Lagi
          </Button>
        </Stack>
      </Box>
    );
  }
  
  // Get payment status and method properties
  const statusProps = getStatusProperties(paymentData.status);
  const paymentMethodProps = getPaymentMethodDisplay(paymentData.paymentMethod);
  
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header & Navigation */}
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          variant="text"
          startIcon={<ArrowBack />}
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
        <Typography variant="body2" color="text.secondary">
          {paymentData.orderNumber || `Order ID: ${paymentData.orderId}`}
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
              <IconButton onClick={handlePrint} size="small" title="Cetak">
                <Print fontSize="small" />
              </IconButton>
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
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  ID Pembayaran
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {paymentData.id}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Tanggal & Waktu
                </Typography>
                <Typography variant="body1">
                  {formatDate(paymentData.createdAt)}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Jumlah
                </Typography>
                <Typography variant="h6" color="primary" fontWeight={700}>
                  {formatRupiah(paymentData.amount)}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Metode Pembayaran
                </Typography>
                <Box display="flex" alignItems="center">
                  {paymentMethodProps.icon}
                  <Typography variant="body1" sx={{ ml: 1 }}>
                    {paymentMethodProps.text}
                  </Typography>
                </Box>
                {paymentData.transactionId && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    ID Transaksi: {paymentData.transactionId}
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
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Nomor Pesanan
                  </Typography>
                  <Link 
                    href={`/customer/orders/${paymentData.orderId}`}
                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                  >
                    <EventNote sx={{ mr: 1, fontSize: 18 }} color="primary" />
                    <Typography variant="body1" color="primary" fontWeight={500}>
                      {paymentData.orderNumber || `Order ID: ${paymentData.orderId}`}
                    </Typography>
                  </Link>
                </Grid>
                
                {paymentData.notes && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Catatan
                    </Typography>
                    <Typography variant="body2">
                      {paymentData.notes}
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
                  startIcon={<Print />}
                  onClick={handlePrint}
                  fullWidth
                >
                  Cetak Bukti Pembayaran
                </Button>
                
                <Button
                  variant="outlined"
                  component={Link}
                  href={`/customer/orders/${paymentData.orderId}`}
                  startIcon={<Launch />}
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
        <Typography variant="caption" color="text.secondary">
          Bukti pembayaran ini dicetak pada {new Date().toLocaleString('id-ID')}. 
          Terima kasih telah menggunakan layanan kami.
        </Typography>
      </Box>
    </Container>
  );
} 