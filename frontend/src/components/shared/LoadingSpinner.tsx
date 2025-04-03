'use client';

import React from 'react';
import { CircularProgress, Box } from '@mui/material';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large' | string;
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'inherit';
}

export default function LoadingSpinner({ 
  size = 'medium', 
  color = 'primary' 
}: LoadingSpinnerProps) {
  // Map size to number
  const sizeMap: Record<string, number> = {
    small: 24,
    medium: 40,
    large: 56,
  };

  const numericSize = typeof size === 'string' && size in sizeMap 
    ? sizeMap[size] 
    : 40;

  return (
    <Box display="flex" justifyContent="center" alignItems="center">
      <CircularProgress size={numericSize} color={color} />
    </Box>
  );
} 