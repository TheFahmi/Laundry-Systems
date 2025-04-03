'use client';

import React, { ReactNode, useState } from 'react';
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme as useMuiTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Person as PersonIcon,
  ShoppingBag as OrdersIcon,
  Map as TrackingIcon,
  CreditCard as PaymentIcon,
  ChatBubbleOutline as MessageIcon,
  NotificationsOutlined as NotificationIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from "next-themes";

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon fontSize="small" />, path: '/customer/dashboard' },
  { text: 'Pesanan Saya', icon: <OrdersIcon fontSize="small" />, path: '/customer/orders' },
  { text: 'Lacak Pesanan', icon: <TrackingIcon fontSize="small" />, path: '/customer/tracking' },
  { text: 'Pembayaran', icon: <PaymentIcon fontSize="small" />, path: '/customer/payments' },
  { text: 'Pesan', icon: <MessageIcon fontSize="small" />, path: '/customer/messages' },
  { text: 'Profil Saya', icon: <PersonIcon fontSize="small" />, path: '/customer/profile' },
];

// Drawer width definition (used in multiple places)
const drawerWidth = 260;

export default function CustomerLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { theme, setTheme } = useTheme();
  const muiTheme = useMuiTheme();
  const isSmallScreen = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const pathname = usePathname();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Mock authentication status and user details
  const isAuthenticated = true;
  const user = {
    name: "Budi Santoso",
    avatar: null, // URL to avatar if available
    notifications: 3
  };

  const drawer = (
    <Box>
      {/* Sidebar header with logo */}
      <Box 
        sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          height: 70, 
          backgroundColor: 'primary.main',
          color: 'primary.contrastText'
        }}
      >
        <Box component="img" src="/logo-white.png" alt="Logo" sx={{ height: 32, mr: 1 }} />
        <Typography variant="h6" noWrap fontWeight="bold">
          LAUNDRY APP
        </Typography>
      </Box>
      
      {/* User info section */}
      <Box sx={{ p: 2, backgroundColor: 'primary.dark', color: 'primary.contrastText' }}>
        <Box display="flex" alignItems="center" mb={1}>
          <Avatar sx={{ bgcolor: 'secondary.main', width: 40, height: 40, mr: 2 }}>
            {user.name.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight="medium">{user.name}</Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>Customer</Typography>
          </Box>
        </Box>
      </Box>

      <Divider />
      
      {/* Navigation menu */}
      <Box sx={{ py: 1 }}>
        <List>
          {menuItems.map((item) => (
            <Link href={item.path} key={item.text} style={{ textDecoration: 'none', color: 'inherit' }}>
              <ListItem disablePadding>
                <ListItemButton 
                  selected={pathname === item.path}
                  sx={{
                    py: 1.5,
                    borderLeft: pathname === item.path ? '4px solid' : '4px solid transparent',
                    borderColor: pathname === item.path ? 'primary.main' : 'transparent',
                    backgroundColor: pathname === item.path ? 'action.selected' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    }
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: pathname === item.path ? 'primary.main' : 'text.secondary',
                    minWidth: 40
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography 
                        variant="body2" 
                        fontWeight={pathname === item.path ? 600 : 400}
                        color={pathname === item.path ? 'primary.main' : 'inherit'}
                      >
                        {item.text}
                      </Typography>
                    } 
                  />
                </ListItemButton>
              </ListItem>
            </Link>
          ))}
        </List>
      </Box>
      
      <Divider />
      
      {/* Help & log out section */}
      <Box p={2}>
        <Button 
          variant="outlined" 
          color="primary" 
          fullWidth 
          component={Link} 
          href="/help"
          sx={{ mb: 1, borderRadius: 2 }}
        >
          Bantuan
        </Button>
        <Button 
          variant="text" 
          color="error" 
          fullWidth
          startIcon={<LogoutIcon />}
          sx={{ borderRadius: 2 }}
        >
          Keluar
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar 
        position="fixed" 
        elevation={1}
        sx={{ 
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'background.paper',
          color: 'text.primary'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {isSmallScreen && (
            <IconButton
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, color: 'text.secondary' }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography
            variant="h6"
            component="div"
            sx={{ 
              display: { xs: 'none', sm: 'block' },
              fontWeight: 600 
            }}
          >
            {menuItems.find(item => item.path === pathname)?.text || 'Dashboard'}
          </Typography>
          
          <Box display="flex" alignItems="center">
            <Tooltip title="Notifikasi">
              <IconButton sx={{ mx: 1 }}>
                <Badge badgeContent={user.notifications} color="error">
                  <NotificationIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Pengaturan">
              <IconButton sx={{ mx: 1 }}>
                <SettingsIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Profil">
              <IconButton
                size="small"
                edge="end"
                aria-label="account of current user"
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                sx={{ ml: 1 }}
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                  {user.name.charAt(0)}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              PaperProps={{
                elevation: 2,
                sx: { minWidth: 180, mt: 1 }
              }}
            >
              <MenuItem component={Link} href="/customer/profile" onClick={handleMenuClose}>
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Profil Saya</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>
                <ListItemIcon>
                  <SettingsIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Pengaturan</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleMenuClose}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText primaryTypographyProps={{ color: 'error' }}>Keluar</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRadius: { xs: '0 16px 16px 0', sm: 0 }
            },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop permanent drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: 'grey.50',
          mt: '64px', // Add margin top equal to AppBar height
        }}
      >
        <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
} 