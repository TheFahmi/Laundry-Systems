'use client';

import React, { useState } from 'react';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  Button,
  Box,
  IconButton,
  Chip,
  Tabs,
  Tab,
  Alert,
  Typography
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import PageHeader from '@/components/ui/PageHeader';

// Interface untuk item inventori
interface InventoryItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  minStock: number;
  price: number;
  supplier: string;
  lastRestock: string;
}

// Data inventori dummy
const DUMMY_INVENTORY: InventoryItem[] = [
  {
    id: 'INV001',
    name: 'Deterjen Cair Premium',
    category: 'Bahan Cuci',
    stock: 35,
    unit: 'Liter',
    minStock: 20,
    price: 25000,
    supplier: 'PT Supplier Bersih',
    lastRestock: '10 Mar 2023'
  },
  {
    id: 'INV002',
    name: 'Pelembut Pakaian',
    category: 'Bahan Cuci',
    stock: 28,
    unit: 'Liter',
    minStock: 15,
    price: 30000,
    supplier: 'PT Supplier Bersih',
    lastRestock: '10 Mar 2023'
  },
  {
    id: 'INV003',
    name: 'Pemutih Pakaian',
    category: 'Bahan Cuci',
    stock: 12,
    unit: 'Liter',
    minStock: 10,
    price: 20000,
    supplier: 'PT Supplier Bersih',
    lastRestock: '05 Mar 2023'
  },
  {
    id: 'INV004',
    name: 'Penghilang Noda',
    category: 'Bahan Cuci',
    stock: 8,
    unit: 'Botol',
    minStock: 10,
    price: 35000,
    supplier: 'CV Bahan Kimia',
    lastRestock: '01 Mar 2023'
  },
  {
    id: 'INV005',
    name: 'Plastik Pembungkus',
    category: 'Kemasan',
    stock: 500,
    unit: 'Lembar',
    minStock: 300,
    price: 500,
    supplier: 'Toko Plastik Maju',
    lastRestock: '15 Mar 2023'
  },
  {
    id: 'INV006',
    name: 'Hanger Pakaian',
    category: 'Peralatan',
    stock: 200,
    unit: 'Buah',
    minStock: 100,
    price: 2500,
    supplier: 'Toko Plastik Maju',
    lastRestock: '15 Mar 2023'
  },
  {
    id: 'INV007',
    name: 'Keranjang Laundry',
    category: 'Peralatan',
    stock: 15,
    unit: 'Buah',
    minStock: 10,
    price: 50000,
    supplier: 'Toko Peralatan Rumah',
    lastRestock: '02 Mar 2023'
  }
];

// Kategori untuk tab filter
const CATEGORIES = ['Semua', 'Bahan Cuci', 'Kemasan', 'Peralatan'];

export default function InventoryPage() {
  const [inventory] = useState<InventoryItem[]>(DUMMY_INVENTORY);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Semua');

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const handleCategoryChange = (event: React.SyntheticEvent, newValue: string) => {
    setCategoryFilter(newValue);
    setPage(0);
  };

  // Filter inventori berdasarkan pencarian dan kategori
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = categoryFilter === 'Semua' || item.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Menghitung item dengan stok rendah
  const lowStockItems = inventory.filter(item => item.stock <= item.minStock);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
          Inventaris
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {}}
        >
          Tambah Item
        </Button>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nama Item</TableCell>
                <TableCell>Kategori</TableCell>
                <TableCell align="right">Stok</TableCell>
                <TableCell align="right">Harga</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Deterjen Premium</TableCell>
                <TableCell>Pembersih</TableCell>
                <TableCell align="right">50</TableCell>
                <TableCell align="right">Rp 150.000</TableCell>
                <TableCell>
                  <Chip label="Tersedia" color="success" size="small" />
                </TableCell>
                <TableCell align="center">
                  <IconButton size="small" onClick={() => {}}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => {}}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
} 