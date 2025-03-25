'use client';

import React, { useState, useEffect } from 'react';
import {
  Container, Box, Typography, Paper, Grid, TextField, Button,
  Card, CardContent, CardActions, Divider, CircularProgress,
  InputAdornment, IconButton, Chip, Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Clear as ClearIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { 
  getServices, deleteService, LaundryService, ServiceFilters
} from '@/api/services';

export default function ServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState<LaundryService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredServices, setFilteredServices] = useState<LaundryService[]>([]);

  // Fetch services
  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const filters: ServiceFilters = {
        search: searchQuery || undefined
      };
      
      const response = await getServices(filters);
      setServices(response.items);
      setFilteredServices(response.items);
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('Terjadi kesalahan saat mengambil data layanan');
    } finally {
      setLoading(false);
    }
  };

  // Load services when component mounts
  useEffect(() => {
    fetchServices();
  }, []);
  
  // Filter services based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredServices(services);
      return;
    }
    
    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = services.filter(service => 
      service.name.toLowerCase().includes(lowercasedQuery) ||
      service.description?.toLowerCase().includes(lowercasedQuery) ||
      service.category?.toLowerCase().includes(lowercasedQuery)
    );
    
    setFilteredServices(filtered);
  }, [searchQuery, services]);
  
  // Handle search clear
  const handleClearSearch = () => {
    setSearchQuery('');
  };
  
  // Navigate to create service page
  const handleCreateService = () => {
    router.push('/services/create');
  };
  
  // Navigate to edit service page
  const handleEditService = (serviceId: string) => {
    router.push(`/services/${serviceId}/edit`);
  };
  
  // Delete service
  const handleDeleteService = async (serviceId: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus layanan ini?')) {
      return;
    }
    
    try {
      await deleteService(serviceId);
      toast.success('Layanan berhasil dihapus');
      fetchServices(); // Refresh list
    } catch (err) {
      console.error('Error deleting service:', err);
      toast.error('Gagal menghapus layanan');
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">
          Daftar Layanan
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleCreateService}
        >
          Tambah Layanan
        </Button>
      </Box>
      
      {/* Search */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <TextField
          fullWidth
          label="Cari layanan"
          placeholder="Nama, deskripsi, atau kategori"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
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
      </Paper>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Services Grid */}
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : filteredServices.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography>Tidak ada layanan ditemukan</Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredServices.map((service) => (
            <Grid item xs={12} sm={6} md={4} key={service.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Typography variant="h6" gutterBottom>
                      {service.name}
                    </Typography>
                    {service.category && (
                      <Chip 
                        label={service.category} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    )}
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {service.description || 'Tidak ada deskripsi'}
                  </Typography>
                  
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h5" color="primary">
                      Rp {service.price.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      /item
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Estimasi waktu: {service.estimatedTime} jam
                  </Typography>
                </CardContent>
                
                <CardActions>
                  <Button 
                    size="small" 
                    startIcon={<EditIcon />}
                    onClick={() => handleEditService(service.id)}
                  >
                    Edit
                  </Button>
                  <Button 
                    size="small" 
                    color="error" 
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteService(service.id)}
                  >
                    Hapus
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
} 