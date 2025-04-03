'use client';

import React from 'react';
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  Chip,
  IconButton,
  Tooltip,
  Box,
  Typography
} from '@mui/material';
import { Visibility as VisibilityIcon } from '@mui/icons-material';
import Link from 'next/link';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

// Helper functions
const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), 'dd MMMM yyyy, HH.mm', { locale: id });
  } catch (error) {
    return dateString;
  }
};

const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Get status color
const getStatusColor = (status: string): "success" | "warning" | "error" | "info" | "default" => {
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

// Get status text
const getStatusText = (status: string): string => {
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

interface Payment {
  id: string;
  orderId?: string;
  orderNumber?: string;
  amount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  transactionId?: string;
}

interface PaymentListProps {
  payments: Payment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
  };
}

export default function PaymentList({ payments, pagination }: PaymentListProps) {
  const { page, limit, total, onPageChange, onLimitChange } = pagination;

  // Handle pagination changes
  const handleChangePage = (_: any, newPage: number) => {
    onPageChange(newPage + 1); // Convert 0-based to 1-based
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    onLimitChange(parseInt(event.target.value, 10));
  };

  return (
    <div>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tanggal</TableCell>
              <TableCell>No. Pesanan</TableCell>
              <TableCell>Metode</TableCell>
              <TableCell>Jumlah</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id} hover>
                <TableCell>{formatDate(payment.createdAt)}</TableCell>
                <TableCell>
                  <Link href={`/customer/orders/${payment.orderId}`} style={{ textDecoration: 'none' }}>
                    <Typography variant="body2" color="primary" fontWeight={500}>
                      {payment.orderNumber || `ORD-${payment.orderId?.slice(0, 8)}`}
                    </Typography>
                  </Link>
                </TableCell>
                <TableCell>
                  {payment.paymentMethod}
                </TableCell>
                <TableCell>{formatRupiah(payment.amount)}</TableCell>
                <TableCell>
                  <Chip
                    label={getStatusText(payment.status)}
                    size="small"
                    color={getStatusColor(payment.status)}
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Lihat Detail">
                    <IconButton
                      component={Link}
                      href={`/customer/payments/${payment.id}`}
                      size="small"
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={total}
        rowsPerPage={limit}
        page={page - 1} // Convert 1-based to 0-based
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Baris per halaman:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} dari ${count}`}
      />
    </div>
  );
} 