'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { createAuthHeaders } from '@/lib/api-utils';

// Shadcn UI imports
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

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
  paymentMethod: string;
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

// Add method and status label mappings
const methodLabels: Record<string, string> = {
  'cash': 'Tunai',
  'credit_card': 'Kartu Kredit',
  'debit_card': 'Kartu Debit',
  'transfer': 'Transfer Bank',
  'bank_transfer': 'Transfer Bank',
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
const calculateItemsTotal = (items: OrderItem[]): number => {
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
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');
  
  // Generate a helper function for creating cache busters
  const generateCacheBuster = () => {
    return `_cb=${Date.now()}`;
  };

  // Add refresh function
  const refreshOrderDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = createAuthHeaders();
      // Generate a fresh cache buster each time we refresh
      const freshCacheBuster = generateCacheBuster();
      
      const response = await fetch(`/api/orders/${encodeURIComponent(params.id as string)}?${freshCacheBuster}`, {
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || 'Failed to fetch order details');
      }

      const responseData = await response.json();
      console.log('Order API Response:', responseData);

      if (!responseData || !responseData.data) {
        throw new Error('Received invalid order data format');
      }

      // Fetch payments by order ID using dedicated endpoint
      console.log(`Fetching payments for order: ${params.id}`);
      const paymentsResponse = await fetch(`/api/payments/order/${encodeURIComponent(params.id as string)}?${generateCacheBuster()}`, {
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        cache: 'no-store'
      });

      let payments = [];
      const data = responseData.data;
      
      // Debug original data structure
      console.log('Raw order data structure:', {
        hasPayments: !!data.payments,
        paymentsLength: data.payments?.length || 0,
        paymentsIsArray: Array.isArray(data.payments)
      });
      
      // If payments is not an array, make it one
      if (data.payments && !Array.isArray(data.payments)) {
        console.log('Converting payments to array:', data.payments);
        data.payments = [data.payments];
      }
      
      // Only fetch external payments if not already present in the order data
      if (!data.payments || !Array.isArray(data.payments) || data.payments.length === 0) {
        console.log('No payments in order data, trying to fetch separately...');
        if (paymentsResponse.ok) {
          const paymentsData = await paymentsResponse.json();
          console.log('Separate payments API response:', paymentsData);
          
          // Extract payments from response data structure
          if (paymentsData.items && Array.isArray(paymentsData.items)) {
            payments = paymentsData.items;
          } else if (paymentsData.data?.data && Array.isArray(paymentsData.data.data)) {
            payments = paymentsData.data.data;
          } else if (paymentsData.data && Array.isArray(paymentsData.data)) {
            payments = paymentsData.data;
          } else if (Array.isArray(paymentsData)) {
            payments = paymentsData;
          }
          
          console.log('Extracted payments from separate call:', payments);
          data.payments = payments;
        }
      } else {
        console.log('Using payments from order data:', data.payments);
      }

      // Calculate total even if it's missing from the response
      if (data.items && Array.isArray(data.items) && (!data.totalAmount || data.totalAmount === 0)) {
        const calculatedTotal = calculateItemsTotal(data.items);
        data.totalAmount = calculatedTotal;
        console.log(`Calculated total: ${calculatedTotal}`);
      }

      // Calculate total weight if needed
      if (data.items && Array.isArray(data.items) && (!data.totalWeight || data.totalWeight === 0)) {
        const calculatedWeight = calculateTotalWeight(data.items);
        data.totalWeight = calculatedWeight;
        console.log(`Calculated weight: ${calculatedWeight}kg`);
      }
      
      console.log('Final order data with payments:', data);
      setOrder(data);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setError(error.message || 'An error occurred while loading order details');
    } finally {
      setLoading(false);
    }
  };

  // Call refresh on mount and when returning from payment page
  useEffect(() => {
    refreshOrderDetails();
  }, [params.id]);

  // Add event listener for focus to refresh data
  useEffect(() => {
    const handleFocus = () => {
      refreshOrderDetails();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

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

  const handleUpdateStatus = async () => {
    setIsUpdating(true);
    setUpdateError('');
    setUpdateSuccess('');
    
    try {
      const cacheBuster = generateCacheBuster();
      const headers = createAuthHeaders();
      
      const response = await fetch(`/api/orders/${encodeURIComponent(params.id as string)}/status?${cacheBuster}`, {
        method: 'PATCH',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        body: JSON.stringify({
          status: selectedStatus
        }),
        cache: 'no-store'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `Failed to update status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('Status update response:', responseData);
      
      setUpdateSuccess(`Status pesanan berhasil diubah menjadi ${selectedStatus}`);
      setOpenStatusDialog(false);
      
      // Refresh order details after status change
      setTimeout(() => {
        refreshOrderDetails();
      }, 1000);
      
    } catch (error: any) {
      console.error('Error updating status:', error);
      setUpdateError(error.message || 'An error occurred while updating order status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmStatusChange = () => {
    if (!selectedStatus) return;
    handleUpdateStatus();
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10 flex justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button
          className="mt-4"
          variant="outline"
          onClick={handleBack}
        >
          ← Kembali
        </Button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto py-10">
        <Alert>
          <AlertTitle>Not Found</AlertTitle>
          <AlertDescription>Pesanan tidak ditemukan</AlertDescription>
        </Alert>
        <Button
          className="mt-4"
          variant="outline"
          onClick={handleBack}
        >
          ← Kembali
        </Button>
      </div>
    );
  }

  // Calculate total amount with debug logging
  const calculateTotal = () => {
    console.log("Calculating total from items:", order.items);

    let total = 0;
    let totalWeight = 0;

    if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
      console.log("No items to calculate total from");
      return { total: 0, totalWeight: 0 };
    }

    // Log each item's contribution to total
    order.items.forEach((item: any, index: number) => {
      console.log(`Raw item ${index} data:`, JSON.stringify(item));

      // Untuk item berbasis berat, gunakan weight jika tersedia
      let quantity = Number(item.quantity) || 1;
      const price = Number(item.price || item.unitPrice || 0);

      // Check if this is a weight-based item by service priceModel
      const isWeightBased = item.service?.priceModel === 'per_kg';

      console.log(`Item ${index} is weight-based:`, isWeightBased);

      let calculatedWeight = 0;
      let itemSubtotal = 0;

      if (isWeightBased) {
        // First priority: explicit weight field
        if (item.weight !== undefined && item.weight !== null) {
          calculatedWeight = Number(item.weight) || 0;
          console.log(`Item ${index}: Using weight field: ${calculatedWeight}kg`);
        }
        // Second priority: extract weight from notes
        else if (item.notes && item.notes.includes('Weight:')) {
          const match = item.notes.match(/Weight: ([\d.]+) kg/);
          if (match && match[1]) {
            calculatedWeight = parseFloat(match[1]) || 0;
            console.log(`Item ${index}: Found weight in notes: ${calculatedWeight}kg`);
          }
        }
        // Third priority: if we have subtotal, derive weight from it
        else if (item.subtotal && price) {
          calculatedWeight = (Number(item.subtotal) || 0) / (price || 1);
          console.log(`Item ${index}: Derived weight from subtotal/price: ${calculatedWeight}kg`);
        }
        // Last resort: use quantity as weight
        else {
          calculatedWeight = Number(quantity) || 0;
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

      // Safety check to prevent NaN values
      if (isNaN(itemSubtotal)) {
        console.warn(`Item ${index}: Calculated subtotal is NaN, using 0 instead`);
        itemSubtotal = 0;
      }

      // Prefer actual subtotal in database if it's reasonably close to our calculation
      // This helps with legacy data
      const storedSubtotal = Number(item.subtotal || item.totalPrice || 0);

      if (storedSubtotal > 0) {
        // Check if within reasonable variance (within 10%)
        const variance = Math.abs((storedSubtotal - itemSubtotal) / (itemSubtotal || 1));

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

    // Safety check to prevent NaN values in final results
    if (isNaN(total)) {
      console.warn("Total calculated is NaN, using 0 instead");
      total = 0;
    }

    if (isNaN(totalWeight)) {
      console.warn("Total weight calculated is NaN, using 0 instead");
      totalWeight = 0;
    }

    console.log("Total calculated:", total);
    console.log("Total weight calculated:", totalWeight);

    // For debug: compare with other potential totals
    const rawTotal = Number(order.totalAmount || 0);
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
      if (payment.status === 'completed') {
        // Ensure the amount is a number
        const amount = Number(payment.amount) || 0;
        return total + amount;
      }
      return total;
    }, 0);
  };

  const totalPaid = getTotalPaid();
  const isFullyPaid = totalPaid >= orderTotal;

  // Ensure we have valid numeric values for display
  const displayTotal = isNaN(orderTotal) ? 0 : orderTotal;
  const displayTotalPaid = isNaN(totalPaid) ? 0 : totalPaid;
  const remainingBalance = Math.max(0, displayTotal - displayTotalPaid);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header section */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{formatTitle(order)}</h1>

        <div className="flex gap-2">
          {/* Status update success message */}
          {updateSuccess && (
            <Alert className="max-w-md border-green-500 bg-green-50 text-green-800">
              <AlertDescription>{updateSuccess}</AlertDescription>
            </Alert>
          )}

          {/* Status update error message */}
          {updateError && (
            <Alert variant="destructive" className="max-w-md">
              <AlertDescription>{updateError}</AlertDescription>
            </Alert>
          )}

          {/* Status change button */}
          <Button
            variant="outline"
            onClick={handleOpenStatusDialog}
            disabled={isUpdating}
          >
            Ubah Status
          </Button>

          {/* Only show Process Payment button if order isn't fully paid */}
          {!isFullyPaid && (
            <Button
              variant="default"
              asChild
            >
              <Link href={`/orders/${params.id}/payment`}>
                💰 Proses Pembayaran
              </Link>
            </Button>
          )}

          {/* If fully paid, show a disabled button with paid status */}
          {isFullyPaid && (
            <Button
              variant="outline"
              disabled
            >
              ✓ Lunas
            </Button>
          )}

          <Button
            variant="outline"
            onClick={handleBack}
          >
            ← Kembali ke Daftar Pesanan
          </Button>
        </div>
      </div>

      {/* Status Change Dialog */}
      <Dialog open={openStatusDialog} onOpenChange={(open) => !open && handleCloseStatusDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ubah Status Pesanan</DialogTitle>
            <DialogDescription>
              Pilih status baru untuk pesanan ini. Status saat ini: <strong>{orderStatusMap[order.status]?.label || order.status}</strong>
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Label htmlFor="status-select">Status Baru</Label>
            <Select
              value={selectedStatus || order.status}
              onValueChange={(value) => handleSelectStatus(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(orderStatusMap).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseStatusDialog}>Batal</Button>
            <Button
              onClick={handleConfirmStatusChange}
              disabled={isUpdating || !selectedStatus}
            >
              {isUpdating ? 'Updating...' : 'Konfirmasi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Details Card */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">Detail Pesanan</h3>
              <div className="space-y-2">
                <p>ID: {order.orderNumber || order.id}</p>
                <p>Tanggal Pesanan: {format(new Date(order.createdAt), 'dd MMMM yyyy HH:mm', { locale: id })}</p>
                <div className="flex items-center">
                  <span className="mr-2">Status:</span>
                  <Badge 
                    variant={
                      order.status === 'new' ? 'default' :
                      order.status === 'processing' ? 'secondary' :
                      order.status === 'ready' ? 'success' :
                      order.status === 'delivered' ? 'outline' :
                      order.status === 'cancelled' ? 'destructive' : 'default'
                    }
                  >
                    {orderStatusMap[order.status]?.label || order.status}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-4">Informasi Pelanggan</h3>
              {order.customer && (
                <div className="space-y-2">
                  <p>Nama: {order.customer.name}</p>
                  <p>Telepon: {order.customer.phone || '-'}</p>
                  <p>Email: {order.customer.email || '-'}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items Card */}
      <Card>
        <CardHeader>
          <CardTitle>Item Pesanan</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Layanan</TableHead>
                <TableHead className="text-right">Berat/Jumlah</TableHead>
                <TableHead className="text-right">Harga</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items && order.items.length > 0 ? (
                order.items.map((item, index) => {
                  // Determine if this is a weight-based item
                  const isWeightBased = item.weightBased;

                  // Format weight with 2 decimal places if it's a weight-based item
                  const displayQty = item.weight
                    ? `${Number(item.weight || 0.5).toFixed(2)} kg`
                    : `${item.quantity || 1}`;

                  return (
                    <TableRow key={item.id || index}>
                      <TableCell>{item.serviceName || 'Unnamed Service'}</TableCell>
                      <TableCell className="text-right">{displayQty}</TableCell>
                      <TableCell className="text-right">Rp {formatCurrency(item.price || item.unitPrice || 0)}</TableCell>
                      <TableCell className="text-right">Rp {formatCurrency(item.subtotal || item.totalPrice || 0)}</TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">Tidak ada item</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="mt-6 space-y-2">
            <div className="flex justify-end">
              <p className="font-semibold">Total Berat: {totalWeight.toFixed(2)} kg</p>
            </div>
            <div className="flex justify-end">
              <p className="font-semibold">Total: Rp {formatCurrency(orderTotal)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Pembayaran</CardTitle>
        </CardHeader>
        <CardContent>
          {order.payments && Array.isArray(order.payments) && order.payments.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                    <TableHead>Metode</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.payments.map((payment, index) => {
                    // For debugging
                    console.log(`Rendering payment ${index}:`, payment);
                    
                    return (
                      <TableRow key={payment.id || `payment-${index}`}>
                        <TableCell>{payment.referenceNumber || '-'}</TableCell>
                        <TableCell>
                          {payment.createdAt
                            ? format(new Date(payment.createdAt), 'dd MMM yyyy HH:mm', { locale: id })
                            : '-'}
                        </TableCell>
                        <TableCell className="text-right">Rp {formatCurrency(payment.amount)}</TableCell>
                        <TableCell>
                          {methodLabels[payment.paymentMethod] || payment.paymentMethod}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              payment.status === 'completed' ? 'success' :
                              payment.status === 'pending' ? 'outline' :
                              payment.status === 'failed' ? 'destructive' :
                              payment.status === 'refunded' ? 'secondary' : 'default'
                            }
                          >
                            {statusLabels[payment.status] || payment.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Summary of payments */}
              <div className="mt-6 flex justify-between items-center">
                <div>
                  <p className="font-semibold">Total Dibayar: Rp {formatCurrency(displayTotalPaid)}</p>
                </div>
                <div>
                  <p className="font-semibold">Sisa: Rp {formatCurrency(remainingBalance)}</p>
                </div>
              </div>

              {/* Payment status summary */}
              <div className="mt-4">
                <Alert className={isFullyPaid 
                  ? "border-green-500 bg-green-50 text-green-800" 
                  : "border-amber-500 bg-amber-50 text-amber-800"
                }>
                  <AlertDescription>
                    {isFullyPaid
                      ? "Pesanan ini telah dibayar sepenuhnya"
                      : `Pesanan ini memiliki sisa pembayaran sebesar Rp ${formatCurrency(remainingBalance)}`}
                  </AlertDescription>
                </Alert>
              </div>
              
              {/* Payment action button for larger screens */}
              {!isFullyPaid && (
                <div className="mt-4 flex justify-end">
                  <Button asChild>
                    <Link href={`/orders/${params.id}/payment`}>
                      💰 Proses Pembayaran
                    </Link>
                  </Button>
                </div>
              )}
            </>
          ) : (
            <>
              <Alert>
                <AlertDescription>Belum ada pembayaran untuk pesanan ini</AlertDescription>
              </Alert>
              
              <div className="mt-6 flex justify-end">
                <Button asChild>
                  <Link href={`/orders/${params.id}/payment`}>
                    💰 Tambah Pembayaran
                  </Link>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}