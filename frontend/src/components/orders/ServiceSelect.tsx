import React, { useState, useEffect } from 'react';
import {
  Box, Typography, FormControl, InputLabel, Select, MenuItem, TextField,
  Button, Paper, Grid, IconButton, Checkbox, FormControlLabel, FormHelperText
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-toastify';

interface Service {
  id: string;
  name: string;
  price: number;
  description?: string;
  priceModel?: 'per_kg' | 'per_piece' | 'flat_rate';
}

interface OrderItem {
  serviceId?: string;
  serviceName: string;
  quantity: number;
  price: number;
  weightBased?: boolean;
  weight?: number;
  subtotal: number;
  service?: Service;
}

interface ServiceSelectProps {
  onSelect: (items: OrderItem[]) => void;
  selectedItems: OrderItem[];
}

const ServiceSelect: React.FC<ServiceSelectProps> = ({ onSelect, selectedItems = [] }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [items, setItems] = useState<OrderItem[]>(selectedItems);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Local state for new item
  const [newItem, setNewItem] = useState<{
    serviceId: string;
    quantity: number;
    weightBased: boolean;
    weight: number;
  }>({
    serviceId: '',
    quantity: 1,
    weightBased: false,
    weight: 0.5
  });

  // Fetch services from API
  useEffect(() => {
    const fetchServices = async () => {
      setIsLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/services`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch services');
        }
        
        const data = await response.json();
        let servicesData = [];
        
        // Handle different API response formats
        if (data.data && Array.isArray(data.data)) {
          servicesData = data.data;
        } else if (data.items && Array.isArray(data.items)) {
          servicesData = data.items;
        } else if (Array.isArray(data)) {
          servicesData = data;
        } else {
          console.error('Unexpected services response format:', data);
          throw new Error('Invalid service data format');
        }
        
        setServices(servicesData);
      } catch (error) {
        setError('Failed to load services. Please try again.');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Handle service selection
  const handleServiceChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    const serviceId = e.target.value as string;
    
    // Find selected service
    const selectedService = services.find(s => s.id === serviceId);
    if (!selectedService) return;
    
    // Set default weight-based based on service priceModel, but allow it to be changed
    const defaultWeightBased = selectedService.priceModel === 'per_kg';
    
    setNewItem(prev => ({
      ...prev,
      serviceId,
      weightBased: defaultWeightBased,
      weight: 0.5,
      quantity: 1
    }));
  };

  // Handle quantity change
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const quantity = Math.max(1, parseInt(e.target.value) || 1);
    setNewItem(prev => ({ ...prev, quantity }));
  };
  
  // Handle weight change
  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const weight = Math.max(0.1, parseFloat(e.target.value) || 0.5);
    setNewItem(prev => ({ ...prev, weight }));
  };
  
  // Handle weight-based checkbox
  const handleWeightBasedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewItem(prev => ({ ...prev, weightBased: e.target.checked }));
  };

  // Add item to list
  const handleAddItem = () => {
    if (!newItem.serviceId) {
      toast.error('Please select a service');
      return;
    }

    const selectedService = services.find(s => s.id === newItem.serviceId);
    if (!selectedService) return;
    
    // Calculate subtotal based on user's choice (weight-based or piece-based)
    let subtotal = 0;
    if (newItem.weightBased) {
      // For weight-based items, use weight × price
      subtotal = Math.round(selectedService.price * newItem.weight);
    } else {
      // For piece-based items, use quantity × price
      subtotal = selectedService.price * newItem.quantity;
    }

    const newItemComplete: OrderItem = {
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      quantity: newItem.weightBased ? 0 : newItem.quantity,
      price: selectedService.price,
      weightBased: newItem.weightBased,
      weight: newItem.weightBased ? newItem.weight : 0,
      subtotal,
      service: selectedService
    };

    console.log('Adding new item:', {
      serviceName: selectedService.name,
      weightBased: newItem.weightBased,
      weight: newItem.weightBased ? newItem.weight : 0,
      quantity: newItem.weightBased ? 0 : newItem.quantity,
      price: selectedService.price,
      subtotal
    });

    const updatedItems = [...items, newItemComplete];
    setItems(updatedItems);
    
    // Reset new item form
    setNewItem({
      serviceId: '',
      quantity: 1,
      weightBased: false,
      weight: 0.5
    });
  };

  // Remove item from list
  const handleRemoveItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
  };

  // Continue to next step
  const handleContinue = () => {
    if (items.length === 0) {
      toast.error('Please add at least one service');
      return;
    }
    onSelect(items);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Pilih Layanan</Typography>
      
      {error && <Typography color="error">{error}</Typography>}
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth disabled={isLoading}>
              <InputLabel>Layanan</InputLabel>
              <Select
                value={newItem.serviceId}
                onChange={handleServiceChange as any}
                label="Layanan"
              >
                {services.map(service => (
                  <MenuItem key={service.id} value={service.id}>
                    {service.name} - Rp {service.price.toLocaleString('id-ID')} / {service.priceModel === 'per_kg' ? 'kg' : 'item'}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                {isLoading ? 'Loading services...' : 'Select a service'}
              </FormHelperText>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={2}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={newItem.weightBased}
                  onChange={handleWeightBasedChange}
                />
              }
              label="Berbasis Berat"
            />
          </Grid>
          
          <Grid item xs={12} sm={2}>
            {newItem.weightBased ? (
              <TextField
                label="Berat (kg)"
                type="number"
                fullWidth
                value={newItem.weight}
                onChange={handleWeightChange}
                InputProps={{ 
                  inputProps: { 
                    min: 0.1,
                    step: 0.1
                  } 
                }}
              />
            ) : (
              <TextField
                label="Jumlah"
                type="number"
                fullWidth
                value={newItem.quantity}
                onChange={handleQuantityChange}
                InputProps={{ inputProps: { min: 1 } }}
              />
            )}
          </Grid>
          
          <Grid item xs={6} sm={2}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleAddItem}
              disabled={isLoading || !newItem.serviceId}
              fullWidth
            >
              Tambah
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {items.length > 0 ? (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>Item yang Dipilih</Typography>
          
          {items.map((item, index) => (
            <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, p: 1, borderBottom: '1px solid #f0f0f0' }}>
              <Box>
                <Typography variant="body1">{item.serviceName}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.weightBased && item.weight !== undefined
                    ? `${item.weight} kg × Rp ${item.price.toLocaleString('id-ID')}`
                    : `${item.quantity} × Rp ${item.price.toLocaleString('id-ID')}`
                  }
                  {' = '}
                  Rp {item.subtotal.toLocaleString('id-ID')}
                </Typography>
              </Box>
              <IconButton onClick={() => handleRemoveItem(index)} size="small">
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
          
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e0e0e0', pt: 2 }}>
            <Typography variant="subtitle1">Total</Typography>
            <Typography variant="subtitle1">
              Rp {items.reduce((sum, item) => sum + item.subtotal, 0).toLocaleString('id-ID')}
            </Typography>
          </Box>
        </Paper>
      ) : (
        <Paper sx={{ p: 2, mb: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">Belum ada layanan yang dipilih</Typography>
        </Paper>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleContinue}
          disabled={items.length === 0}
        >
          Lanjutkan
        </Button>
      </Box>
    </Box>
  );
};

export default ServiceSelect; 