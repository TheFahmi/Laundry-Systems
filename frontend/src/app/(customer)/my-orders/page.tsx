'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
} from '@mui/icons-material';

// Sample data for customer orders
const customerOrders = [
  {
    id: 'ORD-001248',
    dateCreated: new Date('2023-03-20'),
    status: 'WASHING',
    items: [
      { name: 'Cuci Setrika Regular', quantity: '4 kg' },
      { name: 'Selimut', quantity: '2 pcs' }
    ],
    totalAmount: 75000,
    estimatedCompletion: new Date('2023-03-22'),
  },
  {
    id: 'ORD-001236',
    dateCreated: new Date('2023-03-18'),
    status: 'FOLDING',
    items: [
      { name: 'Cuci Setrika Express', quantity: '3 kg' },
      { name: 'Kemeja', quantity: '5 pcs' }
    ],
    totalAmount: 85000,
    estimatedCompletion: new Date('2023-03-21'),
  },
  {
    id: 'ORD-001224',
    dateCreated: new Date('2023-03-15'),
    status: 'READY',
    items: [
      { name: 'Cuci Kering', quantity: '2 kg' },
      { name: 'Gorden', quantity: '1 set' }
    ],
    totalAmount: 65000,
    estimatedCompletion: new Date('2023-03-19'),
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

export default function CustomerOrdersPage() {
  const router = useRouter();
  
  const handleCreateOrder = () => {
    router.push('/my-orders/create');
  };
  
  return (
    <Container maxWidth="lg">
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">
          Pesanan Saya
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleCreateOrder}
        >
          Buat Pesanan
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        {customerOrders.map((order) => (
          <Grid item xs={12} key={order.id}>
            <Paper sx={{ p: 3 }}>
              <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">
                  {order.id}
                </Typography>
                <Chip 
                  label={getStatusText(order.status)} 
                  color={getStatusColor(order.status)}
                />
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Tanggal Pesanan
                  </Typography>
                  <Typography variant="body1">
                    {order.dateCreated.toLocaleDateString('id-ID')}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Estimasi Selesai
                  </Typography>
                  <Typography variant="body1">
                    {order.estimatedCompletion.toLocaleDateString('id-ID')}
                  </Typography>
                </Grid>
              </Grid>
              
              <Box mt={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Item Pesanan
                </Typography>
                <List dense disablePadding>
                  {order.items.map((item, idx) => (
                    <ListItem key={idx} disablePadding>
                      <ListItemText 
                        primary={item.name}
                        secondary={item.quantity}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle1">
                  Total
                </Typography>
                <Typography variant="subtitle1" fontWeight="bold">
                  Rp {order.totalAmount.toLocaleString('id-ID')}
                </Typography>
              </Box>
              
              <Box mt={2} display="flex" justifyContent="flex-end">
                <Button 
                  variant="outlined" 
                  color="primary"
                  onClick={() => router.push(`/tracking?id=${order.id}`)}
                >
                  Lacak Pesanan
                </Button>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
} 