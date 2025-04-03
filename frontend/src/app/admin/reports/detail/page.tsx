'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Breadcrumbs,
  Chip,
  Grid,
  Divider
} from '@mui/material';
import {
  Download as DownloadIcon,
  Print as PrintIcon,
  ArrowBack as ArrowBackIcon,
  ArrowLeft
} from '@mui/icons-material';
import Link from 'next/link';

// Dummy data untuk laporan detail
const financialDetails = [
  { tanggal: '2023-03-01', 
    orderNo: 'ORD001', 
    pelanggan: 'Budi Santoso', 
    layanan: 'Cuci Setrika', 
    berat: 3.5, 
    jumlah: 1, 
    harga: 7000, 
    total: 24500,
    status: 'lunas'
  },
  { tanggal: '2023-03-01', 
    orderNo: 'ORD002', 
    pelanggan: 'Ani Wijaya', 
    layanan: 'Cuci Kering', 
    berat: 2.0, 
    jumlah: 1, 
    harga: 5000, 
    total: 10000,
    status: 'lunas'
  },
  { tanggal: '2023-03-01', 
    orderNo: 'ORD003', 
    pelanggan: 'Dodi Prasetyo', 
    layanan: 'Cuci Sepatu', 
    berat: 0, 
    jumlah: 2, 
    harga: 35000, 
    total: 70000,
    status: 'lunas'
  },
  { tanggal: '2023-03-01', 
    orderNo: 'ORD004', 
    pelanggan: 'Siti Rahayu', 
    layanan: 'Cuci Selimut', 
    berat: 0, 
    jumlah: 3, 
    harga: 30000, 
    total: 90000,
    status: 'pending'
  },
  { tanggal: '2023-03-01', 
    orderNo: 'ORD005', 
    pelanggan: 'Rudi Hartono', 
    layanan: 'Cuci Setrika Express', 
    berat: 4.0, 
    jumlah: 1, 
    harga: 12000, 
    total: 48000,
    status: 'lunas'
  },
];

export default function ReportDetailPage() {
  const searchParams = useSearchParams();
  const date = searchParams?.get('date') || '2023-03-01';
  const type = searchParams?.get('type') || 'financial';
  
  // Menghitung total pendapatan untuk tanggal tertentu
  const totalRevenue = financialDetails.reduce((sum, item) => sum + item.total, 0);
  
  // Menghitung total transaksi
  const totalTransactions = financialDetails.length;
  
  // Menghitung rata-rata transaksi
  const averageTransaction = totalTransactions > 0 
    ? totalRevenue / totalTransactions 
    : 0;
  
  // Menghitung biaya operasional (dummy)
  const operationalCost = totalRevenue * 0.65;
  
  // Menghitung profit 
  const profit = totalRevenue - operationalCost;
  
  // Menghitung margin profit
  const profitMargin = totalRevenue > 0 
    ? (profit / totalRevenue) * 100 
    : 0;
  
  return (
    <Card>
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Breadcrumbs sx={{ mb: 2 }}>
            <Link href="/admin/reports">
              <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
                <ArrowBackIcon sx={{ mr: 0.5, fontSize: 18 }} />
                Kembali ke Laporan
              </Typography>
            </Link>
            <Typography color="text.primary">Detail Laporan</Typography>
          </Breadcrumbs>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h5" component="h1" gutterBottom>
                Detail Laporan {type === 'financial' ? 'Keuangan' : type === 'service' ? 'Layanan' : 'Pelanggan'}
              </Typography>
              <Typography variant="subtitle1">
                Tanggal: {new Date(date).toLocaleDateString('id-ID', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Typography>
            </Box>
            
            <Box>
              <Button 
                startIcon={<DownloadIcon />} 
                variant="outlined" 
                size="small"
                sx={{ mr: 1 }}
              >
                Ekspor
              </Button>
              <Button 
                startIcon={<PrintIcon />} 
                variant="outlined" 
                size="small"
              >
                Cetak
              </Button>
            </Box>
          </Box>
        </Box>
        
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Total Pendapatan
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  Rp {totalRevenue.toLocaleString()}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Jumlah Transaksi
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {totalTransactions}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Rata-rata Transaksi
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  Rp {averageTransaction.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Profit Margin
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {profitMargin.toFixed(1)}%
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
        
        <Typography variant="h6" gutterBottom>
          Rincian Transaksi
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>No. Pesanan</TableCell>
                <TableCell>Pelanggan</TableCell>
                <TableCell>Layanan</TableCell>
                <TableCell align="right">Berat (kg)</TableCell>
                <TableCell align="right">Jumlah</TableCell>
                <TableCell align="right">Harga (Rp)</TableCell>
                <TableCell align="right">Total (Rp)</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {financialDetails.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.orderNo}</TableCell>
                  <TableCell>{row.pelanggan}</TableCell>
                  <TableCell>{row.layanan}</TableCell>
                  <TableCell align="right">{row.berat > 0 ? row.berat : '-'}</TableCell>
                  <TableCell align="right">{row.jumlah}</TableCell>
                  <TableCell align="right">{row.harga.toLocaleString()}</TableCell>
                  <TableCell align="right">{row.total.toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip 
                      label={row.status === 'lunas' ? 'Lunas' : 'Pending'} 
                      color={row.status === 'lunas' ? 'success' : 'warning'} 
                      size="small" 
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <Divider sx={{ my: 3 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Ringkasan Biaya
              </Typography>
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  mb: 1
                }}
              >
                <Typography variant="body2">Total Pendapatan</Typography>
                <Typography variant="body2">Rp {totalRevenue.toLocaleString()}</Typography>
              </Box>
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  mb: 1
                }}
              >
                <Typography variant="body2">Biaya Operasional</Typography>
                <Typography variant="body2">Rp {operationalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  fontWeight: 'bold'
                }}
              >
                <Typography variant="body1">Profit</Typography>
                <Typography variant="body1">Rp {profit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Catatan
              </Typography>
              <Typography variant="body2" paragraph>
                Laporan ini menunjukkan detail transaksi pada tanggal {new Date(date).toLocaleDateString('id-ID')}.
              </Typography>
              <Typography variant="body2">
                Total 5 transaksi pada hari ini dengan tingkat konversi 100%. Semua transaksi selesai tepat waktu dan 4 transaksi telah dibayar lunas.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
} 