import React, { ReactNode } from 'react';
import { Box, CssBaseline } from '@mui/material';
import AdminDrawer from '@/components/admin/AdminDrawer';
import AdminAppBar from '@/components/admin/AdminAppBar';

const drawerWidth = 240;

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AdminAppBar drawerWidth={drawerWidth} />
      <AdminDrawer drawerWidth={drawerWidth} />
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Box sx={{ height: 64 }} /> {/* Spacer equivalent to Toolbar */}
        {children}
      </Box>
    </Box>
  );
} 