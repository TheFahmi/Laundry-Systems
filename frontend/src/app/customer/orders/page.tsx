'use client';

import React, { useState, useEffect } from 'react';
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
  CircularProgress
} from '@mui/material';
import { 
  Search as SearchIcon, 
  CalendarMonth as CalendarIcon,
  FilterList as FilterIcon 
} from '@mui/icons-material';
import Link from 'next/link';

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: string;
  items: number;
  total: number;
  paymentStatus: string;
}

// Sample data
const sampleOrders: Order[] = [
  { 
    id: 'ord-001', 
    orderNumber: 'ORD-12345', 
    date: '2023-04-01', 
    status: 'Dalam Proses', 
    items: 3, 
    total: 75000, 
    paymentStatus: 'Lunas' 
  },
  { 
    id: 'ord-002', 
    orderNumber: 'ORD-12346', 
    date: '2023-03-25', 
    status: 'Siap Diambil', 
    items: 2, 
    total: 45000, 
    paymentStatus: 'Lunas' 
  },
  { 
    id: 'ord-003', 
    orderNumber: 'ORD-12347', 
    date: '2023-03-20', 
    status: 'Selesai', 
    items: 5, 
    total: 120000, 
    paymentStatus: 'Lunas' 
  },
  { 
    id: 'ord-004', 
    orderNumber: 'ORD-12348', 
    date: '2023-03-15', 
    status: 'Dibatalkan', 
    items: 1, 
    total: 35000, 
    paymentStatus: 'Dikembalikan' 
  },
  { 
    id: 'ord-005', 
    orderNumber: 'ORD-12349', 
    date: '2023-03-10', 
    status: 'Selesai', 
    items: 4, 
    total: 95000, 
    paymentStatus: 'Lunas' 
  },
  { 
    id: 'ord-006', 
    orderNumber: 'ORD-12350', 
    date: '2023-03-05', 
    status: 'Selesai', 
    items: 2, 
    total: 50000, 
    paymentStatus: 'Lunas' 
  },
  { 
    id: 'ord-007', 
    orderNumber: 'ORD-12351', 
    date: '2023-02-28', 
    status: 'Selesai', 
    items: 3, 
    total: 65000, 
    paymentStatus: 'Lunas' 
  },
];

export default function CustomerOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setOrders(sampleOrders);
      setLoading(false);
    }, 1000);
  }, []);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
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

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'Lunas':
        return 'success';
      case 'Belum Bayar':
        return 'warning';
      case 'Dikembalikan':
        return 'error';
      default:
        return 'default';
    }
  };

  const filteredOrders = orders.filter(order => {
    // Filter by tab value
    if (tabValue === 1 && order.status !== 'Dalam Proses') return false;
    if (tabValue === 2 && order.status !== 'Siap Diambil') return false;
    if (tabValue === 3 && order.status !== 'Selesai') return false;
    
    // Filter by search term
    if (searchTerm && !order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Pesanan Saya
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Lihat dan kelola pesanan laundry Anda
        </Typography>
      </Box>

      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <TextField
          placeholder="Cari pesanan..."
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: { xs: '100%', sm: '300px' } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        
        <Button 
          variant="contained" 
          component={Link} 
          href="/customer/orders/new"
          color="primary"
        >
          Pesan Baru
        </Button>
      </Box>

      <Paper sx={{ mb: 4, overflow: 'hidden' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Semua" />
          <Tab label="Sedang Diproses" />
          <Tab label="Siap Diambil" />
          <Tab label="Selesai" />
        </Tabs>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Nomor Pesanan</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Tanggal</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Item</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Pembayaran</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((order) => (
                <TableRow key={order.id} hover>
                  <TableCell>
                    <Link href={`/customer/orders/${order.id}`} style={{ textDecoration: 'none', color: 'primary' }}>
                      <Typography variant="body2" color="primary" fontWeight={500}>
                        {order.orderNumber}
                      </Typography>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <CalendarIcon fontSize="small" sx={{ mr: 1, opacity: 0.6 }} />
                      <Typography variant="body2">{order.date}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{order.items}</TableCell>
                  <TableCell>Rp {order.total.toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip 
                      label={order.status} 
                      size="small" 
                      color={getStatusColor(order.status) as any} 
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={order.paymentStatus} 
                      size="small" 
                      variant="outlined"
                      color={getPaymentStatusColor(order.paymentStatus) as any} 
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button 
                      component={Link} 
                      href={`/customer/orders/${order.id}`}
                      variant="text" 
                      size="small"
                    >
                      Detail
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1">Tidak ada pesanan ditemukan</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {tabValue === 0 
                        ? 'Anda belum memiliki pesanan. Buat pesanan baru sekarang!' 
                        : 'Tidak ada pesanan yang sesuai dengan filter yang dipilih.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredOrders.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Baris per halaman:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} dari ${count}`}
        />
      </Paper>
    </Box>
  );
} 