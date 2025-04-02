'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Step,
  StepLabel,
  Stepper,
  Typography,
  TextField,
  Button,
  Paper,
  Divider,
  Chip,
  Stack
} from '@mui/material';
import {
  Search as SearchIcon,
  LocalLaundryService,
  AccessTime,
  LocalShipping
} from '@mui/icons-material';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

// Status pesanan untuk stepper
const orderSteps = ['Diterima', 'Dicuci', 'Dikeringkan', 'Dilipat', 'Siap', 'Dikirim'];

// Data contoh pesanan aktif
const activeOrders = [
  {
    id: 'ORD-001248',
    dateCreated: new Date('2023-03-20'),
    status: 'WASHING',
    items: [
      { name: 'Cuci Setrika Regular', quantity: '4 kg' },
      { name: 'Selimut', quantity: '2 pcs' }
    ],
    estimatedCompletion: new Date('2023-03-22'),
    currentStep: 1
  },
  {
    id: 'ORD-001236',
    dateCreated: new Date('2023-03-18'),
    status: 'FOLDING',
    items: [
      { name: 'Cuci Setrika Express', quantity: '3 kg' },
      { name: 'Kemeja', quantity: '5 pcs' }
    ],
    estimatedCompletion: new Date('2023-03-21'),
    currentStep: 3
  },
  {
    id: 'ORD-001224',
    dateCreated: new Date('2023-03-15'),
    status: 'READY',
    items: [
      { name: 'Cuci Kering', quantity: '2 kg' },
      { name: 'Gorden', quantity: '1 set' }
    ],
    estimatedCompletion: new Date('2023-03-19'),
    currentStep: 4
  }
];

// Fungsi helper untuk mendapatkan status dalam bahasa Indonesia
const getStatusText = (status: string) => {
  const statusMap: { [key: string]: string } = {
    'NEW': 'Baru',
    'PROCESSING': 'Diproses',
    'WASHING': 'Dicuci',
    'DRYING': 'Dikeringkan',
    'FOLDING': 'Dilipat',
    'READY': 'Siap Diambil',
    'DELIVERED': 'Dikirim',
    'CANCELLED': 'Dibatalkan'
  };
  return statusMap[status] || status;
};

// Fungsi helper untuk mendapatkan warna chip berdasarkan status
const getStatusColor = (status: string) => {
  const colorMap: { [key: string]: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' } = {
    'NEW': 'default',
    'PROCESSING': 'primary',
    'WASHING': 'info',
    'DRYING': 'info',
    'FOLDING': 'info',
    'READY': 'success',
    'DELIVERED': 'success',
    'CANCELLED': 'error'
  };
  return colorMap[status] || 'default';
};

export default function CustomerTrackingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<typeof activeOrders[0] | null>(null);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const foundOrder = activeOrders.find(order => 
        order.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSelectedOrder(foundOrder || null);
    }
  };

  const handleOrderClick = (order: typeof activeOrders[0]) => {
    setSelectedOrder(order);
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Pelacakan Pesanan
      </Typography>
      
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Lacak Pesanan Anda
          </Typography>
          <Box display="flex" gap={2}>
            <TextField
              fullWidth
              placeholder="Masukkan ID Pesanan"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button 
              variant="contained" 
              startIcon={<SearchIcon />}
              onClick={handleSearch}
            >
              Cari
            </Button>
          </Box>
        </CardContent>
      </Card>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Typography variant="h6" gutterBottom>
            Pesanan Aktif
          </Typography>
          <Stack spacing={2}>
            {activeOrders.map((order) => (
              <Paper 
                key={order.id}
                elevation={selectedOrder?.id === order.id ? 3 : 1}
                sx={{ 
                  p: 2, 
                  cursor: 'pointer',
                  borderLeft: selectedOrder?.id === order.id ? '4px solid #1976d2' : 'none',
                  transition: 'all 0.2s ease-in-out'
                }}
                onClick={() => handleOrderClick(order)}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {order.id}
                  </Typography>
                  <Chip 
                    label={getStatusText(order.status)} 
                    size="small" 
                    color={getStatusColor(order.status)}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Tanggal Pesanan: {format(order.dateCreated, 'dd MMMM yyyy', { locale: id })}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Estimasi Selesai: {format(order.estimatedCompletion, 'dd MMMM yyyy', { locale: id })}
                </Typography>
              </Paper>
            ))}
          </Stack>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Typography variant="h6" gutterBottom>
            Detail Pesanan
          </Typography>
          {selectedOrder ? (
            <Paper sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" fontWeight="bold">
                  {selectedOrder.id}
                </Typography>
                <Chip 
                  label={getStatusText(selectedOrder.status)} 
                  color={getStatusColor(selectedOrder.status)}
                />
              </Box>
              
              <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <LocalLaundryService color="primary" />
                    <Typography variant="body1">
                      Tanggal Pesanan
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {format(selectedOrder.dateCreated, 'dd MMMM yyyy', { locale: id })}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <AccessTime color="primary" />
                    <Typography variant="body1">
                      Estimasi Selesai
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {format(selectedOrder.estimatedCompletion, 'dd MMMM yyyy', { locale: id })}
                  </Typography>
                </Grid>
              </Grid>
              
              <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                Item Pesanan
              </Typography>
              
              {selectedOrder.items.map((item, index) => (
                <Box key={index} mb={1}>
                  <Typography variant="body1">
                    {item.name} ({item.quantity})
                  </Typography>
                </Box>
              ))}
              
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                Status Pesanan
              </Typography>
              
              <Stepper activeStep={selectedOrder.currentStep} alternativeLabel>
                {orderSteps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
              
              <Box mt={4} display="flex" alignItems="center" gap={1}>
                <LocalShipping color="primary" />
                <Typography variant="body2" color="text.secondary">
                  Pesanan akan dikirim setelah proses selesai atau dapat diambil di toko kami.
                </Typography>
              </Box>
            </Paper>
          ) : (
            <Paper 
              sx={{ 
                p: 3, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                minHeight: 300
              }}
            >
              <LocalLaundryService sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" align="center">
                Pilih pesanan di samping atau cari menggunakan ID pesanan
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
} 