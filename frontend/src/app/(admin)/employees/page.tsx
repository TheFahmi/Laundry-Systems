'use client';

import React, { useState } from 'react';
import {
  Container,
  Grid,
  Box,
  TextField,
  InputAdornment,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon
} from '@mui/icons-material';
import PageHeader from '@/components/ui/PageHeader';
import EmployeeCard, { Employee } from '@/components/admin/EmployeeCard';

// Data karyawan dummy
const DUMMY_EMPLOYEES: Employee[] = [
  {
    id: 'EMP001',
    name: 'Ahmad Rizki',
    position: 'Operator Laundry',
    email: 'ahmad.rizki@example.com',
    phone: '081234567890',
    joinDate: '01 Jan 2022',
    status: 'active'
  },
  {
    id: 'EMP002',
    name: 'Siti Nurhayati',
    position: 'Kasir',
    email: 'siti.nur@example.com',
    phone: '089876543210',
    joinDate: '15 Mar 2022',
    status: 'active'
  },
  {
    id: 'EMP003',
    name: 'Budi Santoso',
    position: 'Driver Pengiriman',
    email: 'budi.santoso@example.com',
    phone: '087812345678',
    joinDate: '10 Apr 2022',
    status: 'on-leave'
  },
  {
    id: 'EMP004',
    name: 'Dewi Mulyani',
    position: 'Customer Service',
    email: 'dewi.mulyani@example.com',
    phone: '081122334455',
    joinDate: '05 Jul 2022',
    avatarUrl: 'https://i.pravatar.cc/150?img=5',
    status: 'active'
  },
  {
    id: 'EMP005',
    name: 'Eko Prasetyo',
    position: 'Manajer Operasional',
    email: 'eko.prasetyo@example.com',
    phone: '087766554433',
    joinDate: '01 Dec 2021',
    avatarUrl: 'https://i.pravatar.cc/150?img=8',
    status: 'active'
  },
  {
    id: 'EMP006',
    name: 'Rina Wulandari',
    position: 'Admin Keuangan',
    email: 'rina.wulandari@example.com',
    phone: '089988776655',
    joinDate: '15 Jan 2023',
    status: 'inactive'
  }
];

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>(DUMMY_EMPLOYEES);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Handler untuk pencarian karyawan
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Handler untuk filter status
  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
  };

  // Filter karyawan berdasarkan pencarian dan status
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.phone.includes(searchQuery);
      
    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Handler untuk edit karyawan
  const handleEditEmployee = (employee: Employee) => {
    console.log('Edit employee:', employee);
    // Implementasi pengeditan karyawan (membuka form, dll.)
  };

  // Handler untuk menghapus karyawan
  const handleDeleteEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setDeleteDialogOpen(true);
  };

  // Konfirmasi penghapusan karyawan
  const handleConfirmDelete = () => {
    if (selectedEmployee) {
      setEmployees(employees.filter(emp => emp.id !== selectedEmployee.id));
      setDeleteDialogOpen(false);
      setSelectedEmployee(null);
    }
  };

  // Menutup dialog penghapusan
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedEmployee(null);
  };

  return (
    <Container maxWidth="lg">
      <PageHeader 
        title="Manajemen Karyawan"
        actionButton={{
          label: 'Tambah Karyawan',
          icon: <AddIcon />,
          href: '/employees/new'
        }}
      />
      
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 3, 
        flexWrap: { xs: 'wrap', md: 'nowrap' } 
      }}>
        <TextField
          placeholder="Cari karyawan"
          variant="outlined"
          size="small"
          fullWidth
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
          sx={{ 
            mr: { xs: 0, md: 2 },
            mb: { xs: 2, md: 0 },
            flexGrow: 1 
          }}
        />
        
        <FormControl 
          size="small" 
          variant="outlined" 
          sx={{ 
            width: { xs: '100%', md: '200px' } 
          }}
        >
          <InputLabel id="status-filter-label">Status</InputLabel>
          <Select
            labelId="status-filter-label"
            id="status-filter"
            value={statusFilter}
            onChange={handleStatusFilterChange}
            label="Status"
          >
            <MenuItem value="all">Semua Status</MenuItem>
            <MenuItem value="active">Aktif</MenuItem>
            <MenuItem value="inactive">Tidak Aktif</MenuItem>
            <MenuItem value="on-leave">Cuti</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      <Grid container spacing={3}>
        {filteredEmployees.map(employee => (
          <Grid item xs={12} sm={6} md={4} key={employee.id}>
            <EmployeeCard 
              employee={employee}
              onEdit={handleEditEmployee}
              onDelete={handleDeleteEmployee}
            />
          </Grid>
        ))}
        
        {filteredEmployees.length === 0 && (
          <Grid item xs={12}>
            <Box sx={{ 
              textAlign: 'center', 
              py: 5, 
              color: 'text.secondary' 
            }}>
              Tidak ada karyawan yang ditemukan
            </Box>
          </Grid>
        )}
      </Grid>
      
      {/* Dialog Konfirmasi Hapus */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Konfirmasi Hapus Karyawan</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Apakah Anda yakin ingin menghapus karyawan {selectedEmployee?.name}? 
            Tindakan ini tidak dapat dibatalkan.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Batal
          </Button>
          <Button onClick={handleConfirmDelete} color="error">
            Hapus
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 