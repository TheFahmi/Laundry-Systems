'use client';

import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon,
  CreditCard as CreditCardIcon,
  Schedule as ScheduleIcon,
  Done as DoneIcon
} from '@mui/icons-material';
import { PaymentStats as PaymentStatsType } from '@/types/payment';

interface PaymentStatsProps {
  stats: PaymentStatsType;
}

export default function PaymentStats({ stats }: PaymentStatsProps) {
  const { totalPayments, completedPayments, pendingPayments, totalAmount } = stats;

  // Format currency
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Card items config
  const statCards = [
    {
      title: 'Total Pembayaran',
      value: totalPayments,
      icon: <AccountBalanceIcon fontSize="large" sx={{ color: 'primary.main' }} />,
      description: 'Jumlah total transaksi',
      bgColor: 'rgba(25, 118, 210, 0.08)'
    },
    {
      title: 'Pembayaran Selesai',
      value: completedPayments,
      icon: <DoneIcon fontSize="large" sx={{ color: 'success.main' }} />,
      description: 'Transaksi yang telah selesai',
      bgColor: 'rgba(76, 175, 80, 0.08)'
    },
    {
      title: 'Pembayaran Tertunda',
      value: pendingPayments,
      icon: <ScheduleIcon fontSize="large" sx={{ color: 'warning.main' }} />,
      description: 'Transaksi yang masih diproses',
      bgColor: 'rgba(255, 152, 0, 0.08)'
    },
    {
      title: 'Total Nilai Transaksi',
      value: formatRupiah(totalAmount),
      icon: <CreditCardIcon fontSize="large" sx={{ color: 'info.main' }} />,
      description: 'Nilai total pembayaran',
      bgColor: 'rgba(3, 169, 244, 0.08)'
    }
  ];

  return (
    <Box mb={4}>
      <Grid container spacing={3}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                height: '100%', 
                backgroundColor: card.bgColor,
                borderRadius: 2
              }}
            >
              <Box 
                display="flex" 
                flexDirection="column" 
                height="100%"
              >
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Typography variant="h6" fontWeight="medium" color="text.primary">
                    {card.title}
                  </Typography>
                  {card.icon}
                </Box>
                <Typography variant="h4" fontWeight="bold" mb={1}>
                  {card.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {card.description}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
} 