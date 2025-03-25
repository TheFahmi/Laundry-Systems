'use client';

import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  FormControl,
  TextField,
  FormControlLabel,
  RadioGroup,
  Radio,
  Paper,
  List,
  ListItem,
  ListItemText,
  FormLabel
} from '@mui/material';
import { 
  LocalLaundryService
} from '@mui/icons-material';

// Data layanan dummy
const services = [
  { id: 1, name: 'Cuci Setrika Regular', price: 7000, priceModel: 'PER_KG', processingTime: 48 },
  { id: 2, name: 'Cuci Setrika Express', price: 12000, priceModel: 'PER_KG', processingTime: 24 },
  { id: 3, name: 'Cuci Kering', price: 5000, priceModel: 'PER_KG', processingTime: 24 },
  { id: 4, name: 'Cuci Sepatu', price: 35000, priceModel: 'PER_PIECE', processingTime: 48 },
  { id: 5, name: 'Cuci Selimut', price: 30000, priceModel: 'PER_PIECE', processingTime: 72 },
  { id: 6, name: 'Cuci Gorden', price: 25000, priceModel: 'PER_PIECE', processingTime: 72 },
];

// Langkah-langkah pembuatan pesanan
const steps = ['Pilih Layanan', 'Detail Pengiriman', 'Metode Pembayaran', 'Konfirmasi'];

export default function NewOrderPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [order, setOrder] = useState({
    services: [] as { serviceId: number; quantity: number }[],
    pickupDate: null as Date | null,
    deliveryDate: null as Date | null,
    deliveryType: 'pickup',
    address: '',
    specialInstructions: '',
    paymentMethod: 'cash',
  });
  
  // Menangani perubahan langkah
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Menangani perubahan pada layanan yang dipilih
  const handleServiceChange = (serviceId: number, quantity: number) => {
    setOrder((prevOrder) => {
      const newServices = [...prevOrder.services];
      const existingIndex = newServices.findIndex(s => s.serviceId === serviceId);
      
      if (existingIndex >= 0) {
        if (quantity <= 0) {
          newServices.splice(existingIndex, 1);
        } else {
          newServices[existingIndex].quantity = quantity;
        }
      } else if (quantity > 0) {
        newServices.push({ serviceId, quantity });
      }
      
      return { ...prevOrder, services: newServices };
    });
  };

  // Menghitung total pesanan
  const calculateOrderTotal = () => {
    return order.services.reduce((total, item) => {
      const service = services.find(s => s.id === item.serviceId);
      if (service) {
        return total + (service.price * item.quantity);
      }
      return total;
    }, 0);
  };
  
  // Mendapatkan nama layanan berdasarkan ID
  const getServiceName = (serviceId: number) => {
    const service = services.find(s => s.id === serviceId);
    return service ? service.name : 'Layanan tidak ditemukan';
  };
  
  // Mendapatkan unit pengukuran berdasarkan model harga
  const getServiceUnit = (serviceId: number) => {
    const service = services.find(s => s.id === serviceId);
    return service?.priceModel === 'PER_KG' ? 'kg' : 'pcs';
  };

  // Menangani perubahan pada form
  const handleFormChange = (field: string, value: string | Date | null) => {
    setOrder(prev => ({ ...prev, [field]: value }));
  };
  
  // Render konten berdasarkan langkah aktif
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Pilih Layanan
            </Typography>
            
            <Grid container spacing={3}>
              {services.map((service) => {
                const selectedService = order.services.find(s => s.serviceId === service.id);
                const quantity = selectedService ? selectedService.quantity : 0;
                
                return (
                  <Grid item xs={12} sm={6} md={4} key={service.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box 
                          display="flex" 
                          alignItems="center" 
                          gap={1} 
                          mb={1}
                        >
                          <LocalLaundryService color="primary" />
                          <Typography variant="subtitle1">
                            {service.name}
                          </Typography>
                        </Box>
                        <Box mb={2}>
                          <Typography variant="body2" color="text.secondary" mb={1}>
                            Rp {service.price.toLocaleString()} / {service.priceModel === 'PER_KG' ? 'kg' : 'item'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Waktu Proses: {service.processingTime} jam
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center">
                          <Button
                            size="small"
                            variant="outlined"
                            disabled={quantity <= 0}
                            onClick={() => handleServiceChange(service.id, quantity - 1)}
                          >
                            -
                          </Button>
                          <TextField
                            size="small"
                            value={quantity}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 0;
                              handleServiceChange(service.id, value);
                            }}
                            inputProps={{ 
                              min: 0, 
                              style: { textAlign: 'center' } 
                            }}
                            sx={{ width: 60, mx: 1 }}
                          />
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleServiceChange(service.id, quantity + 1)}
                          >
                            +
                          </Button>
                          <Typography variant="body2" ml={1}>
                            {service.priceModel === 'PER_KG' ? 'kg' : 'pcs'}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
            
            <Box mt={4}>
              <Typography variant="subtitle1" gutterBottom>
                Ringkasan Pesanan
              </Typography>
              {order.services.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Belum ada layanan yang dipilih.
                </Typography>
              ) : (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <List disablePadding>
                    {order.services.map((item) => (
                      <ListItem key={item.serviceId} sx={{ py: 1, px: 0 }}>
                        <ListItemText
                          primary={getServiceName(item.serviceId)}
                          secondary={`${item.quantity} ${getServiceUnit(item.serviceId)}`}
                        />
                        <Typography variant="body2">
                          Rp {(services.find(s => s.id === item.serviceId)?.price || 0 * item.quantity).toLocaleString()}
                        </Typography>
                      </ListItem>
                    ))}
                    <Divider />
                    <ListItem sx={{ py: 1, px: 0 }}>
                      <ListItemText primary="Total" />
                      <Typography variant="subtitle1" fontWeight="bold">
                        Rp {calculateOrderTotal().toLocaleString()}
                      </Typography>
                    </ListItem>
                  </List>
                </Paper>
              )}
            </Box>
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Detail Pengiriman
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Tipe Pengiriman</FormLabel>
                  <RadioGroup
                    value={order.deliveryType}
                    onChange={(e) => handleFormChange('deliveryType', e.target.value)}
                  >
                    <FormControlLabel value="pickup" control={<Radio />} label="Diambil Sendiri" />
                    <FormControlLabel value="delivery" control={<Radio />} label="Dikirim ke Alamat" />
                  </RadioGroup>
                </FormControl>
              </Grid>
              
              {order.deliveryType === 'delivery' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Alamat Pengiriman"
                    multiline
                    rows={3}
                    value={order.address}
                    onChange={(e) => handleFormChange('address', e.target.value)}
                  />
                </Grid>
              )}
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tanggal Penjemputan"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  onChange={(e) => handleFormChange('pickupDate', new Date(e.target.value))}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Perkiraan Tanggal Pengambilan"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  onChange={(e) => handleFormChange('deliveryDate', new Date(e.target.value))}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Instruksi Khusus"
                  multiline
                  rows={4}
                  placeholder="Catatan tambahan untuk pesanan Anda..."
                  value={order.specialInstructions}
                  onChange={(e) => handleFormChange('specialInstructions', e.target.value)}
                />
              </Grid>
            </Grid>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Metode Pembayaran
            </Typography>
            <FormControl component="fieldset">
              <RadioGroup
                value={order.paymentMethod}
                onChange={(e) => handleFormChange('paymentMethod', e.target.value)}
              >
                <Paper variant="outlined" sx={{ mb: 2, p: 2 }}>
                  <FormControlLabel value="cash" control={<Radio />} label="Tunai saat Pengambilan/Pengiriman" />
                </Paper>
                
                <Paper variant="outlined" sx={{ mb: 2, p: 2 }}>
                  <FormControlLabel value="transfer" control={<Radio />} label="Transfer Bank" />
                </Paper>
                
                <Paper variant="outlined" sx={{ mb: 2, p: 2 }}>
                  <FormControlLabel value="ewallet" control={<Radio />} label="E-Wallet (OVO, GoPay, DANA)" />
                </Paper>
              </RadioGroup>
            </FormControl>
          </Box>
        );
      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Konfirmasi Pesanan
            </Typography>
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Item Pesanan
              </Typography>
              <List disablePadding>
                {order.services.map((item) => (
                  <ListItem key={item.serviceId} sx={{ py: 1, px: 0 }}>
                    <ListItemText
                      primary={getServiceName(item.serviceId)}
                      secondary={`${item.quantity} ${getServiceUnit(item.serviceId)}`}
                    />
                    <Typography variant="body2">
                      Rp {(services.find(s => s.id === item.serviceId)?.price || 0 * item.quantity).toLocaleString()}
                    </Typography>
                  </ListItem>
                ))}
                <Divider />
                <ListItem sx={{ py: 1, px: 0 }}>
                  <ListItemText primary="Total" />
                  <Typography variant="subtitle1" fontWeight="bold">
                    Rp {calculateOrderTotal().toLocaleString()}
                  </Typography>
                </ListItem>
              </List>
              
              <Box mt={3}>
                <Typography variant="subtitle1" gutterBottom>
                  Detail Pengiriman
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Tipe Pengiriman:
                    </Typography>
                    <Typography variant="body1">
                      {order.deliveryType === 'pickup' ? 'Diambil Sendiri' : 'Dikirim ke Alamat'}
                    </Typography>
                  </Grid>
                  
                  {order.deliveryType === 'delivery' && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Alamat Pengiriman:
                      </Typography>
                      <Typography variant="body1">
                        {order.address || 'Tidak ada alamat'}
                      </Typography>
                    </Grid>
                  )}
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Tanggal Penjemputan:
                    </Typography>
                    <Typography variant="body1">
                      {order.pickupDate ? new Date(order.pickupDate).toLocaleDateString('id-ID') : 'Belum ditentukan'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Perkiraan Tanggal Pengambilan:
                    </Typography>
                    <Typography variant="body1">
                      {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString('id-ID') : 'Belum ditentukan'}
                    </Typography>
                  </Grid>
                  
                  {order.specialInstructions && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Instruksi Khusus:
                      </Typography>
                      <Typography variant="body1">
                        {order.specialInstructions}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>
              
              <Box mt={3}>
                <Typography variant="subtitle1" gutterBottom>
                  Metode Pembayaran
                </Typography>
                <Typography variant="body1">
                  {order.paymentMethod === 'cash' ? 'Tunai saat Pengambilan/Pengiriman' : 
                   order.paymentMethod === 'transfer' ? 'Transfer Bank' : 'E-Wallet'}
                </Typography>
              </Box>
            </Paper>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };
  
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Buat Pesanan Baru
      </Typography>
      
      <Stepper activeStep={activeStep} sx={{ mb: 4 }} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      <Card>
        <CardContent>
          {activeStep === steps.length ? (
            <Box>
              <Typography variant="h6" gutterBottom>
                Pesanan telah berhasil dibuat!
              </Typography>
              <Typography variant="body1" paragraph>
                Terima kasih telah menggunakan layanan kami. ID Pesanan Anda adalah: <b>ORD-001249</b>
              </Typography>
              <Typography variant="body1" paragraph>
                Anda dapat melacak status pesanan di halaman &quot;Pelacakan Pesanan&quot;.
              </Typography>
              <Button variant="contained" color="primary">
                Kembali ke Beranda
              </Button>
            </Box>
          ) : (
            <>
              {getStepContent(activeStep)}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                {activeStep !== 0 && (
                  <Button onClick={handleBack} sx={{ mr: 1 }}>
                    Kembali
                  </Button>
                )}
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={activeStep === 0 && order.services.length === 0}
                >
                  {activeStep === steps.length - 1 ? 'Buat Pesanan' : 'Lanjut'}
                </Button>
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Container>
  );
} 