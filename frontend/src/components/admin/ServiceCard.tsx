import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Grid,
  Divider
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

// Interface untuk tipe layanan
export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  estimatedTime: string;
  isPopular: boolean;
  isAvailable: boolean;
  priceUnit?: 'kg' | 'item'; // Untuk UI frontend
  
  // Properti dari API backend yang mungkin ditemui
  priceModel?: string; // 'per_kg' | 'per_piece' | 'flat_rate'
  processingTimeHours?: number;
  isActive?: boolean;
}

// Props untuk komponen ServiceCard
interface ServiceCardProps {
  service: Service;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

// Komponen ServiceCard untuk menampilkan informasi layanan
export default function ServiceCard({ service, onEdit, onDelete }: ServiceCardProps) {
  // Menangani klik tombol edit
  const handleEdit = () => {
    if (onEdit) {
      onEdit(service.id);
    }
  };

  // Menangani klik tombol hapus
  const handleDelete = () => {
    if (onDelete) {
      onDelete(service.id);
    }
  };

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Typography variant="h6" component="h2" gutterBottom>
            {service.name}
          </Typography>
          <Box>
            {service.isPopular && (
              <Chip
                label="Populer"
                color="secondary"
                size="small"
                sx={{ mr: 1 }}
              />
            )}
            <Chip
              label={service.isAvailable ? "Tersedia" : "Tidak Tersedia"}
              color={service.isAvailable ? "success" : "error"}
              size="small"
            />
          </Box>
        </Box>
        
        <Typography color="textSecondary" variant="body2" gutterBottom>
          {service.category}
        </Typography>
        
        <Typography variant="body2" paragraph sx={{ mt: 1 }}>
          {service.description}
        </Typography>
        
        <Divider sx={{ my: 1.5 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2" color="textSecondary">
              Waktu Estimasi
            </Typography>
            <Typography variant="body1">
              {service.estimatedTime}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="textSecondary">
              Harga
            </Typography>
            <Typography variant="h6" color="primary">
              Rp {service.price.toLocaleString()}
              {service.priceUnit && (
                <Typography component="span" variant="body2" color="textSecondary" sx={{ ml: 0.5 }}>
                  / {service.priceUnit === 'kg' ? 'kg' : 'item'}
                </Typography>
              )}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
      
      <Box 
        sx={{ 
          p: 1, 
          borderTop: '1px solid rgba(0, 0, 0, 0.12)',
          display: 'flex',
          justifyContent: 'flex-end'
        }}
      >
        <IconButton 
          size="small" 
          color="primary" 
          onClick={handleEdit}
          sx={{ mr: 1 }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton 
          size="small" 
          color="error" 
          onClick={handleDelete}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>
    </Card>
  );
} 