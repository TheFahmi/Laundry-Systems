'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Tabs,
  Tab,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import {
  Download as DownloadIcon,
  Print as PrintIcon,
  FilterList as FilterIcon,
  InsertChart as ChartIcon,
  PeopleAlt as PeopleIcon
} from '@mui/icons-material';
import Link from 'next/link';

// Dummy data untuk laporan keuangan
const financialData = [
  { tanggal: '2023-03-01', pendapatan: 1250000, biaya: 850000, profit: 400000 },
  { tanggal: '2023-03-02', pendapatan: 980000, biaya: 720000, profit: 260000 },
  { tanggal: '2023-03-03', pendapatan: 1450000, biaya: 950000, profit: 500000 },
  { tanggal: '2023-03-04', pendapatan: 2100000, biaya: 1200000, profit: 900000 },
  { tanggal: '2023-03-05', pendapatan: 1650000, biaya: 1050000, profit: 600000 },
  { tanggal: '2023-03-06', pendapatan: 800000, biaya: 650000, profit: 150000 },
  { tanggal: '2023-03-07', pendapatan: 950000, biaya: 700000, profit: 250000 },
];

// Dummy data untuk laporan layanan
const serviceData = [
  { layanan: 'Cuci Setrika', jumlahOrder: 42, totalPendapatan: 2940000 },
  { layanan: 'Cuci Kering', jumlahOrder: 28, totalPendapatan: 1400000 },
  { layanan: 'Express', jumlahOrder: 15, totalPendapatan: 1800000 },
  { layanan: 'Premium', jumlahOrder: 5, totalPendapatan: 750000 },
  { layanan: 'Cuci Sepatu', jumlahOrder: 8, totalPendapatan: 280000 },
  { layanan: 'Cuci Selimut', jumlahOrder: 12, totalPendapatan: 360000 },
];

// Dummy data untuk laporan pelanggan
const customerData = [
  { nama: 'Budi Santoso', totalOrder: 8, totalBelanja: 1250000, lastOrder: '2023-03-05' },
  { nama: 'Ani Wijaya', totalOrder: 5, totalBelanja: 850000, lastOrder: '2023-03-04' },
  { nama: 'Dodi Prasetyo', totalOrder: 10, totalBelanja: 1850000, lastOrder: '2023-03-06' },
  { nama: 'Siti Rahayu', totalOrder: 4, totalBelanja: 620000, lastOrder: '2023-03-02' },
  { nama: 'Rudi Hartono', totalOrder: 7, totalBelanja: 1150000, lastOrder: '2023-03-07' },
];

// Tipe untuk kategori laporan
type ReportCategory = 'financial' | 'service' | 'customer';

// Tipe untuk periode laporan
type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export default function ReportsPage() {
  // State untuk tab kategori
  const [category, setCategory] = useState<ReportCategory>('financial');
  
  // State untuk periode laporan
  const [period, setPeriod] = useState<ReportPeriod>('daily');
  
  // Handler untuk perubahan kategori
  const handleCategoryChange = (event: React.SyntheticEvent, newValue: ReportCategory) => {
    setCategory(newValue);
  };
  
  // Handler untuk perubahan periode
  const handlePeriodChange = (event: SelectChangeEvent<ReportPeriod>) => {
    setPeriod(event.target.value as ReportPeriod);
  };
  
  // Render konten berdasarkan kategori
  const renderCategoryContent = () => {
    switch (category) {
      case 'financial':
        return (
          <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                Laporan Keuangan - {
                  period === 'daily' ? 'Harian' : 
                  period === 'weekly' ? 'Mingguan' : 
                  period === 'monthly' ? 'Bulanan' : 'Tahunan'
                }
              </Typography>
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
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tanggal</TableCell>
                    <TableCell align="right">Pendapatan (Rp)</TableCell>
                    <TableCell align="right">Biaya (Rp)</TableCell>
                    <TableCell align="right">Profit (Rp)</TableCell>
                    <TableCell align="right">Margin (%)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {financialData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Link href={`/reports/detail?date=${row.tanggal}&type=financial`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          {new Date(row.tanggal).toLocaleDateString('id-ID')}
                        </Link>
                      </TableCell>
                      <TableCell align="right">{row.pendapatan.toLocaleString()}</TableCell>
                      <TableCell align="right">{row.biaya.toLocaleString()}</TableCell>
                      <TableCell align="right">{row.profit.toLocaleString()}</TableCell>
                      <TableCell align="right">
                        {((row.profit / row.pendapatan) * 100).toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Ringkasan:
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2">
                    Total Pendapatan: Rp {financialData.reduce((sum, item) => sum + item.pendapatan, 0).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2">
                    Total Biaya: Rp {financialData.reduce((sum, item) => sum + item.biaya, 0).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2">
                    Total Profit: Rp {financialData.reduce((sum, item) => sum + item.profit, 0).toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Box>
        );
      
      case 'service':
        return (
          <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                Laporan Layanan - {
                  period === 'daily' ? 'Harian' : 
                  period === 'weekly' ? 'Mingguan' : 
                  period === 'monthly' ? 'Bulanan' : 'Tahunan'
                }
              </Typography>
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
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Layanan</TableCell>
                    <TableCell align="right">Jumlah Order</TableCell>
                    <TableCell align="right">Total Pendapatan (Rp)</TableCell>
                    <TableCell align="right">Rata-rata Per Order (Rp)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {serviceData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.layanan}</TableCell>
                      <TableCell align="right">{row.jumlahOrder}</TableCell>
                      <TableCell align="right">{row.totalPendapatan.toLocaleString()}</TableCell>
                      <TableCell align="right">
                        {(row.totalPendapatan / row.jumlahOrder).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Ringkasan:
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    Total Order: {serviceData.reduce((sum, item) => sum + item.jumlahOrder, 0)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    Total Pendapatan: Rp {serviceData.reduce((sum, item) => sum + item.totalPendapatan, 0).toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Box>
        );
      
      case 'customer':
        return (
          <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                Laporan Pelanggan - {
                  period === 'daily' ? 'Harian' : 
                  period === 'weekly' ? 'Mingguan' : 
                  period === 'monthly' ? 'Bulanan' : 'Tahunan'
                }
              </Typography>
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
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nama Pelanggan</TableCell>
                    <TableCell align="right">Total Order</TableCell>
                    <TableCell align="right">Total Belanja (Rp)</TableCell>
                    <TableCell align="right">Rata-rata Per Order (Rp)</TableCell>
                    <TableCell>Terakhir Order</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {customerData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.nama}</TableCell>
                      <TableCell align="right">{row.totalOrder}</TableCell>
                      <TableCell align="right">{row.totalBelanja.toLocaleString()}</TableCell>
                      <TableCell align="right">
                        {(row.totalBelanja / row.totalOrder).toLocaleString()}
                      </TableCell>
                      <TableCell>{new Date(row.lastOrder).toLocaleDateString('id-ID')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Ringkasan:
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2">
                    Total Pelanggan: {customerData.length}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2">
                    Total Order: {customerData.reduce((sum, item) => sum + item.totalOrder, 0)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2">
                    Total Belanja: Rp {customerData.reduce((sum, item) => sum + item.totalBelanja, 0).toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Box>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1">
            Laporan
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button 
              component={Link}
              href="/customer-segments"
              startIcon={<PeopleIcon />} 
              variant="contained" 
              color="secondary"
              size="small" 
              sx={{ mr: 2 }}
            >
              Segmentasi Pelanggan
            </Button>
            <Button 
              component={Link}
              href="/reports/analytics"
              startIcon={<ChartIcon />} 
              variant="contained" 
              color="primary"
              size="small" 
              sx={{ mr: 2 }}
            >
              Analisis Lanjutan
            </Button>
            <Button 
              startIcon={<FilterIcon />} 
              variant="outlined" 
              size="small" 
              sx={{ mr: 2 }}
            >
              Filter
            </Button>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="period-select-label">Periode</InputLabel>
              <Select
                labelId="period-select-label"
                value={period}
                label="Periode"
                onChange={handlePeriodChange}
              >
                <MenuItem value="daily">Harian</MenuItem>
                <MenuItem value="weekly">Mingguan</MenuItem>
                <MenuItem value="monthly">Bulanan</MenuItem>
                <MenuItem value="yearly">Tahunan</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
        
        <Tabs
          value={category}
          onChange={handleCategoryChange}
          sx={{ mb: 3 }}
        >
          <Tab label="Keuangan" value="financial" />
          <Tab label="Layanan" value="service" />
          <Tab label="Pelanggan" value="customer" />
        </Tabs>
        
        <Divider sx={{ mb: 3 }} />
        
        {renderCategoryContent()}
      </CardContent>
    </Card>
  );
} 