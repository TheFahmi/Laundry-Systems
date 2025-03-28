'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Grid
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import PageHeader from '@/components/ui/PageHeader';
import ServiceCard, { Service } from '@/components/admin/ServiceCard';

// Data dummy layanan
const DUMMY_SERVICES: Service[] = [
  {
    id: 'SRV001',
    name: 'Cuci Kering Reguler',
    description: 'Layanan cuci pakaian reguler dengan pengeringan standar. Cocok untuk pakaian sehari-hari.',
    price: 15000,
    category: 'Cuci Reguler',
    estimatedTime: '1-2 hari',
    isPopular: true,
    isAvailable: true,
    priceUnit: 'kg'
  },
  {
    id: 'SRV002',
    name: 'Cuci Setrika Reguler',
    description: 'Layanan cuci dengan tambahan setrika untuk hasil pakaian yang lebih rapi.',
    price: 20000,
    category: 'Cuci Reguler',
    estimatedTime: '1-2 hari',
    isPopular: true,
    isAvailable: true,
    priceUnit: 'kg'
  },
  {
    id: 'SRV003',
    name: 'Cuci Express',
    description: 'Layanan cuci pakaian dengan waktu pengerjaan 6 jam. Ideal untuk kebutuhan mendadak.',
    price: 25000,
    category: 'Cuci Express',
    estimatedTime: '6 jam',
    isPopular: false,
    isAvailable: true,
    priceUnit: 'kg'
  },
  {
    id: 'SRV004',
    name: 'Cuci Setrika Express',
    description: 'Layanan cuci dan setrika dengan waktu pengerjaan 8 jam. Layanan premium untuk kebutuhan cepat.',
    price: 30000,
    category: 'Cuci Express',
    estimatedTime: '8 jam',
    isPopular: false,
    isAvailable: true,
    priceUnit: 'kg'
  },
  {
    id: 'SRV005',
    name: 'Cuci Karpet',
    description: 'Layanan khusus untuk karpet berbagai ukuran. Pengerjaan lebih lama dari pakaian biasa.',
    price: 50000,
    category: 'Layanan Khusus',
    estimatedTime: '3-5 hari',
    isPopular: false,
    isAvailable: true,
    priceUnit: 'item'
  },
  {
    id: 'SRV006',
    name: 'Cuci Gorden',
    description: 'Layanan untuk mencuci dan merapikan gorden. Cocok untuk gorden berbagai ukuran.',
    price: 40000,
    category: 'Layanan Khusus',
    estimatedTime: '3-4 hari',
    isPopular: false,
    isAvailable: false,
    priceUnit: 'item'
  },
  {
    id: 'SRV007',
    name: 'Dry Cleaning',
    description: 'Layanan dry cleaning premium untuk pakaian bermateri khusus yang tidak bisa dicuci biasa.',
    price: 60000,
    category: 'Dry Cleaning',
    estimatedTime: '2-3 hari',
    isPopular: true,
    isAvailable: true,
    priceUnit: 'item'
  },
  {
    id: 'SRV008',
    name: 'Setrika Saja',
    description: 'Layanan setrika untuk pakaian yang sudah bersih namun perlu dirapikan.',
    price: 10000,
    category: 'Layanan Tambahan',
    estimatedTime: '1 hari',
    isPopular: false,
    isAvailable: true,
    priceUnit: 'kg'
  }
];

// Kategori untuk filter tab
const CATEGORIES = ['Semua', 'Cuci Reguler', 'Cuci Express', 'Dry Cleaning', 'Layanan Khusus', 'Layanan Tambahan'];

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Service>({
    id: '',
    name: '',
    description: '',
    price: 0,
    category: 'Cuci Reguler',
    estimatedTime: '',
    isPopular: false,
    isAvailable: true
  });

  // Fetch services from backend
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/services`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch services');
        }
        
        const data = await response.json();
        console.log('Services data from API:', data);
        
        // Handle different response formats
        let servicesList = [];
        if (data.data && Array.isArray(data.data)) {
          servicesList = data.data;
        } else if (data.items && Array.isArray(data.items)) {
          servicesList = data.items;
        } else if (Array.isArray(data)) {
          servicesList = data;
        } else {
          console.error('Unexpected data format:', data);
          servicesList = DUMMY_SERVICES; // Fallback to dummy data if unexpected format
        }
        
        // Map API data to our Service interface
        const mappedServices = servicesList.map((service: any) => {
          const priceUnit = service.priceModel === 'per_kg' ? 'kg' : 'item';
          const estimatedTime = typeof service.processingTimeHours === 'number' 
            ? `${service.processingTimeHours} jam` 
            : '1-2 hari';
          
          return {
            id: service.id.toString(),
            name: service.name,
            description: service.description || '',
            price: service.price || 0,
            category: service.category || 'Uncategorized',
            estimatedTime: estimatedTime,
            isPopular: !!service.isPopular,
            isAvailable: service.isActive !== undefined ? !!service.isActive : true,
            priceUnit: priceUnit as 'kg' | 'item'
          };
        });
        
        setServices(mappedServices);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError('Failed to load services');
        setServices(DUMMY_SERVICES);
      } finally {
        setLoading(false);
      }
    };
    
    fetchServices();
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleAddService = () => {
    setIsEditing(false);
    setFormData({
      id: `SRV${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      name: '',
      description: '',
      price: 0,
      category: 'Cuci Reguler',
      estimatedTime: '',
      isPopular: false,
      isAvailable: true
    });
    setFormDialogOpen(true);
  };

  const handleEditService = (id: string) => {
    const serviceToEdit = services.find(service => service.id === id);
    if (serviceToEdit) {
      setIsEditing(true);
      setFormData(serviceToEdit);
      setFormDialogOpen(true);
    }
  };

  const handleDeleteClick = (id: string) => {
    setSelectedServiceId(id);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedServiceId('');
  };

  const handleConfirmDelete = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/services/${selectedServiceId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete service');
      }
      
      // Remove from local state
      setServices(services.filter(service => service.id !== selectedServiceId));
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Failed to delete service. Please try again.');
      
      // Fallback: still update the UI even if API fails
      setServices(services.filter(service => service.id !== selectedServiceId));
    }
    
    handleCloseDeleteDialog();
  };

  const handleCloseFormDialog = () => {
    setFormDialogOpen(false);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleCategoryChange = (e: any) => {
    setFormData(prev => ({ ...prev, category: e.target.value }));
  };

  const handleSaveService = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const endpoint = isEditing ? `${apiUrl}/services/${formData.id}` : `${apiUrl}/services`;
      const method = isEditing ? 'PUT' : 'POST';
      
      // Konversi estimatedTime dari string ke number jika memungkinkan
      let processingHours = 24; // default
      if (formData.estimatedTime) {
        // Coba ekstrak angka dari string seperti "1-2 hari" atau "24 jam"
        const match = formData.estimatedTime.match(/(\d+)/);
        if (match && match[1]) {
          processingHours = parseInt(match[1], 10);
        }
      }
      
      // Buat service data yang berbeda untuk create vs update
      let serviceData;
      
      if (isEditing) {
        // Untuk update (PUT), kirim name, description, price, dan isActive
        // Juga kirim priceModel agar data satuan harga terupdate
        serviceData = {
          name: formData.name,
          description: formData.description,
          price: formData.price,
          isActive: formData.isAvailable
        };
        
        // Untuk layanan baru, kita perlu mengirim semua data termasuk priceModel
        if (formData.priceUnit) {
          // Hanya tambahkan parameter ini jika service ID adalah angka
          // Ini aman untuk layanan baru, tapi backend mungkin menolak untuk ID yang sudah ada
          try {
            if (!isNaN(parseInt(formData.id, 10))) {
              // Jika ID adalah angka, kita juga mencoba kirim priceModel
              serviceData.priceModel = formData.priceUnit === 'kg' ? 'per_kg' : 'per_piece';
            }
          } catch (e) {
            // Ignore parsing errors
          }
        }
      } else {
        // Untuk create (POST), kirim semua properti yang dibutuhkan
        serviceData = {
          name: formData.name,
          description: formData.description,
          price: formData.price,
          priceModel: formData.priceUnit === 'kg' ? 'per_kg' : 'per_piece',
          processingTimeHours: processingHours,
          isActive: formData.isAvailable
        };
      }
      
      console.log(`Sending ${isEditing ? 'update' : 'create'} service data:`, serviceData);
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(Array.isArray(errorData.message) 
          ? errorData.message.join(', ') 
          : errorData.message || 'Failed to save service');
      }
      
      const savedService = await response.json();
      console.log('Saved service response:', savedService);
      
      // Pastikan respons yang diterima lengkap, jika tidak tambahkan dari formData
      const completeService = {
        ...savedService,
        priceModel: savedService.priceModel || (formData.priceUnit === 'kg' ? 'per_kg' : 'per_piece')
      };
      
      // Kelola state lokal berdasarkan respons
      if (isEditing) {
        setServices(services.map(service => 
          service.id === formData.id ? {
            ...service,
            name: completeService.name,
            description: completeService.description || '',
            price: completeService.price,
            isAvailable: completeService.isActive !== undefined ? completeService.isActive : service.isAvailable,
            // Baca priceModel dari respons atau dari nilai sebelumnya
            priceUnit: (completeService.priceModel === 'per_kg' ? 'kg' : 'item'),
            // Tetap pertahankan data frontend lain yang tidak ada di API
            category: formData.category,
            estimatedTime: formData.estimatedTime,
            isPopular: formData.isPopular
          } : service
        ));
      } else {
        // Add new service to the state
        const newService: Service = {
          id: completeService.id.toString(),
          name: completeService.name,
          description: completeService.description || '',
          price: completeService.price,
          // Tetap gunakan nilai dari form untuk frontend
          category: formData.category,
          estimatedTime: formData.estimatedTime || `${processingHours} jam`,
          isPopular: formData.isPopular,
          isAvailable: completeService.isActive !== undefined ? completeService.isActive : true,
          // Gunakan priceModel dari respons untuk menentukan priceUnit
          priceUnit: (completeService.priceModel === 'per_kg' ? 'kg' : 'item')
        };
        
        setServices([...services, newService]);
      }
      
      setFormDialogOpen(false);
    } catch (error) {
      console.error('Error saving service:', error);
      alert('Failed to save service: ' + (error instanceof Error ? error.message : 'Unknown error'));
      
      // Fallback: masih update UI bahkan jika API gagal
      if (isEditing) {
        setServices(services.map(service => 
          service.id === formData.id ? formData : service
        ));
      } else {
        setServices([...services, {...formData, id: `SRV${Math.random().toString(36).substring(2, 7)}`}]);
      }
      setFormDialogOpen(false);
    }
  };

  const filteredServices = services.filter(service => 
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box className="p-6 space-y-6">
      {/* Header Section */}
      <Box className="flex flex-wrap justify-between items-center gap-4">
        <Box>
          <Typography variant="h5" className="text-2xl font-bold text-gray-800 dark:text-white">
            Layanan
          </Typography>
          <Typography variant="body2" className="mt-1 text-gray-600 dark:text-gray-400">
            Kelola semua layanan laundry Anda di sini
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg"
          onClick={handleAddService}
        >
          Tambah Layanan
        </Button>
      </Box>

      {/* Show loading state */}
      {loading ? (
        <Box className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </Box>
      ) : error ? (
        <Paper className="p-4 bg-red-50 text-red-500">
          <Typography>{error}</Typography>
          <Button 
            variant="outlined" 
            color="primary"
            onClick={() => setServices(DUMMY_SERVICES)}
            className="mt-2"
          >
            Load Demo Data
          </Button>
        </Paper>
      ) : (
        <>
          {/* Search and Filter Section */}
          <Paper className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <Box className="flex flex-wrap gap-4 items-center">
              <TextField
                placeholder="Cari layanan..."
                variant="outlined"
                size="small"
                value={searchQuery}
                onChange={handleSearchChange}
                className="flex-1"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon className="text-gray-400" />
                    </InputAdornment>
                  )
                }}
              />
              <Button
                startIcon={<FilterListIcon />}
                variant="outlined"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Filter
              </Button>
            </Box>
          </Paper>

          {/* Table Section */}
          <Paper className="overflow-hidden bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow className="bg-gray-50 dark:bg-gray-700">
                    <TableCell className="font-semibold">Nama Layanan</TableCell>
                    <TableCell className="font-semibold">Deskripsi</TableCell>
                    <TableCell className="font-semibold" align="right">Harga</TableCell>
                    <TableCell className="font-semibold">Durasi</TableCell>
                    <TableCell className="font-semibold">Status</TableCell>
                    <TableCell className="font-semibold" align="center">Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredServices.map(service => (
                    <TableRow 
                      key={service.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <TableCell className="font-medium">{service.name}</TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-400">{service.description}</TableCell>
                      <TableCell align="right" className="font-medium">
                        Rp {service.price.toLocaleString('id-ID')}
                        {service.priceUnit && (
                          <span className="text-xs text-gray-500"> / {service.priceUnit}</span>
                        )}
                      </TableCell>
                      <TableCell>{service.estimatedTime}</TableCell>
                      <TableCell>
                        <Chip
                          label={service.isAvailable ? "Aktif" : "Tidak Aktif"}
                          color={service.isAvailable ? "success" : "error"}
                          size="small"
                          className={service.isAvailable ? 
                            "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                            "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box className="flex justify-center gap-2">
                          <IconButton 
                            size="small" 
                            onClick={() => handleEditService(service.id)}
                            className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => handleDeleteClick(service.id)}
                            className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}

      {/* Add/Edit Service Form Dialog */}
      <Dialog 
        open={formDialogOpen} 
        onClose={handleCloseFormDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {isEditing ? 'Edit Layanan' : 'Tambah Layanan Baru'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="name"
                  label="Nama Layanan"
                  value={formData.name}
                  onChange={handleFormChange}
                  fullWidth
                  required
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="price"
                  label="Harga (Rp)"
                  type="number"
                  value={formData.price}
                  onChange={handleFormChange}
                  fullWidth
                  required
                  margin="normal"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Kategori</InputLabel>
                  <Select
                    value={formData.category}
                    onChange={handleCategoryChange}
                    label="Kategori"
                  >
                    {CATEGORIES.filter(category => category !== 'Semua').map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="estimatedTime"
                  label="Estimasi Waktu (mis. 1-2 hari)"
                  value={formData.estimatedTime}
                  onChange={handleFormChange}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="description"
                  label="Deskripsi"
                  value={formData.description}
                  onChange={handleFormChange}
                  fullWidth
                  multiline
                  rows={3}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      name="isAvailable"
                      checked={formData.isAvailable}
                      onChange={handleSwitchChange}
                      color="primary"
                    />
                  }
                  label="Aktif"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      name="isPopular"
                      checked={formData.isPopular}
                      onChange={handleSwitchChange}
                      color="primary"
                    />
                  }
                  label="Layanan Populer"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Satuan Harga</InputLabel>
                  <Select
                    name="priceUnit"
                    value={formData.priceUnit || 'item'}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      priceUnit: e.target.value as 'kg' | 'item' 
                    }))}
                    label="Satuan Harga"
                  >
                    <MenuItem value="item">Per Item</MenuItem>
                    <MenuItem value="kg">Per Kilogram</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFormDialog}>Batal</Button>
          <Button 
            onClick={handleSaveService} 
            variant="contained" 
            color="primary"
            disabled={!formData.name || formData.price <= 0}
          >
            Simpan
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        className="rounded-lg"
      >
        <DialogTitle className="bg-gray-50 dark:bg-gray-800">
          Konfirmasi Penghapusan
        </DialogTitle>
        <DialogContent className="mt-4">
          <DialogContentText className="text-gray-600 dark:text-gray-400">
            Apakah Anda yakin ingin menghapus layanan ini? Tindakan ini tidak dapat dibatalkan.
          </DialogContentText>
        </DialogContent>
        <DialogActions className="p-4 bg-gray-50 dark:bg-gray-800">
          <Button 
            onClick={handleCloseDeleteDialog}
            className="text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            Batal
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error" 
            variant="contained"
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Hapus
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 