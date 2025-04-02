'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Paper,
  TextField,
  Button,
  Grid,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Alert,
  InputAdornment,
  Divider
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { createPayment, PaymentMethod, PaymentStatus } from '@/api/payments';
import PageHeader from '@/components/ui/PageHeader';

// Interface untuk data form
interface PaymentFormData {
  orderId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  transactionId?: string;
  notes?: string;
}

// Schema validasi
const validationSchema = yup.object().shape({
  orderId: yup.string().required('ID Pesanan wajib diisi'),
  method: yup.string().required('Metode pembayaran wajib dipilih'),
  status: yup.string().required('Status pembayaran wajib dipilih'),
  amount: yup.number()
    .required('Jumlah pembayaran wajib diisi')
    .positive('Jumlah pembayaran harus lebih dari 0'),
  transactionId: yup.string(),
  notes: yup.string()
});

export default function NewPaymentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Inisialisasi react-hook-form
  const { control, handleSubmit, formState: { errors }, reset } = useForm<PaymentFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      orderId: '',
      method: 'cash',
      status: 'pending',
      amount: 0,
      transactionId: '',
      notes: ''
    }
  });

  // Handle form submission
  const onSubmit = async (data: PaymentFormData) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await createPayment(data);
      setSuccess('Pembayaran berhasil dibuat');
      reset();
      
      // Redirect setelah pembayaran berhasil dibuat
      setTimeout(() => {
        router.push('/payments');
      }, 2000);
    } catch (err: any) {
      console.error('Error creating payment:', err);
      setError(err.response?.data?.message || 'Terjadi kesalahan saat membuat pembayaran');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <PageHeader 
        title="Tambah Pembayaran Baru"
        backButton
      />
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}
      
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Controller
                name="orderId"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="ID Pesanan"
                    fullWidth
                    error={!!errors.orderId}
                    helperText={errors.orderId?.message}
                    disabled={loading}
                    required
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="method"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.method}>
                    <InputLabel id="payment-method-label">Metode Pembayaran</InputLabel>
                    <Select
                      {...field}
                      labelId="payment-method-label"
                      label="Metode Pembayaran"
                      disabled={loading}
                      required
                    >
                      <MenuItem value="cash">Tunai</MenuItem>
                      <MenuItem value="credit_card">Kartu Kredit</MenuItem>
                      <MenuItem value="bank_transfer">Transfer Bank</MenuItem>
                      <MenuItem value="e_wallet">E-Wallet</MenuItem>
                    </Select>
                    {errors.method && (
                      <FormHelperText>{errors.method.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.status}>
                    <InputLabel id="payment-status-label">Status Pembayaran</InputLabel>
                    <Select
                      {...field}
                      labelId="payment-status-label"
                      label="Status Pembayaran"
                      disabled={loading}
                      required
                    >
                      <MenuItem value="pending">Tertunda</MenuItem>
                      <MenuItem value="completed">Sukses</MenuItem>
                      <MenuItem value="failed">Gagal</MenuItem>
                      <MenuItem value="refunded">Refund</MenuItem>
                    </Select>
                    {errors.status && (
                      <FormHelperText>{errors.status.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Jumlah Pembayaran"
                    fullWidth
                    type="number"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
                    }}
                    error={!!errors.amount}
                    helperText={errors.amount?.message}
                    disabled={loading}
                    required
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Controller
                name="transactionId"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="ID Transaksi (opsional)"
                    fullWidth
                    error={!!errors.transactionId}
                    helperText={errors.transactionId?.message}
                    disabled={loading}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Catatan (opsional)"
                    fullWidth
                    multiline
                    rows={3}
                    error={!!errors.notes}
                    helperText={errors.notes?.message}
                    disabled={loading}
                  />
                )}
              />
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 4 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push('/payments')}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={loading}
            >
              {loading ? 'Menyimpan...' : 'Simpan Pembayaran'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
} 