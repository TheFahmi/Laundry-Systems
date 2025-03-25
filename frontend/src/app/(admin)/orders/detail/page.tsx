'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Paper,
  Grid,
  Divider,
  Chip,
  Button,
  Stack,
  Stepper,
  Step,
  StepLabel,
  List,
  ListItem,
  ListItemText,
  Avatar,
  IconButton,
  Breadcrumbs
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Print as PrintIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Message as MessageIcon,
  LocalShipping as ShippingIcon,
  Email as EmailIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import Link from 'next/link';

// Data dummy status pesanan
const OrderStatus = {
  NEW: 'new',
  PROCESSING: 'processing',
  WASHING: 'washing',
  DRYING: 'drying',
  FOLDING: 'folding',
  READY: 'ready',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

// Langkah-langkah proses pesanan
const orderSteps = [
  'Pesanan Diterima',
  'Proses Cuci',
  'Pengeringan',
  'Setrika & Lipat',
  'Siap Diambil',
  'Terkirim'
];

// Data dummy pesanan
const orderData = {
  id: 'ORD12345',
  customerId: 'CUST789',
  customerName: 'Budi Santoso',
  customerPhone: '081234567890',
  customerEmail: 'budi.santoso@email.com',
  customerAddress: 'Jl. Mawar No. 123, Jakarta Selatan',
  orderDate: '2023-03-15T14:30:00',
  pickupDate: '2023-03-15T16:45:00',
  estimatedDeliveryDate: '2023-03-17T17:00:00',
  actualDeliveryDate: '2023-03-17T16:30:00',
  status: OrderStatus.READY,
  deliveryType: 'pickup', // pickup atau delivery
  paymentStatus: 'paid', // paid atau pending
  paymentMethod: 'cash',
  specialInstructions: 'Harap gunakan deterjen lembut untuk kemeja putih. Jangan gunakan pewangi terlalu kuat.',
  items: [
    {
      id: 1,
      name: 'Cuci Setrika Regular',
      quantity: 3.5, // dalam kg
      pricePerUnit: 7000,
      total: 24500
    },
    {
      id: 2,
      name: 'Cuci Sepatu',
      quantity: 2, // dalam pcs
      pricePerUnit: 35000,
      total: 70000
    },
    {
      id: 3,
      name: 'Cuci Selimut',
      quantity: 1, // dalam pcs
      pricePerUnit: 30000,
      total: 30000
    }
  ],
  subtotal: 124500,
  deliveryFee: 10000,
  discount: 5000,
  tax: 12450,
  total: 141950,
  trackingHistory: [
    { status: OrderStatus.NEW, timestamp: '2023-03-15T14:30:00', note: 'Pesanan diterima oleh staf Rini' },
    { status: OrderStatus.PROCESSING, timestamp: '2023-03-15T15:45:00', note: 'Pesanan diproses' },
    { status: OrderStatus.WASHING, timestamp: '2023-03-15T16:30:00', note: 'Pesanan sedang dicuci' },
    { status: OrderStatus.DRYING, timestamp: '2023-03-16T09:15:00', note: 'Pesanan sedang dikeringkan' },
    { status: OrderStatus.FOLDING, timestamp: '2023-03-16T14:20:00', note: 'Pesanan sedang disetrika dan dilipat' },
    { status: OrderStatus.READY, timestamp: '2023-03-17T11:10:00', note: 'Pesanan siap untuk diambil atau diantarkan' }
  ]
};

// Fungsi untuk mendapatkan step aktif berdasarkan status
const getActiveStep = (status: string) => {
  switch (status) {
    case OrderStatus.NEW:
      return 0;
    case OrderStatus.PROCESSING:
    case OrderStatus.WASHING:
      return 1;
    case OrderStatus.DRYING:
      return 2;
    case OrderStatus.FOLDING:
      return 3;
    case OrderStatus.READY:
      return 4;
    case OrderStatus.DELIVERED:
      return 5;
    case OrderStatus.CANCELLED:
      return -1;
    default:
      return 0;
  }
};

// Type untuk status badge
type StatusBadgeColor = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';

// Fungsi untuk mendapatkan badge warna berdasarkan status
const getStatusBadge = (status: string) => {
  switch (status) {
    case OrderStatus.NEW:
      return { color: 'info' as StatusBadgeColor, label: 'Baru' };
    case OrderStatus.PROCESSING:
      return { color: 'info' as StatusBadgeColor, label: 'Diproses' };
    case OrderStatus.WASHING:
      return { color: 'info' as StatusBadgeColor, label: 'Dicuci' };
    case OrderStatus.DRYING:
      return { color: 'info' as StatusBadgeColor, label: 'Pengeringan' };
    case OrderStatus.FOLDING:
      return { color: 'info' as StatusBadgeColor, label: 'Dilipat' };
    case OrderStatus.READY:
      return { color: 'success' as StatusBadgeColor, label: 'Siap' };
    case OrderStatus.DELIVERED:
      return { color: 'success' as StatusBadgeColor, label: 'Terkirim' };
    case OrderStatus.CANCELLED:
      return { color: 'error' as StatusBadgeColor, label: 'Dibatalkan' };
    default:
      return { color: 'default' as StatusBadgeColor, label: 'Tidak Diketahui' };
  }
};

export default function OrderDetailPage() {
  // Mengambil data aktual dari backend (dummy untuk contoh)
  const order = orderData;
  
  // Menghitung status aktif untuk stepper
  const activeStep = getActiveStep(order.status);
  
  // Mengambil badge status
  const statusBadge = getStatusBadge(order.status);
  
  return (
    <Card>
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Breadcrumbs sx={{ mb: 2 }}>
            <Link href="/orders">
              <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
                <ArrowBackIcon sx={{ mr: 0.5, fontSize: 18 }} />
                Kembali ke Daftar Pesanan
              </Typography>
            </Link>
            <Typography color="text.primary">Detail Pesanan</Typography>
          </Breadcrumbs>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h5" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                Pesanan #{order.id}
                <Chip 
                  label={statusBadge.label} 
                  color={statusBadge.color} 
                  size="small" 
                  sx={{ ml: 2 }}
                />
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tanggal Pesanan: {new Date(order.orderDate).toLocaleDateString('id-ID', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Typography>
            </Box>
            
            <Stack direction="row" spacing={1}>
              <Button 
                startIcon={<PrintIcon />} 
                variant="outlined" 
                size="small"
              >
                Cetak
              </Button>
              <Button 
                startIcon={<EditIcon />} 
                variant="outlined" 
                size="small"
              >
                Edit
              </Button>
            </Stack>
          </Box>
        </Box>
        
        <Box sx={{ mb: 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {orderSteps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Detail Item
              </Typography>
              <Box sx={{ overflowX: 'auto' }}>
                <List dense>
                  {order.items.map((item, index) => (
                    <React.Fragment key={item.id}>
                      {index > 0 && <Divider component="li" />}
                      <ListItem
                        secondaryAction={
                          <Typography variant="body2">
                            Rp {item.total.toLocaleString()}
                          </Typography>
                        }
                      >
                        <ListItemText
                          primary={item.name}
                          secondary={`${item.quantity} ${item.name.includes('Sepatu') || item.name.includes('Selimut') ? 'pcs' : 'kg'} × Rp ${item.pricePerUnit.toLocaleString()}`}
                        />
                      </ListItem>
                    </React.Fragment>
                  ))}
                  <Divider sx={{ my: 2 }} />
                  <ListItem
                    secondaryAction={
                      <Typography variant="body2">
                        Rp {order.subtotal.toLocaleString()}
                      </Typography>
                    }
                  >
                    <ListItemText primary="Subtotal" />
                  </ListItem>
                  <ListItem
                    secondaryAction={
                      <Typography variant="body2">
                        Rp {order.deliveryFee.toLocaleString()}
                      </Typography>
                    }
                  >
                    <ListItemText primary="Biaya Pengiriman" />
                  </ListItem>
                  {order.discount > 0 && (
                    <ListItem
                      secondaryAction={
                        <Typography variant="body2" color="error">
                          -Rp {order.discount.toLocaleString()}
                        </Typography>
                      }
                    >
                      <ListItemText primary="Diskon" />
                    </ListItem>
                  )}
                  <ListItem
                    secondaryAction={
                      <Typography variant="body2">
                        Rp {order.tax.toLocaleString()}
                      </Typography>
                    }
                  >
                    <ListItemText primary="Pajak (10%)" />
                  </ListItem>
                  <Divider sx={{ my: 1 }} />
                  <ListItem
                    secondaryAction={
                      <Typography variant="subtitle1" fontWeight="bold">
                        Rp {order.total.toLocaleString()}
                      </Typography>
                    }
                  >
                    <ListItemText 
                      primary={<Typography variant="subtitle1" fontWeight="bold">Total</Typography>} 
                    />
                  </ListItem>
                </List>
              </Box>
            </Paper>
            
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Riwayat Status
              </Typography>
              <List dense>
                {order.trackingHistory.map((history, index) => (
                  <ListItem key={index} alignItems="flex-start">
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" fontWeight="medium">
                            {getStatusBadge(history.status).label}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(history.timestamp).toLocaleDateString('id-ID', { 
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Typography>
                        </Box>
                      }
                      secondary={history.note}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Informasi Pelanggan
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ mr: 2, width: 60, height: 60 }}>
                  {order.customerName.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1">{order.customerName}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Customer ID: {order.customerId}
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">{order.customerPhone}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">{order.customerEmail}</Typography>
                </Box>
              </Stack>
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <IconButton size="small" color="primary">
                  <MessageIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" color="primary">
                  <PhoneIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" color="primary">
                  <EmailIcon fontSize="small" />
                </IconButton>
              </Box>
            </Paper>
            
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Detail Pengiriman
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Tipe Pengiriman
                </Typography>
                <Typography variant="body1">
                  {order.deliveryType === 'pickup' ? 'Diambil Sendiri' : 'Diantar ke Alamat'}
                </Typography>
              </Box>
              
              {order.deliveryType === 'delivery' && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Alamat Pengiriman
                  </Typography>
                  <Typography variant="body1">
                    {order.customerAddress}
                  </Typography>
                </Box>
              )}
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Tanggal Penjemputan
                </Typography>
                <Typography variant="body1">
                  {new Date(order.pickupDate).toLocaleDateString('id-ID', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Estimasi Pengambilan/Pengiriman
                </Typography>
                <Typography variant="body1">
                  {new Date(order.estimatedDeliveryDate).toLocaleDateString('id-ID', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Typography>
              </Box>
            </Paper>
            
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Pembayaran
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Status Pembayaran
                </Typography>
                <Chip 
                  label={order.paymentStatus === 'paid' ? 'Lunas' : 'Belum Lunas'} 
                  color={order.paymentStatus === 'paid' ? 'success' : 'warning'} 
                  size="small" 
                />
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Metode Pembayaran
                </Typography>
                <Typography variant="body1">
                  {order.paymentMethod === 'cash' ? 'Tunai' : 
                   order.paymentMethod === 'transfer' ? 'Transfer Bank' : 'E-Wallet'}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total Pembayaran
                </Typography>
                <Typography variant="h6" color="primary">
                  Rp {order.total.toLocaleString()}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
        
        {order.specialInstructions && (
          <Paper sx={{ p: 2, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Instruksi Khusus
            </Typography>
            <Typography variant="body1">
              {order.specialInstructions}
            </Typography>
          </Paper>
        )}
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            variant="outlined" 
            color="primary"
            startIcon={<ArrowBackIcon />}
            component={Link}
            href="/orders"
          >
            Kembali ke Daftar
          </Button>
          
          {order.status === OrderStatus.READY && (
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<ShippingIcon />}
            >
              Tandai Sebagai Terkirim
            </Button>
          )}
          
          {order.status !== OrderStatus.CANCELLED && order.status !== OrderStatus.DELIVERED && (
            <Button 
              variant="outlined" 
              color="error"
              startIcon={<DeleteIcon />}
            >
              Batalkan Pesanan
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
} 