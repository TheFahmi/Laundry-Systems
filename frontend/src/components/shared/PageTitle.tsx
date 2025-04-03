'use client';

import React from 'react';
import { Typography, Box } from '@mui/material';

interface PageTitleProps {
  title: string;
  subtitle?: string;
}

export default function PageTitle({ title, subtitle }: PageTitleProps) {
  return (
    <Box mb={4}>
      <Typography variant="h4" component="h1" gutterBottom>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body1" color="textSecondary">
          {subtitle}
        </Typography>
      )}
    </Box>
  );
} 