import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Grid,
  Paper,
  Divider,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  InputAdornment,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel
} from '@mui/material';

interface PaymentData {
  amount: number;
  change: number;
  method: string;
}

interface PaymentStepProps {
  orderTotal: number;
  onPaymentUpdate: (paymentData: PaymentData) => void;
  paymentData: PaymentData;
}

export default function PaymentStep({ orderTotal, onPaymentUpdate, paymentData }: PaymentStepProps) {
  const [amount, setAmount] = useState<number>(paymentData.amount || 0);
  const [method, setMethod] = useState<string>(paymentData.method || 'cash');
  const [change, setChange] = useState<number>(paymentData.change || 0);

  const quickAmounts = [
    { id: 'exact', value: orderTotal, label: 'Uang Pas' },
    { id: 'rp10k', value: 10000, label: 'Rp 10.000' },
    { id: 'rp20k', value: 20000, label: 'Rp 20.000' },
    { id: 'rp50k', value: 50000, label: 'Rp 50.000' },
    { id: 'rp100k', value: 100000, label: 'Rp 100.000' },
  ].filter(option => option.value >= orderTotal);

  useEffect(() => {
    // Calculate change whenever amount or order total changes
    const calculatedChange = Math.max(0, amount - orderTotal);
    setChange(calculatedChange);
    
    // Update parent component with payment data
    onPaymentUpdate({
      amount,
      change: calculatedChange,
      method
    });
  }, [amount, orderTotal, method, onPaymentUpdate]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setAmount(value);
  };

  const handleMethodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMethod(e.target.value);
  };

  const handleQuickAmount = (value: number) => {
    setAmount(value);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>Pembayaran</Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Metode Pembayaran</FormLabel>
            <RadioGroup
              value={method}
              onChange={handleMethodChange}
            >
              <FormControlLabel value="cash" control={<Radio />} label="Tunai" />
              <FormControlLabel value="transfer" control={<Radio />} label="Transfer Bank" />
              <FormControlLabel value="qris" control={<Radio />} label="QRIS" />
            </RadioGroup>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" gutterBottom>
            Total Pesanan: Rp {orderTotal.toLocaleString('id-ID')}
          </Typography>
          
          <TextField
            label="Jumlah Pembayaran"
            type="number"
            fullWidth
            margin="normal"
            value={amount || ''}
            onChange={handleAmountChange}
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1 }}>Rp</Typography>,
            }}
          />
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Jumlah Cepat:
            </Typography>
            <Grid container spacing={1}>
              {quickAmounts.map((option) => (
                <Grid item key={option.id}>
                  <Button 
                    variant="outlined"
                    onClick={() => handleQuickAmount(option.value)}
                  >
                    {option.label}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Box>
          
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="subtitle1">
              Kembalian: Rp {change.toLocaleString('id-ID')}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
} 