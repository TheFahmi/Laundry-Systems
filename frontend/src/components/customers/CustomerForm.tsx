'use client';

import { useState } from 'react';
import {
  Box, Paper, Button, CircularProgress, 
  TextField, Grid, Typography
} from '@mui/material';

interface CustomerFormProps {
  initialData?: {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    notes?: string;
  };
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export default function CustomerForm({ initialData, onSubmit, onCancel, isLoading }: CustomerFormProps) {
  const [formValues, setFormValues] = useState({
    name: initialData?.name || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    address: initialData?.address || '',
    notes: initialData?.notes || ''
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formValues.name || !formValues.name.trim()) {
      errors.name = 'Nama pelanggan wajib diisi';
    }
    
    if (!formValues.phone || !formValues.phone.trim()) {
      errors.phone = 'Nomor telepon wajib diisi';
    } else if (!/^[0-9]{10,15}$/.test(formValues.phone.trim())) {
      errors.phone = 'Nomor telepon tidak valid';
    }
    
    if (formValues.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email)) {
      errors.email = 'Format email tidak valid';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    onSubmit(formValues);
  };

  return (
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
            disabled={isLoading}
            required
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
            disabled={isLoading}
            required
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
            disabled={isLoading}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            name="address"
            label="Alamat"
            fullWidth
            value={formValues.address}
            onChange={handleInputChange}
            disabled={isLoading}
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
            disabled={isLoading}
            multiline
            rows={3}
            placeholder="Preferensi pelanggan, catatan khusus, dll."
          />
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button
          variant="outlined"
          onClick={onCancel}
          disabled={isLoading}
        >
          Batal
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {isLoading ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </Box>
    </Paper>
  );
} 