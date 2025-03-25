'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box, Container, Typography, Paper, Grid, Button, Divider,
  CircularProgress, Alert, Chip, IconButton, Dialog,
  DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationOnIcon,
  Notes as NotesIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { getCustomerById, deleteCustomer, Customer } from '@/api/customers';

// Helper function to format date safely
const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

export default function CustomerDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const customerId = Array.isArray(id) ? id[0] : id;
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Ambil data pelanggan
  useEffect(() => {
    const fetchCustomerDetail = async () => {
      if (!customerId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await getCustomerById(customerId);
        setCustomer(data);
      } catch (err) {
        console.error('Error fetching customer:', err);
        setError('Terjadi kesalahan saat mengambil data pelanggan');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCustomerDetail();
  }, [customerId]);

  // Handle kembali ke daftar pelanggan
  const handleGoBack = () => {
    router.back();
  };
  
  // Handle edit pelanggan
  const handleEditCustomer = () => {
    router.push(`/customers/edit/${customerId}`);
  };
  
  // Handle konfirmasi hapus pelanggan
  const handleDeleteConfirm = () => {
    setDeleteDialogOpen(true);
  };
  
  // Handle tutup dialog konfirmasi
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };
  
  // Handle hapus pelanggan
  const handleDeleteCustomer = async () => {
    if (!customerId) return;
    
    setDeleteLoading(true);
    
    try {
      await deleteCustomer(customerId);
      router.push('/customers');
    } catch (err) {
      console.error('Error deleting customer:', err);
      setError('Terjadi kesalahan saat menghapus pelanggan');
      setDeleteDialogOpen(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
        <Box sx={{ mt: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleGoBack}
          >
            Kembali
          </Button>
        </Box>
      </Container>
    );
  }

  if (!customer) {
    return (
      <Container maxWidth="md">
        <Alert severity="warning" sx={{ mt: 4 }}>
          Pelanggan tidak ditemukan
        </Alert>
        <Box sx={{ mt: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleGoBack}
          >
            Kembali
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={handleGoBack}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4">
            Detail Pelanggan
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteConfirm}
          >
            Hapus
          </Button>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={handleEditCustomer}
          >
            Edit
          </Button>
        </Box>
      </Box>
      
      {/* Customer Detail Card */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          {customer.name}
        </Typography>
        
        <Chip 
          label={`ID: ${customer.id}`} 
          size="small" 
          sx={{ mb: 3 }} 
        />
        
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          {/* Contact Information */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Informasi Kontak
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <PhoneIcon color="action" />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Nomor Telepon
                  </Typography>
                  <Typography variant="body1">
                    {customer.phone}
                  </Typography>
                </Box>
              </Box>
              
              {customer.email && (
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <EmailIcon color="action" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1">
                      {customer.email}
                    </Typography>
                  </Box>
                </Box>
              )}
              
              {customer.address && (
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <LocationOnIcon color="action" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Alamat
                    </Typography>
                    <Typography variant="body1">
                      {customer.address}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Grid>
          
          {/* Other Information */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Informasi Lainnya
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              {customer.notes && (
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <NotesIcon color="action" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Catatan
                    </Typography>
                    <Typography variant="body1">
                      {customer.notes}
                    </Typography>
                  </Box>
                </Box>
              )}
              
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Tanggal Daftar
                </Typography>
                <Typography variant="body1">
                  {customer.createdAt ? formatDate(customer.createdAt) : '-'}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Terakhir Diperbarui
                </Typography>
                <Typography variant="body1">
                  {customer.updatedAt ? formatDate(customer.updatedAt) : '-'}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>
          Konfirmasi Hapus Pelanggan
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Apakah Anda yakin ingin menghapus pelanggan <strong>{customer.name}</strong>? Tindakan ini tidak dapat dibatalkan.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseDeleteDialog} 
            disabled={deleteLoading}
          >
            Batal
          </Button>
          <Button 
            color="error" 
            onClick={handleDeleteCustomer} 
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={20} /> : null}
          >
            {deleteLoading ? 'Menghapus...' : 'Hapus'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 