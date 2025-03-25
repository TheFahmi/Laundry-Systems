import React from 'react';
import { Typography, Box, Button, Link } from '@mui/material';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

interface ActionButton {
  label: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actionButton?: ActionButton;
  backLink?: {
    label: string;
    href: string;
  };
  backButton?: boolean;
}

export default function PageHeader({ 
  title, 
  subtitle, 
  actionButton, 
  backLink,
  backButton 
}: PageHeaderProps) {
  const router = useRouter();
  
  return (
    <Box 
      sx={{ 
        mb: 4, 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' }, 
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' }
      }}
    >
      <Box>
        {backLink && (
          <Link 
            component={NextLink} 
            href={backLink.href} 
            sx={{ display: 'block', mb: 1 }}
            color="primary"
            underline="hover"
          >
            ← {backLink.label}
          </Link>
        )}
        
        {backButton && (
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => router.back()}
            sx={{ mb: 2, pl: 0 }}
            color="primary"
          >
            Kembali
          </Button>
        )}
        
        <Typography variant="h4" component="h1" gutterBottom={Boolean(subtitle)}>
          {title}
        </Typography>
        
        {subtitle && (
          <Typography variant="subtitle1" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>

      {actionButton && (
        <Box sx={{ mt: { xs: 2, sm: 0 } }}>
          {actionButton.href ? (
            <Button
              variant="contained"
              color="primary"
              component={NextLink}
              href={actionButton.href}
              startIcon={actionButton.icon}
            >
              {actionButton.label}
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={actionButton.onClick}
              startIcon={actionButton.icon}
            >
              {actionButton.label}
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
} 