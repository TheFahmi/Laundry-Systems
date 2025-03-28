'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Box, Typography, Paper, Grid, Chip, Button, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, CircularProgress, Alert,
  MenuItem, Select, FormControl, InputLabel,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import Link from 'next/link';

// Tipe data untuk Order
interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface OrderItem {
  id: string;
  serviceId?: number;
  serviceName: string;
  quantity: number;
  weight?: number;
  unit?: string;
  unitPrice: number;
  totalPrice: number;
  price: number;
  subtotal: number;
  notes?: string;
  service?: {
    name: string;
    id: number;
    priceModel?: 'per_kg' | 'per_piece' | 'flat_rate';
  };
  weightBased?: boolean;
}

interface Payment {
  id: string;
  referenceNumber?: string;
  amount: number;
  method: string;
  status: string;
  createdAt: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  customer: Customer;
  items: OrderItem[];
  payments: Payment[];
  createdAt: string;
  updatedAt: string;
  totalWeight: number;
}

// Tipe untuk status pesanan
const orderStatusMap: Record<string, { label: string; color: string }> = {
  'new': { label: 'Baru', color: 'info' },
  'processing': { label: 'Diproses', color: 'secondary' },
  'washing': { label: 'Dicuci', color: 'primary' },
  'drying': { label: 'Dikeringkan', color: 'warning' },
  'folding': { label: 'Dilipat', color: 'warning' },
  'ready': { label: 'Siap Diambil', color: 'success' },
  'delivered': { label: 'Terkirim', color: 'default' },
  'cancelled': { label: 'Dibatalkan', color: 'error' }
};

// Add a helper function to format currency consistently
const formatCurrency = (amount: number) => {
  // Format to 2 decimal places and ensure it's a number
  const value = typeof amount === 'number' ? amount : Number(amount) || 0;
  
  // Format with Indonesian locale without forcing 0 decimal places
  return new Intl.NumberFormat('id-ID', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(value);
};

// Add the missing formatTitle function
const formatTitle = (order: Order) => {
  return `Detail Pesanan #${order.orderNumber || order.id.substring(0, 8)}`;
};

// Calculate total order amount based on service priceModel
const calculateTotal = (items: OrderItem[]): number => {
  return items.reduce((total, item) => {
    // Use the subtotal directly from each item
    console.log(`Item ${item.serviceName}: Using subtotal ${item.subtotal}`);
    return total + (item.subtotal || 0);
  }, 0);
};

// Calculate total weight
const calculateTotalWeight = (items: OrderItem[]): number => {
  return items.reduce((total, item) => {
    if (item.weightBased && item.weight !== undefined) {
      console.log(`Item ${item.serviceName}: Adding weight ${item.weight}kg to total`);
      return total + Number(item.weight);
    }
    return total;
  }, 0);
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  // Add method and status label mappings
  const methodLabels: Record<string, string> = {
    'cash': 'Tunai',
    'credit_card': 'Kartu Kredit',
    'debit_card': 'Kartu Debit',
    'transfer': 'Transfer Bank',
    'ewallet': 'E-Wallet',
    'other': 'Lainnya'
  };

  const statusLabels: Record<string, string> = {
    'pending': 'Menunggu',
    'completed': 'Selesai',
    'failed': 'Gagal',
    'refunded': 'Dikembalikan',
    'cancelled': 'Dibatalkan'
  };

  const statusColors: Record<string, string> = {
    'pending': 'warning',
    'completed': 'success',
    'failed': 'error',
    'refunded': 'info',
    'cancelled': 'default'
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        // Endpoint yang benar untuk API orders
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/orders/${params.id}`);
        
        if (!response.ok) {
          throw new Error('Gagal mengambil data pesanan');
        }
        
        const data = await response.json();
        setOrder(data);
      } catch (err: Error | unknown) {
        console.error('Error fetching order:', err);
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengambil data');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchOrder();
    }
  }, [params.id]);

  const handleBack = () => {
    router.back();
  };

  // Update functions for handling status change
  const handleOpenStatusDialog = () => {
    setOpenStatusDialog(true);
  };

  const handleCloseStatusDialog = () => {
    setOpenStatusDialog(false);
  };

  const handleSelectStatus = (status: string) => {
    setSelectedStatus(status);
  };

  const handleConfirmStatusChange = async () => {
    if (!order || !selectedStatus) return;
    
    try {
      setUpdatingStatus(true);
      setStatusUpdateSuccess(false);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: selectedStatus }),
      });
      
      if (!response.ok) {
        throw new Error('Gagal mengubah status pesanan');
      }
      
      const updatedOrder = await response.json();
      setOrder(updatedOrder);
      setStatusUpdateSuccess(true);
      setOpenStatusDialog(false);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setStatusUpdateSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error updating order status:', err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengubah status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBack}
          sx={{ mt: 2 }}
        >
          Kembali
        </Button>
      </Box>
    );
  }

  if (!order) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="warning">Pesanan tidak ditemukan</Alert>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBack}
          sx={{ mt: 2 }}
        >
          Kembali
        </Button>
      </Box>
    );
  }

  // Calculate total amount with debug logging
  const calculateTotal = () => {
    console.log("Calculating total from items:", order.items);
    
    let total = 0;
    let totalWeight = 0;
    
    // Log each item's contribution to total
    order.items.forEach((item: any, index: number) => {
      console.log(`Raw item ${index} data:`, JSON.stringify(item));
      
      // Untuk item berbasis berat, gunakan weight jika tersedia
      let quantity = item.quantity;
      const price = item.price || item.unitPrice || 0;
      
      // Check if this is a weight-based item by service priceModel
      const isWeightBased = item.service?.priceModel === 'per_kg';
      
      console.log(`Item ${index} is weight-based:`, isWeightBased);
      
      let calculatedWeight = 0;
      let itemSubtotal = 0;
      
      if (isWeightBased) {
        // First priority: explicit weight field
        if (item.weight !== undefined && item.weight !== null) {
          calculatedWeight = Number(item.weight);
          console.log(`Item ${index}: Using weight field: ${calculatedWeight}kg`);
        } 
        // Second priority: extract weight from notes
        else if (item.notes && item.notes.includes('Weight:')) {
          const match = item.notes.match(/Weight: ([\d.]+) kg/);
          if (match && match[1]) {
            calculatedWeight = parseFloat(match[1]);
            console.log(`Item ${index}: Found weight in notes: ${calculatedWeight}kg`);
          }
        } 
        // Third priority: if we have subtotal, derive weight from it
        else if (item.subtotal && price) {
          calculatedWeight = Number(item.subtotal) / price;
          console.log(`Item ${index}: Derived weight from subtotal/price: ${calculatedWeight}kg`);
        }
        // Last resort: use quantity as weight
        else {
          calculatedWeight = Number(quantity);
          console.log(`Item ${index}: Using quantity as weight: ${calculatedWeight}kg`);
        }
        
        // Calculate item subtotal
        itemSubtotal = calculatedWeight * price;
        
        // Add to total weight for weight-based items
        totalWeight += calculatedWeight;
        
        console.log(`Item ${index}: Weight-based - Weight: ${calculatedWeight}kg, Price: ${price}, Subtotal: ${itemSubtotal}`);
      } else {
        // For non-weight based (piece-based) items
        // Use quantity for calculations
        const itemQuantity = Number(quantity) || 1;
        itemSubtotal = itemQuantity * price;
        
        console.log(`Item ${index}: Piece-based - Quantity: ${itemQuantity}, Price: ${price}, Subtotal: ${itemSubtotal}`);
      }
      
      // Prefer actual subtotal in database if it's reasonably close to our calculation
      // This helps with legacy data
      const storedSubtotal = item.subtotal || item.totalPrice || 0;
      
      if (storedSubtotal > 0) {
        // Check if within reasonable variance (within 10%)
        const variance = Math.abs((storedSubtotal - itemSubtotal) / itemSubtotal);
        
        if (variance < 0.1) {
          console.log(`Item ${index}: Using stored subtotal: ${storedSubtotal} (calculated: ${itemSubtotal}, variance: ${(variance * 100).toFixed(2)}%)`);
          total += storedSubtotal;
        } else {
          console.log(`Item ${index}: Using calculated subtotal: ${itemSubtotal} (stored: ${storedSubtotal}, variance too high: ${(variance * 100).toFixed(2)}%)`);
          total += itemSubtotal;
        }
      } else {
        console.log(`Item ${index}: Using calculated subtotal: ${itemSubtotal} (no stored subtotal)`);
        total += itemSubtotal;
      }
    });
    
    console.log("Total calculated:", total);
    console.log("Total weight calculated:", totalWeight);
    
    // For debug: compare with other potential totals
    const rawTotal = order.totalAmount || 0;
    console.log("Raw total from order:", rawTotal);
    
    // Return the calculated total
    return {
      total,
      totalWeight
    };
  };

  const calculatedValues = calculateTotal();
  const orderTotal = calculatedValues.total;
  const totalWeight = calculatedValues.totalWeight;

  // Check if there's a completed payment
  const hasCompletedPayment = order.payments && order.payments.some(
    payment => payment.status === 'completed'
  );
  
  // Check if the total amount is fully paid
  const getTotalPaid = () => {
    if (!order.payments || order.payments.length === 0) return 0;
    return order.payments.reduce((total, payment) => {
      // Only count completed payments
      return payment.status === 'completed' ? total + payment.amount : total;
    }, 0);
  };
  
  const totalPaid = getTotalPaid();
  const isFullyPaid = totalPaid >= orderTotal;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" gutterBottom>
          {formatTitle(order)}
        </Typography>
        
        <Box display="flex" gap={2}>
          {/* Status update success message */}
          {statusUpdateSuccess && (
            <Alert severity="success" sx={{ mr: 2 }}>
              Status berhasil diperbarui
            </Alert>
          )}
        
          {/* Status change button */}
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={handleOpenStatusDialog}
            disabled={updatingStatus}
          >
            Ubah Status
          </Button>
          
          {/* Only show Process Payment button if order isn't fully paid */}
          {!isFullyPaid && (
            <Button 
              variant="contained" 
              color="primary"
              component={Link}
              href={`/orders/${params.id}/payment`}
            >
              Process Payment
            </Button>
          )}
          
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={handleBack}
            variant="outlined"
          >
            Kembali ke Daftar Pesanan
          </Button>
        </Box>
      </Box>

      {/* Status Change Dialog */}
      <Dialog open={openStatusDialog} onClose={handleCloseStatusDialog}>
        <DialogTitle>Ubah Status Pesanan</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Pilih status baru untuk pesanan ini. Status saat ini: <strong>{orderStatusMap[order.status]?.label || order.status}</strong>
          </DialogContentText>
          
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="status-select-label">Status Baru</InputLabel>
            <Select
              labelId="status-select-label"
              value={selectedStatus || order.status}
              label="Status Baru"
              onChange={(e) => handleSelectStatus(e.target.value)}
            >
              {Object.entries(orderStatusMap).map(([key, { label }]) => (
                <MenuItem key={key} value={key}>{label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatusDialog} color="inherit">Batal</Button>
          <Button 
            onClick={handleConfirmStatusChange} 
            color="primary" 
            variant="contained"
            disabled={updatingStatus || !selectedStatus || selectedStatus === order.status}
          >
            {updatingStatus ? 'Memproses...' : 'Simpan Perubahan'}
          </Button>
        </DialogActions>
      </Dialog>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>
              Detail Pesanan
            </Typography>
            <Typography variant="body1">
              ID: {order.orderNumber || order.id}
            </Typography>
            <Typography variant="body1">
              Tanggal Pesanan: {format(new Date(order.createdAt), 'dd MMMM yyyy HH:mm', { locale: id })}
            </Typography>
            <Typography variant="body1">
              Status: 
              <Chip 
                size="small"
                label={orderStatusMap[order.status]?.label || order.status}
                color={orderStatusMap[order.status]?.color as 'info' | 'secondary' | 'primary' | 'warning' | 'success' | 'default' | 'error' || 'default'}
                sx={{ ml: 1 }}
              />
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Informasi Pelanggan
            </Typography>
            {order.customer && (
              <>
                <Typography variant="body1">
                  Nama: {order.customer.name}
                </Typography>
                <Typography variant="body1">
                  Telepon: {order.customer.phone || '-'}
                </Typography>
                <Typography variant="body1">
                  Email: {order.customer.email || '-'}
                </Typography>
              </>
            )}
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Item Pesanan
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Layanan</TableCell>
                <TableCell align="right">Berat/Jumlah</TableCell>
                <TableCell align="right">Harga</TableCell>
                <TableCell align="right">Subtotal</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {order.items && order.items.length > 0 ? (
                order.items.map((item, index) => {
                  // Determine if this is a weight-based item
                  const isWeightBased = item.weightBased;
                  
                  // Format weight with 2 decimal places if it's a weight-based item
                  const displayQty = item.weight 
                    ? `${Number(item.weight || 0.5).toFixed(2)} kg` 
                    : item.quantity;
                  
                  return (
                    <TableRow key={index}>
                      <TableCell>{item.serviceName}</TableCell>
                      <TableCell align="right">{displayQty}</TableCell>
                      <TableCell align="right">Rp {formatCurrency(item.price)}</TableCell>
                      <TableCell align="right">Rp {formatCurrency(item.subtotal)}</TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">Tidak ada item</TableCell>
                </TableRow>
              )}
              <TableRow>
                <TableCell colSpan={3} align="right"><strong>Total:</strong></TableCell>
                <TableCell align="right"><strong>Rp {formatCurrency(order.totalAmount)}</strong></TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={3} align="right"><strong>Total Berat:</strong></TableCell>
                <TableCell align="right"><strong>{Number(totalWeight).toFixed(2)} kg</strong></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Informasi Pembayaran
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID Pembayaran</TableCell>
                <TableCell>Tanggal</TableCell>
                <TableCell>Metode</TableCell>
                <TableCell align="right">Jumlah</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {order.payments && order.payments.length > 0 ? (
                order.payments.map((payment, index) => (
                  <TableRow key={index}>
                    <TableCell>{payment.referenceNumber || payment.id}</TableCell>
                    <TableCell>{format(new Date(payment.createdAt), 'dd MMM yyyy', { locale: id })}</TableCell>
                    <TableCell>{methodLabels[payment.method] || payment.method}</TableCell>
                    <TableCell align="right">Rp {formatCurrency(payment.amount)}</TableCell>
                    <TableCell>
                      <Chip 
                        size="small"
                        label={statusLabels[payment.status] || payment.status}
                        color={statusColors[payment.status] as "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" || "default"}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">Belum ada pembayaran</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
} 