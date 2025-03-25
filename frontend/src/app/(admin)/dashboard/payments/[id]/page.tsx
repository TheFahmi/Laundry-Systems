'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Container, Paper, Box, Typography, Grid, Divider,
  Button, Chip, CircularProgress, Alert, Dialog,
  DialogActions, DialogContent, DialogContentText,
  DialogTitle, TextField, MenuItem
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { getPaymentById, updatePayment, deletePayment, UpdatePaymentDto, Payment } from '@/api/payments';

// Terjemahan status pembayaran
const statusLabels: Record<string, string> = {
  'pending': 'Tertunda',
  'completed': 'Selesai',
  'failed': 'Gagal',
  'refunded': 'Dikembalikan',
};

// Terjemahan metode pembayaran
const methodLabels: Record<string, string> = {
  'cash': 'Tunai',
  'credit_card': 'Kartu Kredit',
  'bank_transfer': 'Transfer Bank',
  'e_wallet': 'E-Wallet',
};

// Status chip colors
const statusColors: Record<string, string> = {
  'pending': 'warning',
  'completed': 'success',
  'failed': 'error',
  'refunded': 'info',
};

export default function PaymentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editedPayment, setEditedPayment] = useState<UpdatePaymentDto>({});
  
  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Fetch payment detail
  useEffect(() => {
    const fetchPaymentDetail = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await getPaymentById(id);
        setPayment(data);
        setEditedPayment({
          status: data.status,
          notes: data.notes || ''
        });
      } catch (err) {
        console.error('Error fetching payment details:', err);
        setError('Terjadi kesalahan saat mengambil detail pembayaran');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPaymentDetail();
  }, [id]);
  
  // Handle edit payment
  const handleEdit = async () => {
    try {
      setLoading(true);
      const updatedPayment = await updatePayment(id, editedPayment);
      setPayment(updatedPayment);
      setIsEditing(false);
      setLoading(false);
    } catch (err) {
      console.error('Error updating payment:', err);
      setError('Terjadi kesalahan saat memperbarui pembayaran');
      setLoading(false);
    }
  };
  
  // Handle delete payment
  const handleDelete = async () => {
    try {
      setLoading(true);
      await deletePayment(id);
      setDeleteDialogOpen(false);
      router.push('/payments');
    } catch (err) {
      console.error('Error deleting payment:', err);
      setError('Terjadi kesalahan saat menghapus pembayaran');
      setLoading(false);
    }
  };
  
  // Handle input change
  const handleInputChange = (field: keyof UpdatePaymentDto) => 
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setEditedPayment({
        ...editedPayment,
        [field]: event.target.value
      });
    };
  
  // Go back to payments list
  const handleBack = () => {
    router.push('/payments');
  };
  
  if (loading && !payment) {
    return (
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  if (error && !payment) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ my: 3 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          Kembali
        </Button>
      </Container>
    );
  }
  
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
          {/* Header */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            mb: 3 
          }}>
            <Box>
              <Typography variant="h5" gutterBottom>
                Detail Pembayaran
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ID: {payment?.id}
              </Typography>
            </Box>
            
            <Box>
              <Chip 
                label={statusLabels[payment?.status] || payment?.status} 
                color={(statusColors[payment?.status] as "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning") || "default"}
              />
            </Box>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}
          
          {/* Payment Details */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                ID Order
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {payment?.orderId}
              </Typography>
              
              <Typography variant="subtitle2" color="text.secondary">
                Tanggal Pembayaran
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {payment?.createdAt && format(new Date(payment.createdAt), 'dd MMMM yyyy, HH:mm')}
              </Typography>
              
              <Typography variant="subtitle2" color="text.secondary">
                Metode Pembayaran
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {methodLabels[payment?.method] || payment?.method}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Jumlah
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, fontWeight: 'bold' }}>
                Rp {payment?.amount?.toLocaleString()}
              </Typography>
              
              {payment?.customerName && (
                <>
                  <Typography variant="subtitle2" color="text.secondary">
                    Nama Pelanggan
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {payment.customerName}
                  </Typography>
                </>
              )}
              
              {payment?.transactionId && (
                <>
                  <Typography variant="subtitle2" color="text.secondary">
                    ID Transaksi
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {payment.transactionId}
                  </Typography>
                </>
              )}
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">
                Catatan
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {payment?.notes || '-'}
              </Typography>
            </Grid>
          </Grid>
          
          {/* Edit Form */}
          {isEditing && (
            <Box sx={{ mt: 3 }}>
              <Divider sx={{ mb: 3 }} />
              <Typography variant="h6" gutterBottom>
                Edit Pembayaran
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Status Pembayaran"
                    value={editedPayment.status || ''}
                    onChange={handleInputChange('status')}
                    margin="normal"
                  >
                    <MenuItem value="pending">Tertunda</MenuItem>
                    <MenuItem value="completed">Selesai</MenuItem>
                    <MenuItem value="failed">Gagal</MenuItem>
                    <MenuItem value="refunded">Dikembalikan</MenuItem>
                  </TextField>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Catatan"
                    value={editedPayment.notes || ''}
                    onChange={handleInputChange('notes')}
                    margin="normal"
                    multiline
                    rows={3}
                  />
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleEdit}
                  disabled={loading}
                >
                  Simpan Perubahan
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                >
                  Batal
                </Button>
              </Box>
            </Box>
          )}
          
          {/* Actions */}
          {!isEditing && (
            <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => setIsEditing(true)}
              >
                Edit
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteDialogOpen(true)}
              >
                Hapus
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Konfirmasi Hapus</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Apakah Anda yakin ingin menghapus data pembayaran ini? 
            Tindakan ini tidak dapat dibatalkan.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)} 
            autoFocus
          >
            Batal
          </Button>
          <Button 
            onClick={handleDelete} 
            color="error"
          >
            Hapus
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 