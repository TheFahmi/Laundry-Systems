'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  Chip,
  Button,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Skeleton,
  Divider,
  Card,
  CardContent,
  CardHeader,
  SelectChangeEvent
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Receipt as ReceiptIcon,
  FilterList as FilterIcon,
  CreditCard as CreditCardIcon,
  AccountBalance as BankIcon,
  MonetizationOn as CashIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import Link from 'next/link';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useCustomerPayments } from '@/services/usePaymentQuery';
import { Payment } from '@/services/customerPayment.service';
import PaymentList from '@/components/payment/PaymentList';
import PaymentStats from '@/components/payment/PaymentStats';
import PaymentFilterForm from '@/components/payment/PaymentFilterForm';
import EmptyPayments from '@/components/payment/EmptyPayments';
import PageTitle from '@/components/shared/PageTitle';
import { PaymentFilter, PaymentStats as PaymentStatsType } from '@/types/payment';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

// Payment status chip colors
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'paid':
    case 'completed':
      return 'success';
    case 'pending':
      return 'warning';
    case 'failed':
      return 'error';
    case 'refunded':
      return 'info';
    default:
      return 'default';
  }
};

// Payment status display text
const getStatusText = (status: string) => {
  switch (status.toLowerCase()) {
    case 'paid':
    case 'completed':
      return 'Lunas';
    case 'pending':
      return 'Menunggu';
    case 'failed':
      return 'Gagal';
    case 'refunded':
      return 'Dikembalikan';
    default:
      return status;
  }
};

// Format payment method display
const getPaymentMethodDisplay = (method: string) => {
  switch (method.toLowerCase()) {
    case 'cash':
      return { 
        text: 'Tunai', 
        icon: <CashIcon fontSize="small" /> 
      };
    case 'bank_transfer':
      return { 
        text: 'Transfer Bank', 
        icon: <BankIcon fontSize="small" /> 
      };
    case 'credit_card':
    case 'debit_card':
      return { 
        text: 'Kartu', 
        icon: <CreditCardIcon fontSize="small" /> 
      };
    default:
      return { 
        text: method, 
        icon: <ReceiptIcon fontSize="small" /> 
      };
  }
};

// Format date to Indonesian format
const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), 'dd MMMM yyyy, HH.mm', { locale: id });
  } catch (error) {
    return dateString;
  }
};

// Format currency to Rupiah
const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export default function CustomerPayments() {
  const [filter, setFilter] = useState<PaymentFilter | undefined>();
  
  const {
    paymentsResponse,
    isLoading,
    error,
    page,
    limit,
    fetchPayments,
    handlePageChange,
    handleLimitChange,
    handleFilterChange,
  } = useCustomerPayments({
    initialPage: 1,
    initialLimit: 10,
    initialFilter: filter,
  });

  // Handle filter submission
  const handleFilterSubmit = (newFilter: PaymentFilter) => {
    setFilter(newFilter);
    handleFilterChange(newFilter);
  };

  // Reset filters
  const handleResetFilter = () => {
    setFilter(undefined);
    handleFilterChange({});
  };

  // Calculate payment stats
  const calculatePaymentStats = (): PaymentStatsType => {
    const payments = paymentsResponse?.items || [];
    
    return {
      totalPayments: paymentsResponse?.total || 0,
      completedPayments: payments.filter((p: any) => p.status === 'completed').length,
      pendingPayments: payments.filter((p: any) => p.status === 'pending').length,
      totalAmount: payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0),
    };
  };

  const paymentStats = calculatePaymentStats();
  
  // Check if payments data exists
  const hasPayments = paymentsResponse?.items && paymentsResponse.items.length > 0;

  return (
    <div className="container mx-auto px-4 py-6">
      <PageTitle title="Payment History" />
      
      {/* Payment Stats */}
      <PaymentStats stats={paymentStats} />
      
      {/* Filter Card */}
      <Card className="mb-6">
        <CardHeader className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Filter Payments</h3>
          {filter && Object.keys(filter).some(key => !!filter[key as keyof PaymentFilter]) && (
            <Button 
              variant="outlined"
              color="error"
              size="small"
              onClick={handleResetFilter}
            >
              Reset Filters
            </Button>
          )}
        </CardHeader>
        <Divider />
        <CardContent>
          <PaymentFilterForm onSubmit={handleFilterSubmit} initialValues={filter} />
        </CardContent>
      </Card>
      
      {/* Payments List Card */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Payment Transactions</h3>
        </CardHeader>
        <Divider />
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <div className="text-center py-10 text-danger">
              <p>{error}</p>
              <Button 
                variant="contained" 
                color="primary" 
                className="mt-4"
                onClick={() => fetchPayments()}
              >
                Try Again
              </Button>
            </div>
          ) : !hasPayments ? (
            <EmptyPayments />
          ) : (
            <PaymentList 
              payments={paymentsResponse.items}
              pagination={{
                page,
                limit,
                total: paymentsResponse.total,
                onPageChange: handlePageChange,
                onLimitChange: handleLimitChange,
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
} 