'use client';

import React, { useState } from 'react';
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
  InputAdornment
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
    isAvailable: true
  },
  {
    id: 'SRV002',
    name: 'Cuci Setrika Reguler',
    description: 'Layanan cuci dengan tambahan setrika untuk hasil pakaian yang lebih rapi.',
    price: 20000,
    category: 'Cuci Reguler',
    estimatedTime: '1-2 hari',
    isPopular: true,
    isAvailable: true
  },
  {
    id: 'SRV003',
    name: 'Cuci Express',
    description: 'Layanan cuci pakaian dengan waktu pengerjaan 6 jam. Ideal untuk kebutuhan mendadak.',
    price: 25000,
    category: 'Cuci Express',
    estimatedTime: '6 jam',
    isPopular: false,
    isAvailable: true
  },
  {
    id: 'SRV004',
    name: 'Cuci Setrika Express',
    description: 'Layanan cuci dan setrika dengan waktu pengerjaan 8 jam. Layanan premium untuk kebutuhan cepat.',
    price: 30000,
    category: 'Cuci Express',
    estimatedTime: '8 jam',
    isPopular: false,
    isAvailable: true
  },
  {
    id: 'SRV005',
    name: 'Cuci Karpet',
    description: 'Layanan khusus untuk karpet berbagai ukuran. Pengerjaan lebih lama dari pakaian biasa.',
    price: 50000,
    category: 'Layanan Khusus',
    estimatedTime: '3-5 hari',
    isPopular: false,
    isAvailable: true
  },
  {
    id: 'SRV006',
    name: 'Cuci Gorden',
    description: 'Layanan untuk mencuci dan merapikan gorden. Cocok untuk gorden berbagai ukuran.',
    price: 40000,
    category: 'Layanan Khusus',
    estimatedTime: '3-4 hari',
    isPopular: false,
    isAvailable: false
  },
  {
    id: 'SRV007',
    name: 'Dry Cleaning',
    description: 'Layanan dry cleaning premium untuk pakaian bermateri khusus yang tidak bisa dicuci biasa.',
    price: 60000,
    category: 'Dry Cleaning',
    estimatedTime: '2-3 hari',
    isPopular: true,
    isAvailable: true
  },
  {
    id: 'SRV008',
    name: 'Setrika Saja',
    description: 'Layanan setrika untuk pakaian yang sudah bersih namun perlu dirapikan.',
    price: 10000,
    category: 'Layanan Tambahan',
    estimatedTime: '1 hari',
    isPopular: false,
    isAvailable: true
  }
];

// Kategori untuk filter tab
const CATEGORIES = ['Semua', 'Cuci Reguler', 'Cuci Express', 'Dry Cleaning', 'Layanan Khusus', 'Layanan Tambahan'];

export default function ServicesPage() {
  const [services] = useState<Service[]>(DUMMY_SERVICES);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState('');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleEditService = (id: string) => {
    console.log(`Edit service with ID: ${id}`);
  };

  const handleDeleteClick = (id: string) => {
    setSelectedServiceId(id);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedServiceId('');
  };

  const handleConfirmDelete = () => {
    console.log(`Delete service with ID: ${selectedServiceId}`);
    handleCloseDeleteDialog();
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
          onClick={() => {}}
        >
          Tambah Layanan
        </Button>
      </Box>

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