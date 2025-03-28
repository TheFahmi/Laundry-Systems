'use client';

import { 
  ShoppingCart as ShoppingCartIcon,
  People as UsersIcon,
  CreditCard as CreditCardIcon,
  LocalLaundryService as ServicesIcon,
  ManageAccounts as UserManagementIcon
} from '@mui/icons-material';
import Link from 'next/link';
import RecentActivity from '@/components/dashboard/RecentActivity';
import { Box, Grid, Paper, Typography } from '@mui/material';

export default function DashboardPage() {
  const menuItems = [
    {
      title: 'Orders',
      icon: <ShoppingCartIcon sx={{ width: 24, height: 24 }} />,
      href: '/orders',
      color: 'primary.main'
    },
    {
      title: 'Customers',
      icon: <UsersIcon sx={{ width: 24, height: 24 }} />,
      href: '/customers',
      color: 'success.main'
    },
    {
      title: 'Payments',
      icon: <CreditCardIcon sx={{ width: 24, height: 24 }} />,
      href: '/payments',
      color: 'warning.main'
    },
    {
      title: 'Services',
      icon: <ServicesIcon sx={{ width: 24, height: 24 }} />,
      href: '/services',
      color: 'secondary.main'
    },
    {
      title: 'Users',
      icon: <UserManagementIcon sx={{ width: 24, height: 24 }} />,
      href: '/users',
      color: 'info.main'
    }
  ];
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary' }}>Dashboard</Typography>
        <Typography variant="body1" color="text.secondary">Welcome back, Admin</Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {menuItems.map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.title}>
            <Link href={item.href} passHref>
              <Paper 
                elevation={1} 
                sx={{ 
                  p: 3, 
                  display: 'block', 
                  transition: 'box-shadow 0.2s',
                  '&:hover': {
                    boxShadow: 3,
                  },
                  cursor: 'pointer'
                }}
              >
                <Box 
                  sx={{ 
                    width: 48, 
                    height: 48, 
                    bgcolor: item.color, 
                    borderRadius: '50%',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    mb: 2,
                    color: 'white'
                  }}
                >
                  {item.icon}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 'medium', color: 'text.primary' }}>{item.title}</Typography>
              </Paper>
            </Link>
          </Grid>
        ))}
      </Grid>

      {/* Recent Activity Section */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <RecentActivity />
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={1} sx={{ height: '100%', p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Upcoming Tasks</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              Coming soon...
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
} 