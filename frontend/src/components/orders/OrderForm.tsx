'use client';

import { useState, useEffect } from 'react';
import {
  Box, Paper, Button, CircularProgress, 
  TextField, Grid, Typography, 
  MenuItem, Select, FormControl, 
  InputLabel, FormHelperText
} from '@mui/material';

interface OrderItem {
  serviceId?: string;
  id?: string;
  name: string;
  quantity: number;
  price: number;
}

interface Service {
  id: string;
  name: string;
  price: number;
  unit: string;
  description?: string;
}

interface OrderFormValues {
  customerId: string;
  items: OrderItem[];
  notes: string;
  total?: number; // Adding total to the form values interface
}

interface OrderFormProps {
  initialData?: {
    customerId?: string;
    items?: OrderItem[];
    notes?: string;
  };
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export default function OrderForm({ initialData, onSubmit, onCancel, isLoading }: OrderFormProps) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  
  // Define the newItem state
  const [newItem, setNewItem] = useState({
    serviceId: '',
    quantity: 1,
    price: 0
  });
  
  const [formValues, setFormValues] = useState<OrderFormValues>({
    customerId: initialData?.customerId || '',
    items: initialData?.items || [],
    notes: initialData?.notes || ''
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Fetch customers when component mounts
    const fetchCustomers = async () => {
      setLoadingCustomers(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        console.log('Fetching customers from:', `${apiUrl}/customers?limit=100&page=1`);
        
        const response = await fetch(`${apiUrl}/customers?limit=100&page=1`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch customers: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Customers response:', data);
        
        if (data.items && Array.isArray(data.items)) {
          setCustomers(data.items);
        } else if (Array.isArray(data)) {
          setCustomers(data);
        } else {
          console.error('Unexpected customers response format:', data);
          setCustomers([]);
        }
      } catch (error) {
        console.error('Error fetching customers:', error);
      } finally {
        setLoadingCustomers(false);
      }
    };

    // Fetch services from backend
    const fetchServices = async () => {
      setLoadingServices(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/services?limit=100&page=1`);
        if (!response.ok) {
          throw new Error('Failed to fetch services');
        }
        const data = await response.json();
        setServices(data.items || []);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoadingServices(false);
      }
    };

    fetchCustomers();
    fetchServices();
  }, []);

  // Handle basic input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle customer selection
  const handleCustomerChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    setFormValues(prev => ({
      ...prev,
      customerId: e.target.value as string
    }));
    
    if (formErrors.customerId) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.customerId;
        return newErrors;
      });
    }
  };

  // Handle service selection for newItem
  const handleNewServiceChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    const serviceId = e.target.value as string;
    const selectedService = services.find(service => service.id === serviceId);
    
    if (selectedService) {
      setNewItem({
        serviceId,
        quantity: newItem.quantity,
        price: selectedService.price
      });
    }
  };

  // Handle quantity change for newItem
  const handleNewItemQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const quantity = parseInt(e.target.value) || 1;
    setNewItem(prev => ({
      ...prev,
      quantity
    }));
  };

  // Handle service selection
  const handleServiceSelect = (index: number, serviceId: string) => {
    const selectedService = services.find(service => service.id === serviceId);
    if (selectedService) {
      setFormValues(prev => {
        const updatedItems = [...prev.items];
        updatedItems[index] = {
          ...updatedItems[index],
          serviceId: selectedService.id,
          name: selectedService.name,
          price: selectedService.price
        };
        return {
          ...prev,
          items: updatedItems
        };
      });
    }
  };

  // Handle adding a new item
  const handleAddItem = () => {
    if (!newItem.serviceId || newItem.quantity <= 0) {
      return;
    }
    
    // Find the selected service
    const selectedService = services.find(service => service.id === newItem.serviceId);
    
    if (!selectedService) {
      return;
    }
    
    const updatedItems = [...formValues.items, {
      serviceId: newItem.serviceId,
      name: selectedService.name,
      quantity: newItem.quantity,
      price: selectedService.price
    }];
    
    // Update items and calculate new total
    setFormValues({
      ...formValues,
      items: updatedItems,
      total: calculateTotal(updatedItems)
    });
    
    // Reset the new item
    setNewItem({
      serviceId: '',
      quantity: 1,
      price: 0
    });
  };

  // Handle removing an item
  const handleRemoveItem = (index: number) => {
    setFormValues(prev => {
      const updatedItems = prev.items.filter((_, i) => i !== index);
      return {
        ...prev,
        items: updatedItems,
        total: calculateTotal(updatedItems)
      };
    });
  };

  // Handle item field change
  const handleItemChange = (index: number, field: string, value: any) => {
    setFormValues(prev => {
      const updatedItems = [...prev.items];
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value
      };
      return {
        ...prev,
        items: updatedItems,
        total: calculateTotal(updatedItems)
      };
    });
    
    // Clear validation error for this item
    const errorKey = `items.${index}.${field}`;
    if (formErrors[errorKey]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  // Calculate total order amount
  const calculateTotal = (items: OrderItem[]): number => {
    return items.reduce((total, item) => {
      return total + (item.quantity * item.price);
    }, 0);
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formValues.customerId) {
      errors.customerId = 'Pelanggan wajib dipilih';
    }
    
    if (formValues.items.length === 0) {
      errors.items = 'Minimal satu layanan harus ditambahkan';
    }
    
    formValues.items.forEach((item, index) => {
      if (!item.serviceId && !item.name) {
        errors[`items.${index}.serviceId`] = 'Layanan wajib dipilih';
      }
      
      if (item.quantity <= 0) {
        errors[`items.${index}.quantity`] = 'Jumlah harus lebih dari 0';
      }
      
      if (item.price <= 0) {
        errors[`items.${index}.price`] = 'Harga harus lebih dari 0';
      }
    });
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Get error for an item field
  const getItemError = (index: number, field: string) => {
    const errorKey = `items.${index}.${field}`;
    return formErrors[errorKey];
  };

  // Handle submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Prepare data for submission
    const submitData = {
      customerId: formValues.customerId,
      items: formValues.items.map(item => ({
        serviceId: item.serviceId,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      notes: formValues.notes,
      total: calculateTotal(formValues.items)
    };
    
    onSubmit(submitData);
  };

  return (
    <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Customer Selection */}
        <Grid item xs={12}>
          <FormControl fullWidth error={!!formErrors.customerId}>
            <InputLabel id="customer-select-label">Pilih Pelanggan *</InputLabel>
            <Select
              labelId="customer-select-label"
              id="customer-select"
              value={formValues.customerId}
              onChange={handleCustomerChange as any}
              label="Pilih Pelanggan *"
              disabled={isLoading || loadingCustomers}
            >
              {loadingCustomers ? (
                <MenuItem value="" disabled>
                  Loading customers...
                </MenuItem>
              ) : customers.length === 0 ? (
                <MenuItem value="" disabled>
                  No customers found
                </MenuItem>
              ) : (
                customers.map(customer => (
                  <MenuItem key={customer.id} value={customer.id}>
                    {customer.name} - {customer.phone}
                  </MenuItem>
                ))
              )}
            </Select>
            {formErrors.customerId && (
              <FormHelperText>{formErrors.customerId}</FormHelperText>
            )}
          </FormControl>
        </Grid>
        
        {/* Order Items */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Layanan
          </Typography>
          
          {formValues.items.map((item, index) => (
            <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!getItemError(index, 'serviceId')}>
                    <InputLabel id={`service-select-label-${index}`}>Layanan *</InputLabel>
                    <Select
                      labelId={`service-select-label-${index}`}
                      id={`service-select-${index}`}
                      value={item.serviceId || ''}
                      onChange={(e) => handleServiceSelect(index, e.target.value as string)}
                      label="Layanan *"
                      disabled={isLoading || loadingServices}
                    >
                      {loadingServices ? (
                        <MenuItem value="" disabled>
                          Loading services...
                        </MenuItem>
                      ) : services.length === 0 ? (
                        <MenuItem value="" disabled>
                          No services found
                        </MenuItem>
                      ) : (
                        services.map(service => (
                          <MenuItem key={service.id} value={service.id}>
                            {service.name} - Rp {service.price.toLocaleString()}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                    {getItemError(index, 'serviceId') && (
                      <FormHelperText>{getItemError(index, 'serviceId')}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                
                <Grid item xs={6} sm={2}>
                  <TextField
                    label="Jumlah *"
                    type="number"
                    fullWidth
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                    error={!!getItemError(index, 'quantity')}
                    helperText={getItemError(index, 'quantity')}
                    disabled={isLoading}
                    InputProps={{ inputProps: { min: 1 } }}
                    required
                  />
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <TextField
                    label="Harga *"
                    type="number"
                    fullWidth
                    value={item.price}
                    onChange={(e) => handleItemChange(index, 'price', parseInt(e.target.value) || 0)}
                    error={!!getItemError(index, 'price')}
                    helperText={getItemError(index, 'price')}
                    disabled={isLoading || item.serviceId !== ''}
                    InputProps={{ inputProps: { min: 0 } }}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={1} display="flex" alignItems="center" justifyContent="center">
                  <Button 
                    variant="outlined" 
                    color="error" 
                    onClick={() => handleRemoveItem(index)}
                    disabled={isLoading}
                    sx={{ minWidth: '40px', p: '5px' }}
                  >
                    X
                  </Button>
                </Grid>
              </Grid>
            </Box>
          ))}
          
          {/* Add New Service Section */}
          <Box sx={{ mb: 2, p: 2, border: '1px dashed #e0e0e0', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Tambah Layanan Baru
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="new-service-select-label">Pilih Layanan</InputLabel>
                  <Select
                    labelId="new-service-select-label"
                    id="new-service-select"
                    value={newItem.serviceId}
                    onChange={handleNewServiceChange as any}
                    label="Pilih Layanan"
                    disabled={isLoading || loadingServices}
                  >
                    {loadingServices ? (
                      <MenuItem value="" disabled>
                        Loading services...
                      </MenuItem>
                    ) : services.length === 0 ? (
                      <MenuItem value="" disabled>
                        No services found
                      </MenuItem>
                    ) : (
                      services.map(service => (
                        <MenuItem key={service.id} value={service.id}>
                          {service.name} - Rp {service.price.toLocaleString()}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={6} sm={2}>
                <TextField
                  label="Jumlah"
                  type="number"
                  fullWidth
                  value={newItem.quantity}
                  onChange={handleNewItemQuantityChange}
                  disabled={isLoading}
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </Grid>
              
              <Grid item xs={6} sm={4}>
                <Button
                  variant="contained"
                  onClick={handleAddItem}
                  disabled={isLoading || !newItem.serviceId || newItem.quantity <= 0}
                  fullWidth
                >
                  Tambah
                </Button>
              </Grid>
            </Grid>
          </Box>
          
          {formErrors.items && (
            <FormHelperText error>{formErrors.items}</FormHelperText>
          )}
        </Grid>
        
        {/* Total */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Typography variant="h6">
              Total: Rp {calculateTotal(formValues.items).toLocaleString()}
            </Typography>
          </Box>
        </Grid>
        
        {/* Notes */}
        <Grid item xs={12}>
          <TextField
            name="notes"
            label="Catatan"
            fullWidth
            value={formValues.notes}
            onChange={handleInputChange}
            disabled={isLoading}
            multiline
            rows={3}
            placeholder="Preferensi pelanggan, catatan khusus, dll."
          />
        </Grid>
      </Grid>
      
      {/* Buttons */}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button
          variant="outlined"
          onClick={onCancel}
          disabled={isLoading}
        >
          Batal
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={isLoading || formValues.items.length === 0}
          startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {isLoading ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </Box>
    </Paper>
  );
} 