'use client';

import { useState, useEffect } from 'react';
import {
  Box, Paper, Button, CircularProgress, 
  TextField, Grid, Typography, 
  MenuItem, Select, FormControl, 
  InputLabel, FormHelperText,
  Card, CardContent
} from '@mui/material';

export enum PaymentMethod {
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  TRANSFER = 'transfer',
  EWALLET = 'ewallet',
  OTHER = 'other'
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled'
}

interface PaymentFormProps {
  orderId: string;
  orderAmount: number;
  customerId: string;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
  initialData?: {
    id?: string;
    amount?: number;
    method?: PaymentMethod;
    status?: PaymentStatus;
    notes?: string;
  };
}

export default function PaymentForm({ 
  orderId, 
  orderAmount, 
  customerId, 
  onSubmit, 
  onCancel, 
  isLoading,
  initialData 
}: PaymentFormProps) {
  const [formValues, setFormValues] = useState({
    orderId: orderId,
    customerId: customerId,
    amount: initialData?.amount || orderAmount,
    method: initialData?.method || PaymentMethod.CASH,
    status: initialData?.status || PaymentStatus.PENDING,
    notes: initialData?.notes || '',
    transactionId: '',
    paymentId: initialData?.id || ''
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

  // Handle select change for payment method and status
  const handleSelectChange = (e: any) => {
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
    
    if (!formValues.amount || formValues.amount <= 0) {
      errors.amount = 'Jumlah pembayaran harus lebih dari 0';
    }
    
    if (!formValues.method) {
      errors.method = 'Metode pembayaran wajib dipilih';
    }
    
    if (!formValues.status) {
      errors.status = 'Status pembayaran wajib dipilih';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Prepare data for submission
    const submitData = {
      ...formValues,
      amount: Number(formValues.amount)
    };
    
    onSubmit(submitData);
  };

  return (
    <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Informasi Pembayaran
          </Typography>
        </Grid>
        
        {/* Order Summary */}
        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Detail Pesanan
              </Typography>
              <Typography variant="body2">
                Order ID: {orderId}
              </Typography>
              <Typography variant="body2">
                Total: Rp {orderAmount.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Payment Amount */}
        <Grid item xs={12} sm={6}>
          <TextField
            label="Jumlah Pembayaran *"
            name="amount"
            type="number"
            fullWidth
            value={formValues.amount}
            onChange={handleInputChange}
            error={!!formErrors.amount}
            helperText={formErrors.amount}
            disabled={isLoading}
            InputProps={{ inputProps: { min: 1 } }}
            required
          />
        </Grid>
        
        {/* Payment Method */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!formErrors.method}>
            <InputLabel id="method-select-label">Metode Pembayaran *</InputLabel>
            <Select
              labelId="method-select-label"
              id="method-select"
              name="method"
              value={formValues.method}
              onChange={handleSelectChange}
              label="Metode Pembayaran *"
              disabled={isLoading}
            >
              <MenuItem value={PaymentMethod.CASH}>Tunai</MenuItem>
              <MenuItem value={PaymentMethod.CREDIT_CARD}>Kartu Kredit</MenuItem>
              <MenuItem value={PaymentMethod.DEBIT_CARD}>Kartu Debit</MenuItem>
              <MenuItem value={PaymentMethod.TRANSFER}>Transfer Bank</MenuItem>
              <MenuItem value={PaymentMethod.EWALLET}>E-Wallet</MenuItem>
              <MenuItem value={PaymentMethod.OTHER}>Lainnya</MenuItem>
            </Select>
            {formErrors.method && (
              <FormHelperText>{formErrors.method}</FormHelperText>
            )}
          </FormControl>
        </Grid>
        
        {/* Payment Status */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!formErrors.status}>
            <InputLabel id="status-select-label">Status Pembayaran *</InputLabel>
            <Select
              labelId="status-select-label"
              id="status-select"
              name="status"
              value={formValues.status}
              onChange={handleSelectChange}
              label="Status Pembayaran *"
              disabled={isLoading}
            >
              <MenuItem value={PaymentStatus.PENDING}>Pending</MenuItem>
              <MenuItem value={PaymentStatus.COMPLETED}>Completed</MenuItem>
              <MenuItem value={PaymentStatus.FAILED}>Failed</MenuItem>
              <MenuItem value={PaymentStatus.REFUNDED}>Refunded</MenuItem>
              <MenuItem value={PaymentStatus.CANCELLED}>Cancelled</MenuItem>
            </Select>
            {formErrors.status && (
              <FormHelperText>{formErrors.status}</FormHelperText>
            )}
          </FormControl>
        </Grid>
        
        {/* Transaction ID (for non-cash payments) */}
        {formValues.method !== PaymentMethod.CASH && (
          <Grid item xs={12} sm={6}>
            <TextField
              label="ID Transaksi"
              name="transactionId"
              fullWidth
              value={formValues.transactionId}
              onChange={handleInputChange}
              disabled={isLoading}
              placeholder="ID transaksi dari payment gateway"
            />
          </Grid>
        )}
        
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
            placeholder="Informasi tambahan tentang pembayaran"
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
          color="primary"
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {initialData?.id ? 'Update Pembayaran' : 'Proses Pembayaran'}
        </Button>
      </Box>
    </Paper>
  );
} 