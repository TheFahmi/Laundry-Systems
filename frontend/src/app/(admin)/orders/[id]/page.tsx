'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Box, Typography, Paper, Grid, Chip, Button, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, CircularProgress, Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

// Tipe data untuk Order
interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface OrderItem {
  id: string;
  serviceName: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  totalPrice: number;
  price: number;
  subtotal: number;
}

interface Payment {
  id: string;
  referenceNumber?: string;
  amount: number;
  method: string;
  status: string;
  createdAt: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  customer: Customer;
  items: OrderItem[];
  payments: Payment[];
  createdAt: string;
  updatedAt: string;
}

// Tipe untuk status pesanan
const orderStatusMap: Record<string, { label: string; color: string }> = {
  'new': { label: 'Baru', color: 'info' },
  'processing': { label: 'Diproses', color: 'secondary' },
  'washing': { label: 'Dicuci', color: 'primary' },
  'drying': { label: 'Dikeringkan', color: 'warning' },
  'folding': { label: 'Dilipat', color: 'warning' },
  'ready': { label: 'Siap Diambil', color: 'success' },
  'delivered': { label: 'Terkirim', color: 'default' },
  'cancelled': { label: 'Dibatalkan', color: 'error' }
};

// Add a helper function to format currency consistently
const formatCurrency = (amount: number) => {
  // Format to 2 decimal places and ensure it's a number
  const value = typeof amount === 'number' ? amount : Number(amount) || 0;
  
  // Format with Indonesian locale, 0 decimal places
  return new Intl.NumberFormat('id-ID', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add method and status label mappings
  const methodLabels: Record<string, string> = {
    'cash': 'Tunai',
    'credit_card': 'Kartu Kredit',
    'debit_card': 'Kartu Debit',
    'transfer': 'Transfer Bank',
    'ewallet': 'E-Wallet',
    'other': 'Lainnya'
  };

  const statusLabels: Record<string, string> = {
    'pending': 'Menunggu',
    'completed': 'Selesai',
    'failed': 'Gagal',
    'refunded': 'Dikembalikan',
    'cancelled': 'Dibatalkan'
  };

  const statusColors: Record<string, string> = {
    'pending': 'warning',
    'completed': 'success',
    'failed': 'error',
    'refunded': 'info',
    'cancelled': 'default'
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        // Endpoint yang benar untuk API orders
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/orders/${params.id}`);
        
        if (!response.ok) {
          throw new Error('Gagal mengambil data pesanan');
        }
        
        const data = await response.json();
        setOrder(data);
      } catch (err: Error | unknown) {
        console.error('Error fetching order:', err);
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengambil data');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchOrder();
    }
  }, [params.id]);

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBack}
          sx={{ mt: 2 }}
        >
          Kembali
        </Button>
      </Box>
    );
  }

  if (!order) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="warning">Pesanan tidak ditemukan</Alert>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBack}
          sx={{ mt: 2 }}
        >
          Kembali
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={handleBack}
        sx={{ mb: 2 }}
      >
        Kembali ke Daftar Pesanan
      </Button>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>
              Detail Pesanan
            </Typography>
            <Typography variant="body1">
              ID: {order.orderNumber || order.id}
            </Typography>
            <Typography variant="body1">
              Tanggal Pesanan: {format(new Date(order.createdAt), 'dd MMMM yyyy HH:mm', { locale: id })}
            </Typography>
            <Typography variant="body1">
              Status: 
              <Chip 
                size="small"
                label={orderStatusMap[order.status]?.label || order.status}
                color={orderStatusMap[order.status]?.color as 'info' | 'secondary' | 'primary' | 'warning' | 'success' | 'default' | 'error' || 'default'}
                sx={{ ml: 1 }}
              />
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Informasi Pelanggan
            </Typography>
            {order.customer && (
              <>
                <Typography variant="body1">
                  Nama: {order.customer.name}
                </Typography>
                <Typography variant="body1">
                  Telepon: {order.customer.phone || '-'}
                </Typography>
                <Typography variant="body1">
                  Email: {order.customer.email || '-'}
                </Typography>
              </>
            )}
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Item Pesanan
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Layanan</TableCell>
                <TableCell align="right">Berat/Jumlah</TableCell>
                <TableCell align="right">Harga</TableCell>
                <TableCell align="right">Subtotal</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {order.items && order.items.length > 0 ? (
                order.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.serviceName}</TableCell>
                    <TableCell align="right">{item.quantity} {item.unit || 'pcs'}</TableCell>
                    <TableCell align="right">Rp {formatCurrency((item.price || item.unitPrice || 0))}</TableCell>
                    <TableCell align="right">Rp {formatCurrency((item.subtotal || item.totalPrice || 0))}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">Tidak ada item</TableCell>
                </TableRow>
              )}
              <TableRow>
                <TableCell colSpan={3} align="right"><strong>Total:</strong></TableCell>
                <TableCell align="right"><strong>Rp {formatCurrency(order.totalAmount || 0)}</strong></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Informasi Pembayaran
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID Pembayaran</TableCell>
                <TableCell>Tanggal</TableCell>
                <TableCell>Metode</TableCell>
                <TableCell align="right">Jumlah</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {order.payments && order.payments.length > 0 ? (
                order.payments.map((payment, index) => (
                  <TableRow key={index}>
                    <TableCell>{payment.referenceNumber || payment.id}</TableCell>
                    <TableCell>{format(new Date(payment.createdAt), 'dd MMM yyyy', { locale: id })}</TableCell>
                    <TableCell>{methodLabels[payment.method] || payment.method}</TableCell>
                    <TableCell align="right">Rp {formatCurrency(payment.amount)}</TableCell>
                    <TableCell>
                      <Chip 
                        size="small"
                        label={statusLabels[payment.status] || payment.status}
                        color={statusColors[payment.status] as "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" || "default"}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">Belum ada pembayaran</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
} 