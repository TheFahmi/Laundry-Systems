'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Container, Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, TextField,
  TablePagination, Chip, CircularProgress, InputAdornment,
  IconButton, MenuItem, Select, FormControl, InputLabel, Alert,
  Tab, Tabs, SelectChangeEvent
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { 
  getPayments, Payment, PaymentFilters, PaymentMethod, PaymentStatus
} from '@/api/payments';

// Status chip colors
const statusColors: Record<string, string> = {
  'pending': 'warning',
  'completed': 'success',
  'failed': 'error',
  'refunded': 'info',
};

// Terjemahan status pembayaran
const statusLabels: Record<string, string> = {
  'pending': 'Tertunda',
  'completed': 'Selesai',
  'failed': 'Gagal',
  'refunded': 'Dikembalikan',
};

// Terjemahan metode pembayaran
const methodLabels: Record<string, string> = {
  'cash': 'Tunai',
  'credit_card': 'Kartu Kredit',
  'bank_transfer': 'Transfer Bank',
  'e_wallet': 'E-Wallet',
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`payment-tabpanel-${index}`}
      aria-labelledby={`payment-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function PaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Tab state
  const [tabValue, setTabValue] = useState(0);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPayments, setTotalPayments] = useState(0);
  
  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [methodFilter, setMethodFilter] = useState<string>('');
  const [filters, setFilters] = useState<PaymentFilters>({
    page: 1,
    limit: 10,
  });

  // Status berdasarkan tab yang aktif
  const activeStatus = useMemo(() => {
    switch (tabValue) {
      case 0: return undefined; // Semua
      case 1: return 'pending'; // Tertunda
      case 2: return 'completed'; // Selesai
      case 3: return 'failed'; // Gagal
      case 4: return 'refunded'; // Dikembalikan
      default: return undefined;
    }
  }, [tabValue]);

  // Fetch pembayaran dari API
  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getPayments({
        ...filters,
        page: page + 1,
        limit: rowsPerPage,
        method: methodFilter || undefined,
        status: activeStatus
      });
      
      setPayments(response.items);
      setTotalPayments(response.total);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('Terjadi kesalahan saat mengambil data pembayaran');
    } finally {
      setLoading(false);
    }
  };

  // Load pembayaran saat filter berubah
  useEffect(() => {
    fetchPayments();
  }, [page, rowsPerPage, filters, activeStatus]);
  
  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setPage(0);
  };
  
  // Handle page change
  const handleChangePage = (_event: unknown, newValue: number) => {
    setPage(newValue);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Apply search filter
  const handleSearch = () => {
    setPage(0);
    fetchPayments();
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setMethodFilter('');
    setPage(0);
    setFilters({
      page: 1,
      limit: rowsPerPage,
    });
  };
  
  // Handle payment method filter change
  const handleMethodFilterChange = (event: SelectChangeEvent<string>) => {
    setMethodFilter(event.target.value);
  };
  
  // Go to payment detail page
  const handleViewPayment = (paymentId: string) => {
    router.push(`/payments/${paymentId}`);
  };
  
  // Go to create payment page
  const handleCreatePayment = () => {
    router.push('/payments/create');
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">
          Pembayaran
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleCreatePayment}
        >
          Tambah Pembayaran
        </Button>
      </Box>
      
      {/* Tabs */}
      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Semua" />
          <Tab label="Tertunda" />
          <Tab label="Selesai" />
          <Tab label="Gagal" />
          <Tab label="Dikembalikan" />
        </Tabs>
      </Paper>
      
      {/* Search & Filter */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <TextField
            label="Cari pembayaran"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton 
                    size="small" 
                    onClick={() => {
                      setSearchQuery('');
                      handleSearch();
                    }}
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          
          <IconButton 
            color={filterOpen ? 'primary' : 'default'} 
            onClick={() => setFilterOpen(!filterOpen)}
          >
            <FilterIcon />
          </IconButton>
          
          <Button 
            variant="outlined"
            size="small"
            onClick={handleSearch}
          >
            Cari
          </Button>
          
          {(searchQuery || methodFilter) && (
            <Button 
              variant="text"
              size="small"
              onClick={handleClearFilters}
              startIcon={<ClearIcon />}
            >
              Reset
            </Button>
          )}
        </Box>
        
        {filterOpen && (
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Metode Pembayaran</InputLabel>
              <Select
                value={methodFilter}
                onChange={handleMethodFilterChange}
                label="Metode Pembayaran"
              >
                <MenuItem value="">Semua Metode</MenuItem>
                <MenuItem value="cash">Tunai</MenuItem>
                <MenuItem value="credit_card">Kartu Kredit</MenuItem>
                <MenuItem value="bank_transfer">Transfer Bank</MenuItem>
                <MenuItem value="e_wallet">E-Wallet</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}
      </Paper>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Payments Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Order ID</TableCell>
                <TableCell>Tanggal</TableCell>
                <TableCell>Jumlah</TableCell>
                <TableCell>Metode</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={30} />
                  </TableCell>
                </TableRow>
              ) : payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    Tidak ada pembayaran ditemukan
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => (
                  <TableRow key={payment.id} hover>
                    <TableCell>{typeof payment.id === 'string' ? payment.id : payment.id}</TableCell>
                    <TableCell>{payment.orderId}</TableCell>
                    <TableCell>
                      {format(new Date(payment.createdAt), 'dd MMM yyyy', { locale: id })}
                    </TableCell>
                    <TableCell>Rp {payment.amount.toLocaleString()}</TableCell>
                    <TableCell>{methodLabels[payment.method] || payment.method}</TableCell>
                    <TableCell>
                      <Chip 
                        label={statusLabels[payment.status] || payment.status} 
                        color={(statusColors[payment.status] as "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning") || "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        variant="text"
                        size="small"
                        onClick={() => handleViewPayment(payment.id)}
                      >
                        Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalPayments}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Baris per halaman:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} dari ${count !== -1 ? count : `lebih dari ${to}`}`
          }
        />
      </Paper>
    </Container>
  );
} 