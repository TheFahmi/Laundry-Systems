'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  Divider,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  Card,
  CardContent,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  CalendarMonth as DateIcon,
  LocalShipping as DeliveryIcon,
  Receipt as ReceiptIcon,
  ArrowBack as ArrowBackIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import Link from 'next/link';
import { Timeline, TimelineItem, TimelineContent, TimelineConnector, TimelineSeparator, TimelineDot } from '@mui/lab';
import { useOrderDetails, useCancelOrder } from '@/services/useOrderQuery';

export default function OrderDetail() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [openInfoDialog, setOpenInfoDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Fetch order details
  const { 
    data: orderData,
    isLoading,
    isError,
    error,
    refetch
  } = useOrderDetails(id);
  
  // Cancel order mutation
  const { 
    mutate: cancelOrder, 
    isPending: isCancelling 
  } = useCancelOrder();

  // Order data
  const order = orderData?.data;

  // Handle cancel order
  const handleCancelOrder = () => {
    setOpenConfirmDialog(false);
    
    cancelOrder(id, {
      onSuccess: () => {
        setSnackbar({
          open: true,
          message: 'Pesanan berhasil dibatalkan',
          severity: 'success'
        });
        refetch();
      },
      onError: (error: any) => {
        setSnackbar({
          open: true,
          message: error.message || error.data?.message || 'Pesanan tidak dapat dibatalkan. Silakan hubungi layanan pelanggan.',
          severity: 'error'
        });
      }
    });
  };

  // Map API status to UI status
  const mapApiStatusToUiStatus = (apiStatus: string): string => {
    switch (apiStatus) {
      case 'new':
        return 'Baru';
      case 'processing':
        return 'Dalam Proses';
      case 'ready_for_pickup':
        return 'Siap Diambil';
      case 'completed':
        return 'Selesai';
      case 'cancelled':
        return 'Dibatalkan';
      default:
        return 'Tidak Diketahui';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Baru':
        return 'info';
      case 'Dalam Proses':
        return 'primary';
      case 'Siap Diambil':
        return 'warning';
      case 'Selesai':
        return 'success';
      case 'Dibatalkan':
        return 'error';
      default:
        return 'default';
    }
  };

  // Format date
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      
      // Check valid date
      if (isNaN(date.getTime())) {
        return 'Tanggal tidak valid';
      }
      
      return date.toLocaleDateString('id-ID', { 
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  // Format money
  const formatMoney = (amount: number): string => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  // Check if order can be cancelled
  const canBeCancelled = order && ['new', 'processing'].includes(order.status);

  // Add a function to get explain why order can't be cancelled
  const getCancelDisabledReason = (): string => {
    if (!order) return '';
    
    switch(order.status) {
      case 'ready_for_pickup':
        return 'Pesanan sudah siap diambil dan tidak dapat dibatalkan';
      case 'completed':
        return 'Pesanan sudah selesai dan tidak dapat dibatalkan';
      case 'cancelled':
        return 'Pesanan sudah dibatalkan';
      default:
        return '';
    }
  };

  // Generate timeline items based on status
  const getTimelineItems = () => {
    if (!order) return [];
    
    // Complete list of all possible statuses in order
    const allStatuses = [
      { status: 'new', label: 'Pesanan Diterima', description: 'Pesanan Anda telah diterima dan sedang menunggu pengambilan.' },
      { status: 'pickup', label: 'Pengambilan', description: 'Laundry Anda telah diambil oleh kurir kami.' },
      { status: 'washing', label: 'Pencucian', description: 'Laundry Anda sedang dalam proses pencucian.' },
      { status: 'drying', label: 'Pengeringan', description: 'Laundry Anda sedang dalam proses pengeringan.' },
      { status: 'ironing', label: 'Setrika', description: 'Laundry Anda sedang dalam proses setrika.' },
      { status: 'delivery', label: 'Pengiriman', description: 'Laundry Anda sedang dalam proses pengiriman.' },
      { status: 'ready_for_pickup', label: 'Siap Diambil', description: 'Laundry Anda telah selesai dan siap untuk diambil.' },
      { status: 'completed', label: 'Selesai', description: 'Laundry Anda telah selesai dan diterima.' }
    ];
    
    // If order is cancelled, show only the relevant statuses
    if (order.status === 'cancelled') {
      // Find at what step it was cancelled based on the order's sub-status if available
      const subStatus = order.subStatus || 'new';
      const lastActiveIndex = allStatuses.findIndex(s => s.status === subStatus);
      
      // Create timeline with active statuses up to the cancellation point
      const activeStatuses = allStatuses.slice(0, lastActiveIndex + 1).map(status => ({
        ...status,
        active: true,
        timestamp: getStatusTimestamp(status.status)
      }));
      
      // Add the cancelled status at the end
      return [
        ...activeStatuses,
        { 
          status: 'cancelled', 
          active: true,
          label: 'Pesanan Dibatalkan', 
          description: 'Pesanan telah dibatalkan.',
          timestamp: order.updatedAt || order.createdAt
        }
      ];
    }
    
    // Map API main and sub-status to our detailed timeline
    let currentMainStatus = order.status;
    let currentSubStatus = order.subStatus || '';
    
    // Determine which steps should be active based on main and sub-status
    let activeStatusIndex = -1;
    
    if (currentMainStatus === 'new') {
      activeStatusIndex = 0; // Pesanan Diterima
    } else if (currentMainStatus === 'processing') {
      // For processing, look at the sub-status to determine the exact step
      switch (currentSubStatus) {
        case 'pickup':
          activeStatusIndex = 1; // Pengambilan
          break;
        case 'washing':
          activeStatusIndex = 2; // Pencucian
          break;
        case 'drying':
          activeStatusIndex = 3; // Pengeringan
          break;
        case 'ironing':
          activeStatusIndex = 4; // Setrika
          break;
        case 'delivery':
          activeStatusIndex = 5; // Pengiriman
          break;
        default:
          activeStatusIndex = 1; // Default to first processing step if sub-status not specified
      }
    } else if (currentMainStatus === 'ready_for_pickup') {
      activeStatusIndex = 6; // Siap Diambil
    } else if (currentMainStatus === 'completed') {
      activeStatusIndex = 7; // Selesai
    }
    
    // Helper function to get timestamp for a specific status
    function getStatusTimestamp(status: string): string {
      if (status === 'new') return order.createdAt;
      if (status === 'pickup') return order.pickupAt || order.processingAt || '';
      if (status === 'washing') return order.washingAt || '';
      if (status === 'drying') return order.dryingAt || '';
      if (status === 'ironing') return order.ironingAt || '';
      if (status === 'delivery') return order.deliveryAt || '';
      if (status === 'ready_for_pickup') return order.readyForPickupAt || '';
      if (status === 'completed') return order.completedAt || '';
      return '';
    }
    
    // Create the timeline items
    return allStatuses.map((statusItem, index) => {
      const isActive = index <= activeStatusIndex;
      const timestamp = isActive ? getStatusTimestamp(statusItem.status) : '';
      
      return {
        ...statusItem,
        active: isActive,
        timestamp: timestamp || undefined
      };
    });
  };

  // Show dialog that explains why order can't be cancelled
  const showCancelInfoDialog = () => {
    setOpenInfoDialog(true);
  };

  // Loading state
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (isError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error?.message || 'Terjadi kesalahan saat memuat detail pesanan'}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          component={Link}
          href="/customer/orders"
        >
          Kembali ke Daftar Pesanan
        </Button>
      </Box>
    );
  }

  // No order data
  if (!order) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Pesanan tidak ditemukan
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          component={Link}
          href="/customer/orders"
        >
          Kembali ke Daftar Pesanan
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header & Navigation */}
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          variant="text"
          startIcon={<ArrowBackIcon />}
          component={Link}
          href="/customer/orders"
          sx={{ mr: 2 }}
        >
          Kembali
        </Button>
        <Typography variant="h4" component="h1">
          Detail Pesanan
        </Typography>
      </Box>

      {/* Order Info Card */}
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Box display="flex" flexWrap="wrap" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box>
              <Typography variant="h5" gutterBottom>
                {order.orderNumber}
              </Typography>
              <Box display="flex" alignItems="center" mb={1}>
                <DateIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                <Typography variant="body2">
                  Dibuat pada {formatDate(order.createdAt)}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <TimeIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                <Typography variant="body2">
                  Estimasi selesai: {order.estimatedCompletionDate ? formatDate(order.estimatedCompletionDate) : 'Belum ditentukan'}
                </Typography>
              </Box>
            </Box>
            <Box display="flex" flexDirection="column" alignItems="flex-end">
              <Chip 
                label={mapApiStatusToUiStatus(order.status)} 
                color={getStatusColor(mapApiStatusToUiStatus(order.status)) as any}
                sx={{ fontWeight: 500, mb: 1 }}
              />
              {canBeCancelled ? (
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<CancelIcon />}
                  onClick={() => setOpenConfirmDialog(true)}
                  disabled={isCancelling}
                >
                  {isCancelling ? 'Membatalkan...' : 'Batalkan Pesanan'}
                </Button>
              ) : order.status !== 'cancelled' && (
                <Button
                  variant="text"
                  size="small"
                  color="inherit"
                  onClick={showCancelInfoDialog}
                  sx={{ mt: 1, fontSize: '0.75rem', textTransform: 'none' }}
                >
                  Mengapa tidak dapat dibatalkan?
                </Button>
              )}
            </Box>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          {/* Order Summary */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Item
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {order.items?.length || 0} item
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Pembayaran
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {formatMoney(parseFloat(order.totalAmount) || 0)}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Metode Pembayaran
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {order.paymentMethod || 'Tunai'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Status Pembayaran
              </Typography>
              <Chip 
                label={order.status === 'cancelled' ? 'Dikembalikan' : 'Lunas'} 
                variant="outlined"
                color={order.status === 'cancelled' ? 'error' : 'success'}
                size="small"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Order Timeline */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Riwayat Status
        </Typography>
        <Box sx={{ mt: 3 }}>
          <Timeline position="right">
            {getTimelineItems().map((item, index) => (
              <TimelineItem key={index}>
                <TimelineSeparator>
                  <TimelineDot 
                    color={item.active ? (item.status === 'cancelled' ? 'error' : 'primary') : 'grey'}
                    variant={item.active ? 'filled' : 'outlined'}
                  />
                  {index < getTimelineItems().length - 1 && <TimelineConnector />}
                </TimelineSeparator>
                <TimelineContent>
                  <Typography variant="subtitle1" component="div">
                    {item.label}
                  </Typography>
                  {item.timestamp && item.active && (
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(item.timestamp)}
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </Box>
      </Paper>

      {/* Order Items */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Item Pesanan
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Layanan</TableCell>
                <TableCell align="center">Jumlah</TableCell>
                <TableCell align="right">Harga Satuan</TableCell>
                <TableCell align="right">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {order.items && order.items.length > 0 ? (
                order.items.map((item: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{item.serviceName}</TableCell>
                    <TableCell align="center">{item.quantity}</TableCell>
                    <TableCell align="right">{formatMoney(parseFloat(item.unitPrice) || 0)}</TableCell>
                    <TableCell align="right">{formatMoney(parseFloat(item.totalPrice) || 0)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Tidak ada item pesanan yang tersedia
                  </TableCell>
                </TableRow>
              )}
              {/* Total Row */}
              {order.items && order.items.length > 0 && (
                <>
                  <TableRow>
                    <TableCell colSpan={3} align="right" sx={{ fontWeight: 'bold' }}>
                      Subtotal
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      {formatMoney(parseFloat(order.totalAmount) || 0)}
                    </TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Notes and Additional Info */}
      {order.notes && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Catatan
          </Typography>
          <Typography variant="body1">
            {order.notes}
          </Typography>
        </Paper>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
      >
        <DialogTitle>Konfirmasi Pembatalan</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Apakah Anda yakin ingin membatalkan pesanan ini? Tindakan ini tidak dapat dibatalkan.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDialog(false)}>Tidak</Button>
          <Button onClick={handleCancelOrder} color="error" variant="contained" disabled={isCancelling}>
            {isCancelling ? 'Membatalkan...' : 'Ya, Batalkan'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Info Dialog: Why order can't be cancelled */}
      <Dialog
        open={openInfoDialog}
        onClose={() => setOpenInfoDialog(false)}
      >
        <DialogTitle>Pesanan Tidak Dapat Dibatalkan</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {getCancelDisabledReason()}
          </DialogContentText>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2">
              Ketentuan pembatalan pesanan:
            </Typography>
            <ul>
              <li>Pesanan hanya dapat dibatalkan pada status "Baru" atau "Dalam Proses"</li>
              <li>Pesanan yang sudah siap diambil atau selesai tidak dapat dibatalkan</li>
              <li>Untuk bantuan lebih lanjut, silakan hubungi layanan pelanggan kami</li>
            </ul>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenInfoDialog(false)} color="primary">
            Tutup
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity as any}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 