'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container, Paper, Box, Typography, Grid, TextField,
  Button, MenuItem, CircularProgress, Alert, Divider
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { createPayment, CreatePaymentDto } from '@/api/payments';

export default function CreatePaymentPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState<CreatePaymentDto>({
    orderId: '',
    method: 'cash',
    status: 'pending',
    amount: 0,
    notes: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Handle input change
  const handleInputChange = (field: keyof CreatePaymentDto) => 
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({
        ...formData,
        [field]: field === 'amount' ? Number(event.target.value) : event.target.value
      });
    };
  
  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await createPayment(formData);
      router.push(`/payments/${response.id}`);
    } catch (err) {
      console.error('Error creating payment:', err);
      setError('Terjadi kesalahan saat membuat pembayaran baru');
      setLoading(false);
    }
  };
  
  // Go back to payments list
  const handleBack = () => {
    router.push('/payments');
  };
  
  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 4 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mb: 2 }}
        >
          Kembali ke Daftar
        </Button>
        
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Buat Pembayaran Baru
          </Typography>
          
          <Divider sx={{ mb: 3 }} />
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="ID Order"
                  value={formData.orderId}
                  onChange={handleInputChange('orderId')}
                  margin="normal"
                  helperText="Masukkan ID order yang akan dibayar"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Jumlah Pembayaran"
                  type="number"
                  value={formData.amount}
                  onChange={handleInputChange('amount')}
                  margin="normal"
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>Rp</Typography>
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  required
                  fullWidth
                  label="Metode Pembayaran"
                  value={formData.method}
                  onChange={handleInputChange('method')}
                  margin="normal"
                >
                  <MenuItem value="cash">Tunai</MenuItem>
                  <MenuItem value="credit_card">Kartu Kredit</MenuItem>
                  <MenuItem value="bank_transfer">Transfer Bank</MenuItem>
                  <MenuItem value="e_wallet">E-Wallet</MenuItem>
                </TextField>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  select
                  required
                  fullWidth
                  label="Status Pembayaran"
                  value={formData.status}
                  onChange={handleInputChange('status')}
                  margin="normal"
                >
                  <MenuItem value="pending">Tertunda</MenuItem>
                  <MenuItem value="completed">Selesai</MenuItem>
                  <MenuItem value="failed">Gagal</MenuItem>
                </TextField>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="ID Transaksi (opsional)"
                  value={formData.transactionId || ''}
                  onChange={handleInputChange('transactionId')}
                  margin="normal"
                  helperText="ID transaksi dari penyedia layanan pembayaran (jika ada)"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Catatan (opsional)"
                  value={formData.notes || ''}
                  onChange={handleInputChange('notes')}
                  margin="normal"
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <CircularProgress size={24} sx={{ mr: 1 }} />
                    Menyimpan...
                  </>
                ) : 'Simpan Pembayaran'}
              </Button>
              <Button
                variant="outlined"
                onClick={handleBack}
                disabled={loading}
              >
                Batal
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
} 