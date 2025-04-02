'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import AnalyticsEngine from '../../../../components/admin/AnalyticsEngine';

export default function AnalyticsPage() {
  return (
    <Box>
      <Typography variant="h5" component="h1" gutterBottom>
        Analisis Data Bisnis
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Dashboard analitik untuk memantau performa bisnis Anda secara real-time dan tren historis
      </Typography>
      
      <AnalyticsEngine />
    </Box>
  );
} 