'use client';

import React, { useState, useEffect } from 'react';
import {
  Container, Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, TextField,
  TablePagination, CircularProgress, InputAdornment,
  IconButton, Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Clear as ClearIcon,
  Phone as PhoneIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { 
  getCustomers, Customer, CustomerFilters 
} from '@/api/customers';

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCustomers, setTotalCustomers] = useState(0);
  
  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<CustomerFilters>({
    page: 1,
    limit: 10,
  });

  // Fetch customers dari API
  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getCustomers({
        ...filters,
        page: page + 1,
        limit: rowsPerPage,
        search: searchQuery || undefined
      });
      
      setCustomers(response.items);
      setTotalCustomers(response.total);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Terjadi kesalahan saat mengambil data pelanggan');
    } finally {
      setLoading(false);
    }
  };

  // Load customers when filters change
  useEffect(() => {
    fetchCustomers();
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
    fetchCustomers();
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    setPage(0);
    setFilters({
      page: 1,
      limit: rowsPerPage,
    });
  };
  
  // Go to customer detail page
  const handleViewCustomer = (customerId: string) => {
    router.push(`/customers/${customerId}`);
  };
  
  // Go to create customer page
  const handleCreateCustomer = () => {
    router.push('/customers/new');
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">
          Daftar Pelanggan
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleCreateCustomer}
        >
          Tambah Pelanggan
        </Button>
      </Box>
      
      {/* Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <TextField
            label="Cari pelanggan"
            placeholder="Nama, email, telepon, atau alamat"
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
                    onClick={handleClearSearch}
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          
          <Button 
            variant="outlined"
            size="small"
            onClick={handleSearch}
          >
            Cari
          </Button>
        </Box>
      </Paper>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Customers Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nama</TableCell>
                <TableCell>Kontak</TableCell>
                <TableCell>Alamat</TableCell>
                <TableCell>Terdaftar</TableCell>
                <TableCell>Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={30} />
                  </TableCell>
                </TableRow>
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    Tidak ada pelanggan ditemukan
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow key={customer.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {customer.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" flexDirection="column" gap={0.5}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <PhoneIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {customer.phone}
                          </Typography>
                        </Box>
                        {customer.email && (
                          <Box display="flex" alignItems="center" gap={1}>
                            <EmailIcon fontSize="small" color="action" />
                            <Typography variant="body2">
                              {customer.email}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 200 }} noWrap>
                        {customer.address || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {format(new Date(customer.createdAt), 'dd MMM yyyy', { locale: id })}
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        variant="text"
                        size="small"
                        onClick={() => handleViewCustomer(customer.id)}
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
          count={totalCustomers}
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