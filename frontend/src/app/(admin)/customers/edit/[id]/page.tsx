'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box, Container, Typography, Paper, Button, CircularProgress, 
  Alert, IconButton, TextField, Grid
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { getCustomerById, updateCustomer, Customer, UpdateCustomerDto } from '@/api/customers';

export default function EditCustomerPage() {
  const router = useRouter();
  const { id } = useParams();
  const customerId = Array.isArray(id) ? id[0] : id;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<UpdateCustomerDto>({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Ambil data pelanggan
  useEffect(() => {
    const fetchCustomerDetail = async () => {
      if (!customerId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await getCustomerById(customerId);
        setCustomer(data);
        setFormValues({
          name: data.name || '',
          phone: data.phone || '',
          email: data.email || '',
          address: data.address || '',
          notes: data.notes || ''
        });
      } catch (err) {
        console.error('Error fetching customer:', err);
        setError('Terjadi kesalahan saat mengambil data pelanggan');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCustomerDetail();
  }, [customerId]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validasi form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formValues.name || !formValues.name.trim()) {
      errors.name = 'Nama pelanggan wajib diisi';
    }
    
    if (!formValues.phone || !formValues.phone.trim()) {
      errors.phone = 'Nomor telepon wajib diisi';
    } else if (formValues.phone && !/^[0-9]{10,15}$/.test(formValues.phone.trim())) {
      errors.phone = 'Nomor telepon tidak valid';
    }
    
    if (formValues.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email)) {
      errors.email = 'Format email tidak valid';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle kembali ke detail pelanggan
  const handleGoBack = () => {
    router.back();
  };

  // Handle submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!customerId) return;
    
    setSaving(true);
    
    try {
      await updateCustomer(customerId, formValues);
      router.push(`/customers/${customerId}`);
    } catch (err) {
      console.error('Error updating customer:', err);
      setError('Terjadi kesalahan saat menyimpan data pelanggan');
      setSaving(false);
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

  if (error && !customer) {
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

  return (
    <Container maxWidth="md">
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={handleGoBack}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">
          Edit Pelanggan
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Form */}
      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              name="name"
              label="Nama Pelanggan *"
              fullWidth
              value={formValues.name}
              onChange={handleInputChange}
              error={!!formErrors.name}
              helperText={formErrors.name}
              disabled={saving}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              name="phone"
              label="Nomor Telepon *"
              fullWidth
              value={formValues.phone}
              onChange={handleInputChange}
              error={!!formErrors.phone}
              helperText={formErrors.phone}
              disabled={saving}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              name="email"
              label="Email"
              type="email"
              fullWidth
              value={formValues.email}
              onChange={handleInputChange}
              error={!!formErrors.email}
              helperText={formErrors.email}
              disabled={saving}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              name="address"
              label="Alamat"
              fullWidth
              value={formValues.address}
              onChange={handleInputChange}
              disabled={saving}
              multiline
              rows={2}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              name="notes"
              label="Catatan"
              fullWidth
              value={formValues.notes}
              onChange={handleInputChange}
              disabled={saving}
              multiline
              rows={3}
              placeholder="Preferensi pelanggan, catatan khusus, dll."
            />
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={handleGoBack}
            disabled={saving}
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={saving}
            startIcon={saving && <CircularProgress size={20} color="inherit" />}
          >
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
} 