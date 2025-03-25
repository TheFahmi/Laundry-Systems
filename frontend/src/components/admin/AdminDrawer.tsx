'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Toolbar, 
  Typography,
  Divider,
  useTheme
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  ShoppingCart as OrdersIcon,
  Inventory as InventoryIcon,
  Work as EmployeeIcon,
  BarChart as ReportsIcon,
  Settings as SettingsIcon,
  Payments as PaymentsIcon,
  LocalLaundryService as LaundryIcon
} from '@mui/icons-material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

const menuItems = [
  { text: 'Dasbor', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Pesanan', icon: <OrdersIcon />, path: '/orders' },
  { text: 'Pelanggan', icon: <PeopleIcon />, path: '/customers' },
  { text: 'Pembayaran', icon: <PaymentsIcon />, path: '/payments' },
  { text: 'Layanan', icon: <LaundryIcon />, path: '/services' },
  { text: 'Inventaris', icon: <InventoryIcon />, path: '/inventory' },
  { text: 'Karyawan', icon: <EmployeeIcon />, path: '/employees' },
  { text: 'Laporan', icon: <ReportsIcon />, path: '/reports' },
  { text: 'Pengaturan', icon: <SettingsIcon />, path: '/settings' },
];

interface AdminDrawerProps {
  drawerWidth: number;
}

export default function AdminDrawer({ drawerWidth }: AdminDrawerProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const theme = useTheme();

  useEffect(() => {
    const handleToggleDrawer = () => {
      setMobileOpen(!mobileOpen);
    };

    window.addEventListener('toggle-drawer', handleToggleDrawer);
    return () => {
      window.removeEventListener('toggle-drawer', handleToggleDrawer);
    };
  }, [mobileOpen]);

  const drawer = (
    <div>
      <Toolbar sx={{ justifyContent: 'center', py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Image src="/logo.png" alt="Logo" width={32} height={32} />
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
            Laundry Admin
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <Link href={item.path} key={item.text} style={{ textDecoration: 'none', color: 'inherit' }}>
            <ListItem disablePadding>
              <ListItemButton 
                selected={pathname === item.path}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.primary.main + '20',
                    '&:hover': {
                      backgroundColor: theme.palette.primary.main + '30',
                    },
                    '& .MuiListItemIcon-root': {
                      color: theme.palette.primary.main,
                    },
                    '& .MuiListItemText-primary': {
                      color: theme.palette.primary.main,
                      fontWeight: 'bold',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          </Link>
        ))}
      </List>
    </div>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            borderRight: '1px solid',
            borderColor: 'divider'
          },
        }}
      >
        {drawer}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            borderRight: '1px solid',
            borderColor: 'divider'
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
} 