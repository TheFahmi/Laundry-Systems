'use client';

import React from 'react';
import { Typography, Button } from '@mui/material';
import { Receipt as ReceiptIcon } from '@mui/icons-material';
import Link from 'next/link';

export default function EmptyPayments() {
  return (
    <div className="text-center py-12">
      <div className="mb-4 flex justify-center">
        <ReceiptIcon sx={{ fontSize: 60, opacity: 0.5, color: 'text.secondary' }} />
      </div>
      <Typography variant="h6" gutterBottom>
        Belum Ada Riwayat Pembayaran
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
        Anda belum memiliki riwayat pembayaran. Lakukan pemesanan layanan laundry terlebih dahulu.
      </Typography>
      <Button
        variant="contained"
        component={Link}
        href="/customer/orders"
        color="primary"
      >
        Pesan Laundry Sekarang
      </Button>
    </div>
  );
} 