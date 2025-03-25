'use client';

import React, { ReactNode, useState } from 'react';
import {
  AppBar,
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
  Typography,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Person as PersonIcon,
  LocalLaundryService as OrdersIcon,
  LocationOn as TrackingIcon,
  Payment as PaymentIcon,
  Chat as MessageIcon,
  AccountCircle,
  Login as LoginIcon
} from '@mui/icons-material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/providers/ThemeProvider';

const menuItems = [
  { text: 'Profil', icon: <PersonIcon />, path: '/profile' },
  { text: 'Pesanan', icon: <OrdersIcon />, path: '/orders' },
  { text: 'Pelacakan', icon: <TrackingIcon />, path: '/tracking' },
  { text: 'Pembayaran', icon: <PaymentIcon />, path: '/payments' },
  { text: 'Pesan', icon: <MessageIcon />, path: '/messages' },
];

export default function CustomerLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { mode } = useTheme();
  const theme = mode === 'dark' ? { breakpoints: { down: (size: string) => `(max-width:${size === 'sm' ? '600px' : '900px'})` } } : { breakpoints: { down: (size: string) => `(max-width:${size === 'sm' ? '600px' : '900px'})` } };
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
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

  // Mock authentication status
  const isAuthenticated = true;

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Laundry App
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <Link href={item.path} key={item.text} style={{ textDecoration: 'none', color: 'inherit' }}>
            <ListItem disablePadding>
              <ListItemButton selected={pathname === item.path}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          </Link>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" color="primary">
        <Toolbar>
          {isSmallScreen && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1 }}
          >
            Laundry App
          </Typography>
          {isAuthenticated ? (
            <>
              <IconButton
                size="large"
                edge="end"
                aria-label="account of current user"
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleMenuClose}>Profil</MenuItem>
                <MenuItem onClick={handleMenuClose}>Keluar</MenuItem>
              </Menu>
            </>
          ) : (
            <Button color="inherit" startIcon={<LoginIcon />}>
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: 240 }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - 240px)` },
          minHeight: '100vh',
          bgcolor: '#f5f5f5'
        }}
      >
        <Toolbar />
        <Container maxWidth="lg">
          {children}
        </Container>
      </Box>
    </Box>
  );
} 