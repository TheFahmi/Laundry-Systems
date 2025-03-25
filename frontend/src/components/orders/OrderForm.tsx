'use client';

import { useState, useEffect } from 'react';
import {
  Box, Paper, Button, CircularProgress, 
  TextField, Grid, Typography, 
  MenuItem, Select, FormControl, 
  InputLabel, FormHelperText
} from '@mui/material';

interface OrderFormProps {
  initialData?: {
    customerId?: string;
    items?: Array<{
      id?: string;
      name: string;
      quantity: number;
      price: number;
    }>;
    notes?: string;
  };
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export default function OrderForm({ initialData, onSubmit, onCancel, isLoading }: OrderFormProps) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  
  const [formValues, setFormValues] = useState({
    customerId: initialData?.customerId || '',
    items: initialData?.items || [{ name: '', quantity: 1, price: 0 }],
    notes: initialData?.notes || ''
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Fetch customers when component mounts
    const fetchCustomers = async () => {
      setLoadingCustomers(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customers?limit=100`);
        if (!response.ok) {
          throw new Error('Failed to fetch customers');
        }
        const data = await response.json();
        setCustomers(data.items || []);
      } catch (error) {
        console.error('Error fetching customers:', error);
      } finally {
        setLoadingCustomers(false);
      }
    };

    fetchCustomers();
  }, []);

  // Handle basic input change
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

  // Handle customer selection
  const handleCustomerChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    setFormValues(prev => ({
      ...prev,
      customerId: e.target.value as string
    }));
    
    if (formErrors.customerId) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.customerId;
        return newErrors;
      });
    }
  };

  // Handle adding a new item
  const handleAddItem = () => {
    setFormValues(prev => ({
      ...prev,
      items: [...prev.items, { name: '', quantity: 1, price: 0 }]
    }));
  };

  // Handle removing an item
  const handleRemoveItem = (index: number) => {
    setFormValues(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  // Handle item field change
  const handleItemChange = (index: number, field: string, value: any) => {
    setFormValues(prev => {
      const updatedItems = [...prev.items];
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value
      };
      return {
        ...prev,
        items: updatedItems
      };
    });
    
    // Clear validation error for this item
    const errorKey = `items.${index}.${field}`;
    if (formErrors[errorKey]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  // Calculate total order amount
  const calculateTotal = () => {
    return formValues.items.reduce((total, item) => {
      return total + (item.quantity * item.price);
    }, 0);
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formValues.customerId) {
      errors.customerId = 'Pelanggan wajib dipilih';
    }
    
    formValues.items.forEach((item, index) => {
      if (!item.name) {
        errors[`items.${index}.name`] = 'Nama layanan wajib diisi';
      }
      
      if (item.quantity <= 0) {
        errors[`items.${index}.quantity`] = 'Jumlah harus lebih dari 0';
      }
      
      if (item.price <= 0) {
        errors[`items.${index}.price`] = 'Harga harus lebih dari 0';
      }
    });
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Get error for an item field
  const getItemError = (index: number, field: string) => {
    const errorKey = `items.${index}.${field}`;
    return formErrors[errorKey];
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
        {/* Customer Selection */}
        <Grid item xs={12}>
          <FormControl fullWidth error={!!formErrors.customerId}>
            <InputLabel id="customer-select-label">Pilih Pelanggan *</InputLabel>
            <Select
              labelId="customer-select-label"
              id="customer-select"
              value={formValues.customerId}
              onChange={handleCustomerChange as any}
              label="Pilih Pelanggan *"
              disabled={isLoading || loadingCustomers}
            >
              {loadingCustomers ? (
                <MenuItem value="" disabled>
                  Loading customers...
                </MenuItem>
              ) : customers.length === 0 ? (
                <MenuItem value="" disabled>
                  No customers found
                </MenuItem>
              ) : (
                customers.map(customer => (
                  <MenuItem key={customer.id} value={customer.id}>
                    {customer.name} - {customer.phone}
                  </MenuItem>
                ))
              )}
            </Select>
            {formErrors.customerId && (
              <FormHelperText>{formErrors.customerId}</FormHelperText>
            )}
          </FormControl>
        </Grid>
        
        {/* Order Items */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Layanan
          </Typography>
          
          {formValues.items.map((item, index) => (
            <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Nama Layanan *"
                    fullWidth
                    value={item.name}
                    onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                    error={!!getItemError(index, 'name')}
                    helperText={getItemError(index, 'name')}
                    disabled={isLoading}
                    required
                  />
                </Grid>
                
                <Grid item xs={6} sm={2}>
                  <TextField
                    label="Jumlah *"
                    type="number"
                    fullWidth
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                    error={!!getItemError(index, 'quantity')}
                    helperText={getItemError(index, 'quantity')}
                    disabled={isLoading}
                    InputProps={{ inputProps: { min: 1 } }}
                    required
                  />
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <TextField
                    label="Harga *"
                    type="number"
                    fullWidth
                    value={item.price}
                    onChange={(e) => handleItemChange(index, 'price', parseInt(e.target.value) || 0)}
                    error={!!getItemError(index, 'price')}
                    helperText={getItemError(index, 'price')}
                    disabled={isLoading}
                    InputProps={{ inputProps: { min: 0 } }}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={1} display="flex" alignItems="center" justifyContent="center">
                  {formValues.items.length > 1 && (
                    <Button 
                      variant="outlined" 
                      color="error" 
                      onClick={() => handleRemoveItem(index)}
                      disabled={isLoading}
                      sx={{ minWidth: '40px', p: '5px' }}
                    >
                      X
                    </Button>
                  )}
                </Grid>
              </Grid>
            </Box>
          ))}
          
          <Button
            variant="outlined"
            onClick={handleAddItem}
            disabled={isLoading}
            sx={{ mt: 1 }}
          >
            + Tambah Layanan
          </Button>
        </Grid>
        
        {/* Total */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Typography variant="h6">
              Total: Rp {calculateTotal().toLocaleString()}
            </Typography>
          </Box>
        </Grid>
        
        {/* Notes */}
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
      
      {/* Buttons */}
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