'use client';

import React, { useState, useEffect } from 'react';
import {
  Container, Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, TextField,
  TablePagination, Chip, CircularProgress, InputAdornment,
  IconButton, MenuItem, Select, FormControl, InputLabel, Alert,
  SelectChangeEvent
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
  getAllOrders, OrderStatus, OrderFilters, Order 
} from '@/api/orders';

// Status chip colors
const statusColors: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'warning',
  [OrderStatus.PROCESSING]: 'info',
  [OrderStatus.COMPLETED]: 'success',
  [OrderStatus.CANCELLED]: 'error',
  [OrderStatus.DELIVERED]: 'primary',
};

// Terjemahan status pesanan
const statusLabels: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'Menunggu',
  [OrderStatus.PROCESSING]: 'Diproses',
  [OrderStatus.COMPLETED]: 'Selesai',
  [OrderStatus.CANCELLED]: 'Dibatalkan',
  [OrderStatus.DELIVERED]: 'Dikirim',
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalOrders, setTotalOrders] = useState(0);
  
  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [filters, setFilters] = useState<OrderFilters>({
    page: 1,
    limit: 10,
  });

  // Fetch pesanan dari API
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getAllOrders({
        ...filters,
        page: page + 1,
        limit: rowsPerPage,
        query: searchQuery || undefined,
        status: statusFilter || undefined
      });
      
      setOrders(response.data);
      setTotalOrders(response.meta.total);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Terjadi kesalahan saat mengambil data pesanan');
    } finally {
      setLoading(false);
    }
  };

  // Load orders when filters change
  useEffect(() => {
    fetchOrders();
  }, [page, rowsPerPage, filters]);
  
  // Handle page change
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Apply search filter
  const handleSearch = () => {
    setPage(0);
    fetchOrders();
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setPage(0);
    setFilters({
      page: 1,
      limit: rowsPerPage,
    });
  };
  
  // Handle status filter change
  const handleStatusFilterChange = (event: SelectChangeEvent<string>) => {
    setStatusFilter(event.target.value as OrderStatus | '');
  };
  
  // Go to order detail page
  const handleViewOrder = (orderId: string) => {
    router.push(`/orders/${orderId}`);
  };
  
  // Go to create order page
  const handleCreateOrder = () => {
    router.push('/orders/new');
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">
          Daftar Pesanan
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleCreateOrder}
        >
          Tambah Pesanan
        </Button>
      </Box>
      
      {/* Search & Filter */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <TextField
            label="Cari pesanan"
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
          
          {(searchQuery || statusFilter) && (
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
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                label="Status"
              >
                <MenuItem value="">Semua Status</MenuItem>
                {Object.values(OrderStatus).map((status) => (
                  <MenuItem key={status} value={status}>
                    {statusLabels[status]}
                  </MenuItem>
                ))}
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
      
      {/* Orders Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>No. Pesanan</TableCell>
                <TableCell>Pelanggan</TableCell>
                <TableCell>Tanggal</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={30} />
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    Tidak ada pesanan ditemukan
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id} hover>
                    <TableCell>{order.orderNumber}</TableCell>
                    <TableCell>{order.customer.name}</TableCell>
                    <TableCell>
                      {format(new Date(order.createdAt), 'dd MMM yyyy', { locale: id })}
                    </TableCell>
                    <TableCell>Rp {order.totalAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip 
                        label={statusLabels[order.status]} 
                        color={statusColors[order.status] as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        variant="text"
                        size="small"
                        onClick={() => handleViewOrder(order.id)}
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
          count={totalOrders}
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