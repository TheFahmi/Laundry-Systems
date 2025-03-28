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
import { 
  getOrders, OrderStatus, OrderFilters, Order 
} from '@/api/orders';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';

// Status chip colors
const statusColors: Record<string, string> = {
  [OrderStatus.NEW]: 'warning',
  [OrderStatus.PROCESSING]: 'info',
  [OrderStatus.WASHING]: 'info',
  [OrderStatus.DRYING]: 'info',
  [OrderStatus.FOLDING]: 'info',
  [OrderStatus.READY]: 'success',
  [OrderStatus.DELIVERED]: 'primary',
  [OrderStatus.CANCELLED]: 'error',
};

// Terjemahan status pesanan
const statusLabels: Record<string, string> = {
  [OrderStatus.NEW]: 'Baru',
  [OrderStatus.PROCESSING]: 'Diproses',
  [OrderStatus.WASHING]: 'Dicuci',
  [OrderStatus.DRYING]: 'Dikeringkan',
  [OrderStatus.FOLDING]: 'Dilipat',
  [OrderStatus.READY]: 'Siap',
  [OrderStatus.DELIVERED]: 'Dikirim',
  [OrderStatus.CANCELLED]: 'Dibatalkan',
};

// Helper function to format date safely
const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataReceived, setDataReceived] = useState(false);
  const dataProcessedRef = React.useRef(false);
  
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

  // Initialize CSRF token
  const initializeCsrfToken = async () => {
    try {
      console.log('[OrdersPage] Checking for CSRF token');
      // Check if token already exists in sessionStorage
      const existingToken = typeof window !== 'undefined' ? sessionStorage.getItem('csrfToken') : null;
      
      if (existingToken) {
        console.log('[OrdersPage] CSRF token already exists');
        return;
      }
      
      console.log('[OrdersPage] Fetching new CSRF token');
      
      // Try to get a new CSRF token
      const response = await fetch('/api/auth/csrf-token', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch CSRF token: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && (data.csrfToken || (data.data && data.data.csrfToken))) {
        const token = data.csrfToken || data.data.csrfToken;
        console.log('[OrdersPage] Got new CSRF token, storing in session storage');
        sessionStorage.setItem('csrfToken', token);
      } else {
        console.warn('[OrdersPage] Response did not contain CSRF token:', data);
      }
    } catch (err) {
      console.error('[OrdersPage] Error fetching CSRF token:', err);
    }
  };

  // Fetch pesanan dari API
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('[OrdersPage] Fetching orders with params:', {
        page: page + 1,
        limit: rowsPerPage,
        search: searchQuery || 'none',
        status: statusFilter || 'all'
      });
      
      const response = await getOrders({
        ...filters,
        page: page + 1,
        limit: rowsPerPage,
        search: searchQuery || undefined,
        status: statusFilter || undefined
      });
      
      console.log('[OrdersPage] Raw API response:', response);
      
      // Handle the deeply nested structure from the API
      if (response && response.data && response.data.data) {
        // The actual order items are in response.data.data.items
        if (response.data.data.items && Array.isArray(response.data.data.items)) {
          const ordersData = response.data.data.items.map((order: any) => ({
            ...order,
            // Ensure totalAmount is a number
            totalAmount: typeof order.totalAmount === 'string' ? parseFloat(order.totalAmount) : (order.totalAmount || 0),
            // Set customerName from customer object if available
            customerName: order.customerName || (order.customer ? order.customer.name : ''),
            // Ensure there's always a status property
            status: order.status || OrderStatus.NEW,
          }));
          
          setOrders(ordersData);
          setTotalOrders(response.data.data.total || 0);
          setDataReceived(true);
          dataProcessedRef.current = true;
          
          console.log('[OrdersPage] Data processed successfully from nested structure');
        } else {
          console.error('[OrdersPage] No items array found in the nested response:', response.data.data);
          setOrders([]);
          setTotalOrders(0);
          setError('Format respons tidak valid - tidak ada data pesanan');
        }
      } else if (response && response.items && Array.isArray(response.items)) {
        // Fallback to older format where response directly contains items
        const ordersData = response.items.map((order: any) => ({
          ...order,
          totalAmount: typeof order.totalAmount === 'string' ? parseFloat(order.totalAmount) : (order.totalAmount || 0),
          customerName: order.customerName || (order.customer ? order.customer.name : ''),
          status: order.status || OrderStatus.NEW,
        }));
        
        setOrders(ordersData);
        setTotalOrders(response.total || 0);
        setDataReceived(true);
        dataProcessedRef.current = true;
        
        console.log('[OrdersPage] Data processed from direct items structure');
      } else {
        console.error('[OrdersPage] Unexpected response format:', response);
        setOrders([]);
        setTotalOrders(0);
        setError('Format respons tidak valid');
      }
    } catch (err) {
      console.error('[OrdersPage] Error fetching orders:', err);
      setError('Terjadi kesalahan saat mengambil data pesanan');
      setOrders([]);
      setTotalOrders(0);
    } finally {
      setLoading(false);
    }
  };

  // Load orders when the component mounts
  useEffect(() => {
    async function init() {
      console.log('[OrdersPage] Component mounted, initializing...');
      // First, ensure we have a CSRF token
      await initializeCsrfToken();
      // Then fetch the orders
      fetchOrders();
    }
    
    init();
  }, []);

  // Load orders when filters change
  useEffect(() => {
    if (dataReceived) { // Only refetch if we've already gotten data once
      console.log('[OrdersPage] Filters changed, refetching data');
      fetchOrders();
    }
  }, [page, rowsPerPage, filters]);
  
  // Monitor state changes (without triggering re-renders)
  useEffect(() => {
    console.log('[OrdersPage] Current state:', {
      ordersCount: orders.length, 
      loading,
      error: error || 'none',
      page,
      rowsPerPage,
      dataReceived
    });
  }, [orders, loading, error, page, rowsPerPage, dataReceived]);

  // Handle page change
  const handleChangePage = (_event: unknown, newPage: number) => {
    console.log('[OrdersPage] Page changed to', newPage + 1);
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    console.log('[OrdersPage] Rows per page changed to', newRowsPerPage);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };
  
  // Apply search filter
  const handleSearch = () => {
    console.log('[OrdersPage] Search applied with query:', searchQuery);
    setPage(0);
    fetchOrders();
  };

  // Clear all filters
  const handleClearFilters = () => {
    console.log('[OrdersPage] Filters cleared');
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
    const newStatus = event.target.value as OrderStatus | '';
    console.log('[OrdersPage] Status filter changed to:', newStatus);
    setStatusFilter(newStatus);
  };
  
  // Go to order detail page
  const handleViewOrder = (orderId: string) => {
    console.log('[OrdersPage] Navigating to order detail:', orderId);
    router.push(`/orders/${orderId}`);
  };
  
  // Go to create order page
  const handleCreateOrder = () => {
    console.log('[OrdersPage] Navigating to create order page');
    router.push('/orders/new');
  };

  // Render a fallback data view if table is not showing data
  const renderFallbackData = () => {
    if (orders.length === 0) return null;
    
    return (
      <Box mt={3}>
        <Typography variant="h6" color="primary" gutterBottom>
          Data is available but not rendering in table:
        </Typography>
        {orders.slice(0, 3).map((order, index) => (
          <Paper key={order.id || index} sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1">
              Order #{order.orderNumber || index + 1}
            </Typography>
            <Typography>
              Customer: {order.customerName || order.customer?.name || 'Unknown'}
            </Typography>
            <Typography>
              Amount: Rp {order.totalAmount?.toLocaleString() || '0'}
            </Typography>
            <Typography>
              Status: {statusLabels[order.status] || order.status}
            </Typography>
            <Button 
              variant="outlined" 
              size="small" 
              sx={{ mt: 1 }}
              onClick={() => handleViewOrder(order.id)}
            >
              View Details
            </Button>
          </Paper>
        ))}
        {orders.length > 3 && (
          <Typography variant="body2" color="text.secondary">
            ...and {orders.length - 3} more orders
          </Typography>
        )}
      </Box>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <PageHeader 
        title="Daftar Pesanan" 
        action={
          <Link href="/orders/new" passHref>
            <Button variant="contained" color="primary">
              Buat Pesanan Baru
            </Button>
          </Link>
        }
      />
      
      <Box sx={{ mb: 3 }}>
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
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Debug info - remove in production */}
      <Paper sx={{ mb: 3, p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography variant="h6">Debug Info</Typography>
        <Typography variant="body2" color={orders.length > 0 ? 'success.main' : 'error.main'}>
          Orders Count: {orders.length}
        </Typography>
        <Typography variant="body2">Total Orders: {totalOrders}</Typography>
        <Typography variant="body2">Loading: {loading ? 'Yes' : 'No'}</Typography>
        <Typography variant="body2">Error: {error || 'None'}</Typography>
        <Typography variant="body2">Page: {page + 1}</Typography>
        <Typography variant="body2">Rows per page: {rowsPerPage}</Typography>
        
        {/* Fallback direct rendering */}
        {orders.length > 0 && (
          <Box>
            <Typography variant="subtitle2">Data Dump (Raw Orders):</Typography>
            <pre style={{ fontSize: '0.7rem', overflow: 'auto', maxHeight: '300px', backgroundColor: '#f5f5f5', padding: '8px' }}>
              {JSON.stringify(orders, null, 2)}
            </pre>
          </Box>
        )}
      </Paper>
      
      {/* Fallback data view */}
      {!loading && renderFallbackData()}
      
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
                    <TableCell>{order.customerName || order.customer?.name || 'Unknown'}</TableCell>
                    <TableCell>
                      {formatDate(order.createdAt)}
                    </TableCell>
                    <TableCell>Rp {(order.totalAmount || 0).toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip 
                        label={statusLabels[order.status] || order.status} 
                        color={statusColors[order.status] as any || 'default'}
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
    </div>
  );
} 