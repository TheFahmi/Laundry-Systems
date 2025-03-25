'use client';

import React, { useState } from 'react';
import { Box, CssBaseline, Drawer, AppBar, Toolbar, List, Typography, 
  Divider, IconButton, ListItem, ListItemButton, ListItemIcon, 
  ListItemText, useMediaQuery, useTheme as useMuiTheme, Tooltip, Avatar, 
  Menu, MenuItem, CircularProgress } from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  Receipt as ReceiptIcon,
  Inventory as InventoryIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  NightsStay as NightsStayIcon,
  LightMode as LightModeIcon,
  Notifications as NotificationsIcon,
  Paid as PaidIcon
} from '@mui/icons-material';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { APP_NAME } from '@/config';

const drawerWidth = 240;

const menuItems = [
  { title: 'Dashboard', path: '/admin/dashboard', icon: <DashboardIcon /> },
  { title: 'Pesanan', path: '/orders', icon: <ReceiptIcon /> },
  { title: 'Layanan', path: '/services', icon: <InventoryIcon /> },
  { title: 'Pelanggan', path: '/customers', icon: <PeopleIcon /> },
  { title: 'Pembayaran', path: '/payments', icon: <PaidIcon /> },
  { title: 'Pengaturan', path: '/settings', icon: <SettingsIcon /> },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { mode, toggleTheme } = useTheme();
  const muiTheme = useMuiTheme();
  const router = useRouter();
  const pathname = usePathname();
  
  const isSmallScreen = useMediaQuery(muiTheme.breakpoints.down('md'));
  
  // Tutup drawer secara otomatis pada layar kecil
  React.useEffect(() => {
    setOpen(!isSmallScreen);
  }, [isSmallScreen]);
  
  const handleDrawerToggle = () => {
    setOpen(!open);
  };
  
  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = () => {
    logout();
    handleUserMenuClose();
  };
  
  // Jika masih loading atau belum terautentikasi, tampilkan loading spinner
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }
  
  // Jika setelah loading, user tidak terautentikasi, arahkan ke halaman login
  if (!isLoading && !isAuthenticated) {
    router.push('/login');
    return null;
  }
  
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme => theme.zIndex.drawer + 1,
          transition: theme =>
            theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          ...(open && {
            width: `calc(100% - ${drawerWidth}px)`,
            marginLeft: `${drawerWidth}px`,
            transition: theme =>
              theme.transitions.create(['width', 'margin'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            {open ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {APP_NAME}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title={mode === 'light' ? 'Dark Mode' : 'Light Mode'}>
              <IconButton color="inherit" onClick={toggleTheme}>
                {mode === 'light' ? <NightsStayIcon /> : <LightModeIcon />}
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Notifikasi">
              <IconButton color="inherit">
                <NotificationsIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title={user?.name || 'Profil'}>
              <IconButton
                onClick={handleUserMenuOpen}
                sx={{ ml: 1 }}
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                  {user?.name?.charAt(0) || 'U'}
                </Avatar>
              </IconButton>
            </Tooltip>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleUserMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem>
                <Typography variant="body2">
                  {user?.name || 'User'}
                </Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => {
                handleUserMenuClose();
                router.push('/profile');
              }}>
                Profil
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Drawer */}
      <Drawer
        variant={isSmallScreen ? 'temporary' : 'persistent'}
        open={open}
        onClose={isSmallScreen ? handleDrawerToggle : undefined}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', mt: 2 }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.title} disablePadding>
                <ListItemButton
                  component={Link}
                  href={item.path}
                  selected={pathname === item.path}
                  sx={{
                    borderLeft: pathname === item.path 
                      ? '4px solid'
                      : '4px solid transparent',
                    borderColor: 'primary.main',
                    '&.Mui-selected': {
                      bgcolor: 'action.selected',
                    },
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: pathname === item.path ? 'primary.main' : 'inherit' 
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.title} 
                    primaryTypographyProps={{
                      fontWeight: pathname === item.path ? 'bold' : 'regular'
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      
      {/* Main content */}
      <Box component="main" sx={{ 
        flexGrow: 1, 
        p: 3,
        width: `calc(100% - ${open ? drawerWidth : 0}px)`,
        minHeight: '100vh',
        backgroundColor: 'background.default'
      }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
} 