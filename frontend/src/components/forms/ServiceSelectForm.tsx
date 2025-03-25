'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  TextField,
  Button
} from '@mui/material';
import { Add, Remove } from '@mui/icons-material';

// Interface untuk layanan
export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  priceUnit: 'item' | 'kg';
  estimatedDuration: number;
  category: string;
  imageUrl?: string;
}

// Interface untuk item yang dipilih
export interface SelectedItem {
  serviceId: string;
  quantity: number;
}

interface ServiceSelectFormProps {
  services: Service[];
  selectedItems: SelectedItem[];
  onSelectionChange: (selectedItems: SelectedItem[]) => void;
}

const ServiceSelectForm: React.FC<ServiceSelectFormProps> = ({
  services,
  selectedItems,
  onSelectionChange
}) => {
  // Mendapatkan quantity dari service
  const getQuantity = (serviceId: string): number => {
    const item = selectedItems.find(item => item.serviceId === serviceId);
    return item ? item.quantity : 0;
  };

  // Handler untuk mengubah quantity layanan
  const handleQuantityChange = (serviceId: string, quantity: number) => {
    const newQuantity = Math.max(0, quantity); // Pastikan nilai tidak negatif
    
    let updatedItems: SelectedItem[];
    
    if (newQuantity === 0) {
      // Hapus item jika quantity-nya 0
      updatedItems = selectedItems.filter(item => item.serviceId !== serviceId);
    } else {
      const existingItemIndex = selectedItems.findIndex(item => item.serviceId === serviceId);
      
      if (existingItemIndex >= 0) {
        // Update item yang sudah ada
        updatedItems = [...selectedItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: newQuantity
        };
      } else {
        // Tambahkan item baru
        updatedItems = [
          ...selectedItems,
          { serviceId, quantity: newQuantity }
        ];
      }
    }
    
    onSelectionChange(updatedItems);
  };

  // Mengelompokkan layanan berdasarkan kategori
  const servicesByCategory = services.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, Service[]>);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Pilih Layanan Laundry
      </Typography>
      
      {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
        <Box key={category} mb={4}>
          <Typography variant="subtitle1" fontWeight="bold" mb={2}>
            {category}
          </Typography>
          
          <Grid container spacing={2}>
            {categoryServices.map(service => {
              const quantity = getQuantity(service.id);
              const isSelected = quantity > 0;
              
              return (
                <Grid item xs={12} sm={6} md={4} key={service.id}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      borderColor: isSelected ? 'primary.main' : 'divider',
                      borderWidth: isSelected ? 2 : 1,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    {service.imageUrl && (
                      <CardMedia
                        component="img"
                        height="140"
                        image={service.imageUrl}
                        alt={service.name}
                      />
                    )}
                    
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {service.name}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {service.description}
                      </Typography>
                      
                      <Typography variant="subtitle1" color="primary" fontWeight="bold">
                        Rp {service.price.toLocaleString()} / {service.priceUnit === 'kg' ? 'kg' : 'item'}
                      </Typography>
                      
                      <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                        Estimasi: {service.estimatedDuration} jam
                      </Typography>
                      
                      <Box mt={2} display="flex" alignItems="center">
                        <Button
                          size="small"
                          variant="outlined"
                          disabled={quantity === 0}
                          onClick={() => handleQuantityChange(service.id, quantity - 1)}
                        >
                          <Remove fontSize="small" />
                        </Button>
                        
                        <TextField
                          size="small"
                          variant="outlined"
                          value={quantity}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (!isNaN(value)) {
                              handleQuantityChange(service.id, value);
                            }
                          }}
                          InputProps={{
                            inputProps: { min: 0, style: { textAlign: 'center' } }
                          }}
                          sx={{ 
                            width: '60px', 
                            mx: 1,
                            '& input': { p: 1 }
                          }}
                        />
                        
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleQuantityChange(service.id, quantity + 1)}
                        >
                          <Add fontSize="small" />
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      ))}
    </Box>
  );
};

export default ServiceSelectForm; 