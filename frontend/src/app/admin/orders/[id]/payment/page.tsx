'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box, Typography, Paper, Button, CircularProgress, Alert,
  Grid, Divider, Breadcrumbs
} from '@mui/material';
import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PaymentFlow from '@/components/payments/PaymentFlow';
import { createAuthHeaders } from '@/lib/api-utils';
import { toast } from 'react-toastify';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

export default function OrderPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [existingPayments, setExistingPayments] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [paymentComplete, setPaymentComplete] = useState(false);

  // Generate random cache buster
  const generateCacheBuster = () => {
    return `_cb=${Date.now()}`;
  };

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const cacheBuster = generateCacheBuster();
        const headers = createAuthHeaders();
        
        // Fetch order details
        const orderResponse = await fetch(`/api/orders/${orderId}?${cacheBuster}`, {
          headers: {
            ...headers,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          cache: 'no-store'
        });

        if (!orderResponse.ok) {
          const errorData = await orderResponse.json().catch(() => ({ message: 'Unknown error' }));
          throw new Error(errorData.message || 'Failed to fetch order details');
        }

        const orderData = await orderResponse.json();
        
        if (!orderData || !orderData.data) {
          throw new Error('Received invalid order data format');
        }
        
        setOrder(orderData.data);
        setCustomer(orderData.data.customer);
        
        // No longer fetching payments for this order
        // Just set existingPayments to an empty array
        setExistingPayments([]);
        
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'An error occurred while loading order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const handleBack = () => {
    router.back();
  };

  const handlePaymentComplete = async (payment: any) => {
    console.log('Payment completed:', payment);
    setPaymentComplete(true);
    toast.success('Pembayaran berhasil diproses!');
    
    // Update order status to "tersedia" after payment
    try {
      const headers = createAuthHeaders();
      const updateResponse = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify({
          status: 'tersedia'
        })
      });
      
      if (updateResponse.ok) {
        console.log('Order status updated to tersedia');
      } else {
        console.error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
    
    // Redirect back to order details
    setTimeout(() => {
      router.push(`/orders/${orderId}`);
    }, 3000);
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

  // Calculate order total
  const orderTotal = Number(order.totalAmount) || 
    order.items?.reduce((total: number, item: any) => total + (Number(item.subtotal) || 0), 0) || 0;

  // Get order status badge variant
  const getStatusVariant = (status: string) => {
    const statusMap: Record<string, "default" | "destructive" | "outline" | "secondary" | "success" | "warning"> = {
      'new': 'default',
      'processing': 'secondary',
      'ready': 'secondary',
      'completed': 'success',
      'cancelled': 'destructive',
      'pending': 'warning',
      'washing': 'secondary',
      'drying': 'secondary',
      'folding': 'secondary',
      'delivered': 'success'
    };
    return statusMap[status?.toLowerCase()] || 'default';
  };

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link href="/orders" passHref>
          <Typography color="inherit">Pesanan</Typography>
        </Link>
        <Link href={`/orders/${orderId}`} passHref>
          <Typography color="inherit">Detail Pesanan #{order?.orderNumber || orderId}</Typography>
        </Link>
        <Typography color="text.primary">Pembayaran</Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">
          Proses Pembayaran
        </Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          variant="outlined"
        >
          Kembali ke Detail Pesanan
        </Button>
      </Box>

      {/* Order Summary - Shadcn UI Version */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Ringkasan Pesanan</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">ID Pesanan</TableCell>
                <TableCell>{order.orderNumber || order.id}</TableCell>
                <TableCell className="font-medium">Pelanggan</TableCell>
                <TableCell>{customer?.name}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Status</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(order.status)}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">Telepon</TableCell>
                <TableCell>{customer?.phone || '-'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Total Pesanan</TableCell>
                <TableCell className="font-semibold">
                  Rp {new Intl.NumberFormat('id-ID').format(orderTotal)}
                </TableCell>
                <TableCell className="font-medium">Email</TableCell>
                <TableCell>{customer?.email || '-'}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payment Flow */}
      <PaymentFlow
        orderId={order.id}
        orderNumber={order.id}
        orderTotal={orderTotal}
        customerName={customer?.name || 'Pelanggan'}
        onComplete={handlePaymentComplete}
        onCancel={handleBack}
        existingPayments={existingPayments}
      />

      {/* Success message when payment is completed */}
      {paymentComplete && (
        <Alert severity="success" sx={{ mt: 3 }}>
          Pembayaran berhasil diproses! Mengalihkan kembali ke halaman pesanan...
        </Alert>
      )}
    </Box>
  );
} 