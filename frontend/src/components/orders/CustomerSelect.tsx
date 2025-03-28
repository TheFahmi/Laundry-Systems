import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, CircularProgress, TextField, InputAdornment,
  Pagination, IconButton, Grid, Divider, Dialog, DialogTitle, DialogContent,
  DialogActions, Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CustomerForm from '@/components/customers/CustomerForm';
import { toast } from 'react-toastify';

interface CustomerSelectProps {
  onSelect: (id: string, name: string) => void;
  selectedCustomerId?: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

const customersPerPage = 10;

const CustomerSelect: React.FC<CustomerSelectProps> = ({ onSelect, selectedCustomerId }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [openNewCustomerDialog, setOpenNewCustomerDialog] = useState(false);
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        console.log('Fetching customers from:', `${apiUrl}/customers`);
        
        const response = await fetch(`${apiUrl}/customers`);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error('Failed to fetch customers');
        }
        
        const data = await response.json();
        console.log('Received data:', data);
        
        // Handle different response formats
        let customersArray: Customer[] = [];
        if (Array.isArray(data)) {
          customersArray = data;
        } else if (data.data && Array.isArray(data.data)) {
          customersArray = data.data;
        } else if (data.items && Array.isArray(data.items)) {
          customersArray = data.items;
        }
        
        console.log('Processed customers array:', customersArray);
        
        // Ensure we have valid customer objects
        customersArray = customersArray.filter(customer => 
          customer && 
          typeof customer.id === 'string' && 
          typeof customer.name === 'string' && 
          typeof customer.phone === 'string'
        );
        
        setCustomers(customersArray);
        setFilteredCustomers(customersArray);
      } catch (err) {
        console.error('Error fetching customers:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch customers');
        setCustomers([]);
        setFilteredCustomers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // Filter customers based on search query
  useEffect(() => {
    console.log('Filtering customers. Current customers:', customers);
    console.log('Search query:', searchQuery);

    if (!Array.isArray(customers)) {
      console.log('Customers is not an array, setting filtered to empty');
      setFilteredCustomers([]);
      return;
    }

    let filtered: Customer[] = [];
    
    if (searchQuery.trim() === '') {
      console.log('No search query, showing all customers');
      filtered = customers;
    } else {
      const lowerCaseQuery = searchQuery.toLowerCase();
      filtered = customers.filter(customer => 
        customer.name.toLowerCase().includes(lowerCaseQuery) || 
        customer.phone.toLowerCase().includes(lowerCaseQuery) ||
        (customer.email && customer.email.toLowerCase().includes(lowerCaseQuery))
      );
      console.log('Filtered customers:', filtered);
    }
    
    setFilteredCustomers(filtered);
    setPage(1);
  }, [searchQuery, customers]);

  // Update total pages when filtered customers change
  useEffect(() => {
    console.log('Updating total pages. Filtered customers:', filteredCustomers);
    if (Array.isArray(filteredCustomers)) {
      const total = Math.max(1, Math.ceil(filteredCustomers.length / customersPerPage));
      console.log('Calculated total pages:', total);
      setTotalPages(total);
    }
  }, [filteredCustomers]);
  
  // Calculate customers to display for the current page
  const displayedCustomers = Array.isArray(filteredCustomers) 
    ? filteredCustomers.slice(
        (page - 1) * customersPerPage,
        page * customersPerPage
      )
    : [];
  
  console.log('Current displayed customers:', displayedCustomers);
  console.log('Current page:', page);
  console.log('Total pages:', totalPages);
  
  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    console.log('Page changed to:', value);
    setPage(value);
  };
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };
  
  const handleAddNewCustomer = () => {
    setOpenNewCustomerDialog(true);
  };

  const handleCloseNewCustomerDialog = () => {
    setOpenNewCustomerDialog(false);
  };

  const handleNewCustomerSubmit = async (formData: any) => {
    try {
      setIsCreatingCustomer(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      console.log('Creating new customer:', formData);
      
      const response = await fetch(`${apiUrl}/customers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create customer');
      }

      const newCustomer = await response.json();
      console.log('Created new customer:', newCustomer);
      
      setCustomers(prev => [...prev, newCustomer]);
      setFilteredCustomers(prev => [...prev, newCustomer]);
      onSelect(newCustomer.id, newCustomer.name);
      setOpenNewCustomerDialog(false);
      toast.success('Customer created successfully');
    } catch (error: any) {
      console.error('Error creating customer:', error);
      toast.error(error.message || 'Failed to create customer');
    } finally {
      setIsCreatingCustomer(false);
    }
  };
  
  if (loading) return <CircularProgress />;
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>Pilih Pelanggan</Typography>
      
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <TextField
          placeholder="Cari pelanggan..."
          variant="outlined"
          size="small"
          fullWidth
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{ maxWidth: 500 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <IconButton 
          color="primary" 
          onClick={handleAddNewCustomer}
          title="Tambah Pelanggan Baru"
        >
          <PersonAddIcon />
        </IconButton>
      </Box>
      
      <Paper sx={{ mb: 2 }}>
        <Grid container>
          {displayedCustomers.length === 0 ? (
            <Grid item xs={12}>
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  {searchQuery ? 'Tidak ada pelanggan yang cocok dengan pencarian' : 'Tidak ada pelanggan'}
                </Typography>
              </Box>
            </Grid>
          ) : (
            displayedCustomers.map((customer) => (
              <Grid item xs={12} key={customer.id}>
                <Box
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    bgcolor: selectedCustomerId === customer.id ? 'action.selected' : 'transparent',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                  onClick={() => onSelect(customer.id, customer.name)}
                >
                  <Typography variant="subtitle1">{customer.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {customer.phone}
                    {customer.email && ` • ${customer.email}`}
                  </Typography>
                </Box>
                <Divider />
              </Grid>
            ))
          )}
        </Grid>
      </Paper>
      
      {displayedCustomers.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

      {/* New Customer Dialog */}
      <Dialog 
        open={openNewCustomerDialog} 
        onClose={handleCloseNewCustomerDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Tambah Pelanggan Baru</DialogTitle>
        <DialogContent>
          <CustomerForm
            onSubmit={handleNewCustomerSubmit}
            onCancel={handleCloseNewCustomerDialog}
            isLoading={isCreatingCustomer}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default CustomerSelect; 