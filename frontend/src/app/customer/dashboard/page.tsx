'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Button, 
  Card, 
  CardContent, 
  CardActions,
  Divider, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon,
  CircularProgress,
  Avatar,
  Chip,
  useTheme
} from '@mui/material';
import {
  LocalLaundryService as LaundryIcon,
  ShoppingBag as ShoppingBagIcon,
  Update as UpdateIcon,
  CreditCard as CreditCardIcon,
  Favorite as FavoriteIcon,
  LocalOffer as OfferIcon,
  ArrowForward as ArrowForwardIcon,
  CalendarMonth as CalendarMonthIcon,
  ShoppingCart as ShoppingCartIcon,
  DirectionsCar as DeliveryIcon
} from '@mui/icons-material';
import Link from 'next/link';

// Sample recent orders data
const recentOrders = [
  { 
    id: 'ord-001', 
    orderNumber: 'ORD-12345', 
    date: '2023-04-01', 
    status: 'Dalam Proses', 
    items: 3, 
    total: 75000 
  },
  { 
    id: 'ord-002', 
    orderNumber: 'ORD-12346', 
    date: '2023-03-25', 
    status: 'Siap Diambil', 
    items: 2, 
    total: 45000 
  },
  { 
    id: 'ord-003', 
    orderNumber: 'ORD-12347', 
    date: '2023-03-20', 
    status: 'Selesai', 
    items: 5, 
    total: 120000 
  }
];

// Sample promotions data
const promotions = [
  {
    id: 'promo-1',
    title: 'Diskon 20%',
    description: 'Untuk pelanggan baru, dapatkan diskon 20% untuk pesanan pertama',
    validUntil: '2023-05-31',
    code: 'NEWUSER20'
  },
  {
    id: 'promo-2',
    title: 'Gratis Ongkir',
    description: 'Gratis ongkir untuk pesanan di atas Rp 100.000',
    validUntil: '2023-04-30',
    code: 'FREESHIP'
  }
];

export default function Dashboard() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeOrders: 0,
    pendingPayment: 0,
    loyaltyPoints: 0
  });

  useEffect(() => {
    // Simulate API call to fetch dashboard data
    setTimeout(() => {
      setStats({
        totalOrders: 10,
        activeOrders: 2,
        pendingPayment: 1,
        loyaltyPoints: 350
      });
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Dalam Proses':
        return theme.palette.primary.main;
      case 'Siap Diambil':
        return theme.palette.warning.main;
      case 'Selesai':
        return theme.palette.success.main;
      case 'Dibatalkan':
        return theme.palette.error.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Selamat datang di laundry dashboard Anda
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              borderRadius: 2,
              boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 90,
                height: 90,
                background: `linear-gradient(45deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                borderRadius: '0 0 0 90px',
                opacity: 0.1,
                zIndex: 0
              }}
            />
            <Box sx={{ zIndex: 1 }}>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Total Pesanan
              </Typography>
              <Typography variant="h4" component="div" fontWeight="bold">
                {stats.totalOrders}
              </Typography>
              <Box display="flex" alignItems="center" mt={1}>
                <ShoppingBagIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2" color="textSecondary">
                  Sepanjang waktu
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              borderRadius: 2,
              boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 90,
                height: 90,
                background: `linear-gradient(45deg, ${theme.palette.warning.light} 0%, ${theme.palette.warning.main} 100%)`,
                borderRadius: '0 0 0 90px',
                opacity: 0.1,
                zIndex: 0
              }}
            />
            <Box sx={{ zIndex: 1 }}>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Pesanan Aktif
              </Typography>
              <Typography variant="h4" component="div" fontWeight="bold">
                {stats.activeOrders}
              </Typography>
              <Box display="flex" alignItems="center" mt={1}>
                <UpdateIcon fontSize="small" color="warning" sx={{ mr: 1 }} />
                <Typography variant="body2" color="textSecondary">
                  Sedang diproses
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              borderRadius: 2,
              boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 90,
                height: 90,
                background: `linear-gradient(45deg, ${theme.palette.error.light} 0%, ${theme.palette.error.main} 100%)`,
                borderRadius: '0 0 0 90px',
                opacity: 0.1,
                zIndex: 0
              }}
            />
            <Box sx={{ zIndex: 1 }}>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Pembayaran Tertunda
              </Typography>
              <Typography variant="h4" component="div" fontWeight="bold">
                {stats.pendingPayment}
              </Typography>
              <Box display="flex" alignItems="center" mt={1}>
                <CreditCardIcon fontSize="small" color="error" sx={{ mr: 1 }} />
                <Typography variant="body2" color="textSecondary">
                  Menunggu pembayaran
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              borderRadius: 2,
              boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 90,
                height: 90,
                background: `linear-gradient(45deg, ${theme.palette.success.light} 0%, ${theme.palette.success.main} 100%)`,
                borderRadius: '0 0 0 90px',
                opacity: 0.1,
                zIndex: 0
              }}
            />
            <Box sx={{ zIndex: 1 }}>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Poin Loyalitas
              </Typography>
              <Typography variant="h4" component="div" fontWeight="bold">
                {stats.loyaltyPoints}
              </Typography>
              <Box display="flex" alignItems="center" mt={1}>
                <FavoriteIcon fontSize="small" color="success" sx={{ mr: 1 }} />
                <Typography variant="body2" color="textSecondary">
                  Tukarkan sekarang
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Typography variant="h6" component="h2" gutterBottom>
        Aksi Cepat
      </Typography>
      <Grid container spacing={3} mb={4}>
        <Grid item xs={6} sm={3}>
          <Button
            component={Link}
            href="/customer/orders/new"
            fullWidth
            variant="outlined"
            sx={{
              p: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              borderRadius: 2
            }}
          >
            <ShoppingCartIcon fontSize="medium" />
            <Typography variant="body2">Pesan Baru</Typography>
          </Button>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Button
            component={Link}
            href="/customer/orders"
            fullWidth
            variant="outlined"
            sx={{
              p: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              borderRadius: 2
            }}
          >
            <ShoppingBagIcon fontSize="medium" />
            <Typography variant="body2">Lihat Pesanan</Typography>
          </Button>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Button
            component={Link}
            href="/customer/tracking"
            fullWidth
            variant="outlined"
            sx={{
              p: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              borderRadius: 2
            }}
          >
            <DeliveryIcon fontSize="medium" />
            <Typography variant="body2">Lacak Pesanan</Typography>
          </Button>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Button
            component={Link}
            href="/customer/schedule"
            fullWidth
            variant="outlined"
            sx={{
              p: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              borderRadius: 2
            }}
          >
            <CalendarMonthIcon fontSize="medium" />
            <Typography variant="body2">Jadwalkan Pickup</Typography>
          </Button>
        </Grid>
      </Grid>

      {/* Recent Orders and Promotions */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2, borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" component="h2">
                Pesanan Terbaru
              </Typography>
              <Button 
                component={Link} 
                href="/customer/orders" 
                size="small" 
                endIcon={<ArrowForwardIcon />}
              >
                Lihat Semua
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <List disablePadding>
              {recentOrders.map((order, index) => (
                <React.Fragment key={order.id}>
                  <ListItem
                    component={Link}
                    href={`/customer/orders/${order.id}`}
                    disablePadding
                    sx={{ 
                      py: 1.5,
                      px: 2,
                      display: 'flex', 
                      borderRadius: 1,
                      textDecoration: 'none',
                      color: 'inherit',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Avatar sx={{ bgcolor: getStatusColor(order.status), width: 32, height: 32 }}>
                        <LaundryIcon fontSize="small" />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2" fontWeight={500}>
                            {order.orderNumber}
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            Rp {order.total.toLocaleString()}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box display="flex" justifyContent="space-between" mt={0.5}>
                          <Typography variant="caption" color="textSecondary">
                            {order.date} • {order.items} item
                          </Typography>
                          <Chip 
                            label={order.status} 
                            size="small" 
                            sx={{ 
                              height: 20, 
                              fontSize: '0.625rem',
                              bgcolor: getStatusColor(order.status) + '20',
                              color: getStatusColor(order.status),
                              '.MuiChip-label': { px: 1 }
                            }} 
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < recentOrders.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
              {recentOrders.length === 0 && (
                <Box textAlign="center" py={3}>
                  <Typography variant="body2" color="textSecondary">
                    Belum ada pesanan
                  </Typography>
                </Box>
              )}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2, borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Promosi & Penawaran
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {promotions.map((promo) => (
              <Card 
                key={promo.id} 
                sx={{ 
                  mb: 2, 
                  borderRadius: 2,
                  border: 1,
                  borderColor: theme.palette.primary.light + '40',
                  boxShadow: 'none',
                  ':last-child': { mb: 0 }
                }}
              >
                <CardContent sx={{ pb: 1 }}>
                  <Box display="flex" gap={2} alignItems="flex-start">
                    <OfferIcon color="primary" fontSize="large" sx={{ mt: 0.5 }} />
                    <Box>
                      <Typography variant="subtitle1" component="div" gutterBottom>
                        {promo.title}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        {promo.description}
                      </Typography>
                      <Box 
                        bgcolor={theme.palette.primary.light + '20'} 
                        p={1} 
                        borderRadius={1} 
                        display="flex" 
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography variant="body2" fontWeight={500}>
                          {promo.code}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Valid hingga {promo.validUntil}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
                <CardActions sx={{ px: 2, pb: 2 }}>
                  <Button 
                    component={Link} 
                    href="/customer/orders/new"
                    size="small" 
                    variant="contained"
                    fullWidth
                  >
                    Gunakan Sekarang
                  </Button>
                </CardActions>
              </Card>
            ))}
            {promotions.length === 0 && (
              <Box textAlign="center" py={3}>
                <Typography variant="body2" color="textSecondary">
                  Belum ada promosi
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
} 