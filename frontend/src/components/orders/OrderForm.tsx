'use client';

import { useState, useEffect } from 'react';
import {
  Box, Paper, Button, CircularProgress, 
  TextField, Grid, Typography, 
  MenuItem, Select, FormControl, 
  InputLabel, FormHelperText, FormControlLabel, Checkbox
} from '@mui/material';
import { toast } from 'react-toastify';
import { createAuthHeaders } from '@/lib/api-utils';

export interface OrderItem {
  id?: string;
  serviceId: string;
  serviceName: string;
  quantity: number;
  price: number;
  subtotal?: number;
  weightBased?: boolean;
  weight?: number;
  service?: Service;
}

interface Service {
  id: string;
  name: string;
  price: number;
  unit: string;
  description?: string;
  priceModel?: 'per_kg' | 'per_piece' | 'flat_rate';
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
  isLoading?: boolean;
}

export default function OrderForm({ initialData, onSubmit, onCancel, isLoading }: OrderFormProps) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  
  // Form state
  const [formValues, setFormValues] = useState({
    customerId: initialData?.customerId || '',
    items: initialData?.items || [] as OrderItem[],
    notes: initialData?.notes || '',
    total: 0
  });
  
  // New item state
  const [newItem, setNewItem] = useState<OrderItem>({
    serviceId: '',
    serviceName: '',
    quantity: 1,
    weight: 0.5,
    price: 0,
    weightBased: false
  });
  
  // Form errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Fetch customers when component mounts
    const fetchCustomers = async () => {
      setLoadingCustomers(true);
      try {
        // Use the Next.js API proxy
        const apiUrl = '/api/customers';
        console.log('OrderForm: Fetching customers from:', apiUrl);
        
        const response = await fetch(apiUrl, {
          headers: createAuthHeaders()
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('OrderForm: Failed to fetch customers:', response.status, response.statusText, errorText);
          throw new Error(`Failed to fetch customers: ${response.status} ${response.statusText}`);
        }
        
        const responseData = await response.json();
        console.log('OrderForm: Customers response data:', responseData);

        // Handle nested response format: { data: { items: [] }, statusCode, message }
        let customersArray = [];
        if (responseData.data && responseData.data.items && Array.isArray(responseData.data.items)) {
          customersArray = responseData.data.items;
          console.log(`OrderForm: Loaded ${customersArray.length} customers from data.items`);
        } else if (responseData.items && Array.isArray(responseData.items)) {
          customersArray = responseData.items;
          console.log(`OrderForm: Loaded ${customersArray.length} customers from items property`);
        } else if (responseData.data && Array.isArray(responseData.data)) {
          customersArray = responseData.data;
          console.log(`OrderForm: Loaded ${customersArray.length} customers from data property`);
        } else if (Array.isArray(responseData)) {
          customersArray = responseData;
          console.log(`OrderForm: Loaded ${customersArray.length} customers from array response`);
        } else {
          console.error('OrderForm: Unexpected customers response format:', responseData);
          customersArray = [];
        }
        
        setCustomers(customersArray);
      } catch (error) {
        console.error('OrderForm: Error fetching customers:', error);
        // Show error in UI
        toast.error('Failed to load customers. Please try again.');
      } finally {
        setLoadingCustomers(false);
      }
    };

    // Fetch services from backend
    const fetchServices = async () => {
      setLoadingServices(true);
      try {
        // Use the Next.js API proxy
        const apiUrl = '/api/services';
        const response = await fetch(apiUrl, {
          headers: createAuthHeaders()
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch services');
        }
        const responseData = await response.json();
        console.log('OrderForm: Services response data:', responseData);
        
        // Handle nested response format: { data: { items: [] }, statusCode, message }
        let servicesArray = [];
        if (responseData.data && responseData.data.items && Array.isArray(responseData.data.items)) {
          servicesArray = responseData.data.items;
          console.log(`OrderForm: Loaded ${servicesArray.length} services from data.items`);
        } else if (responseData.items && Array.isArray(responseData.items)) {
          servicesArray = responseData.items;
          console.log(`OrderForm: Loaded ${servicesArray.length} services from items property`);
        } else if (responseData.data && Array.isArray(responseData.data)) {
          servicesArray = responseData.data;
          console.log(`OrderForm: Loaded ${servicesArray.length} services from data property`);
        } else if (Array.isArray(responseData)) {
          servicesArray = responseData;
          console.log(`OrderForm: Loaded ${servicesArray.length} services from array response`);
        } else {
          console.error('OrderForm: Unexpected services response format:', responseData);
          servicesArray = [];
        }
        
        setServices(servicesArray);
      } catch (error) {
        console.error('OrderForm: Error fetching services:', error);
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

  // Handle new service selection
  const handleNewServiceChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    const serviceId = e.target.value as string;
    
    // Find the selected service from our service list
    const selectedService = services.find(service => service.id === serviceId);
    
    if (selectedService) {
      // Check if this is a weight-based service
      const isWeightBased = 
        // First priority: Check priceModel
        selectedService.priceModel === 'per_kg' ||
        // Fallback: Check by service name/id for legacy data
        ['Dry Cleaning', 'Cuci Express', 'Cuci Reguler', 'Setrika'].includes(selectedService.name) ||
        [1, 2, 3, 4].includes(Number(selectedService.id));
      
      setNewItem({
        serviceId,
        serviceName: selectedService.name,
        quantity: 1,
        weight: 0.5, // Default weight for weight-based services
        price: selectedService.price,
        weightBased: isWeightBased,
        service: selectedService
      });
    } else {
      setNewItem({
        serviceId,
        serviceName: '',
        quantity: 1,
        weight: 0.5,
        price: 0,
        weightBased: false
      });
    }
  };

  // Handle new item quantity change
  const handleNewItemQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const quantity = parseInt(e.target.value) || 0;
    setNewItem({ ...newItem, quantity });
  };

  // Handle service selection for an existing item
  const handleServiceSelect = (index: number, serviceId: string) => {
    // Find the selected service
    const selectedService = services.find(service => service.id === serviceId);
    
    if (!selectedService) return;
    
    // Check if this is a weight-based service
    const isWeightBased = 
      // First priority: Check priceModel
      selectedService.priceModel === 'per_kg' ||
      // Fallback: Check by service name/id for legacy data
      ['Dry Cleaning', 'Cuci Express', 'Cuci Reguler', 'Setrika'].includes(selectedService.name) ||
      [1, 2, 3, 4].includes(Number(selectedService.id));
    
    // Update the item with service details
    const updatedItems = [...formValues.items];
    updatedItems[index] = {
      ...updatedItems[index],
      serviceId,
      serviceName: selectedService.name,
      price: selectedService.price,
      weightBased: isWeightBased,
      // Set default weight if it's weight-based and weight is not yet set
      weight: isWeightBased ? (updatedItems[index].weight || 0.5) : undefined,
      service: selectedService
    };
    
    // Update form values
    setFormValues(prev => ({
      ...prev,
      items: updatedItems,
      total: calculateTotal(updatedItems)
    }));
  };

  // Handle add item
  const handleAddItem = () => {
    if (!newItem.serviceId || (newItem.weightBased ? (!newItem.weight || newItem.weight < 0.1) : newItem.quantity <= 0)) {
      return;
    }
    
    // Create the item to add
    const itemToAdd: OrderItem = {
      serviceId: newItem.serviceId,
      serviceName: newItem.serviceName,
      quantity: newItem.weightBased ? 1 : newItem.quantity, // For weight-based items, set quantity to 1
      weight: newItem.weightBased ? Number(newItem.weight) : undefined, // Ensure weight is a number
      price: newItem.price,
      weightBased: newItem.weightBased || false,
      service: newItem.service,
      subtotal: newItem.weightBased 
        ? Number(newItem.weight) * newItem.price 
        : newItem.quantity * newItem.price
    };
    
    // Add item to form values
    setFormValues(prev => ({
      ...prev,
      items: [...prev.items, itemToAdd],
      total: calculateTotal([...prev.items, itemToAdd])
    }));
    
    // Reset new item form
    setNewItem({
      serviceId: '',
      serviceName: '',
      quantity: 1,
      weight: 0.5,
      price: 0,
      weightBased: false
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
      const item = updatedItems[index];
      
      // Update the field
      updatedItems[index] = {
        ...item,
        [field]: value
      };
      
      // Recalculate subtotal if price, weight, or quantity changes
      if (field === 'price' || field === 'weight' || field === 'quantity') {
        const isWeightBased = item.service?.priceModel === 'per_kg';
        const weight = isWeightBased ? Number(item.weight) : undefined;
        const quantity = isWeightBased ? 1 : Number(item.quantity);
        const price = Number(item.price);
        
        updatedItems[index].subtotal = isWeightBased && weight !== undefined
          ? weight * price
          : quantity * price;
      }
      
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

  // Calculate total order amount based on service priceModel
  const calculateTotal = (items: OrderItem[]): number => {
    return items.reduce((total, item) => {
      const isWeightBased = item.service?.priceModel === 'per_kg';
      if (isWeightBased && item.weight !== undefined) {
        return total + (Number(item.weight) * item.price);
      }
      return total + (item.quantity * item.price);
    }, 0);
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Validate customer ID
    if (!formValues.customerId) {
      errors.customerId = 'Pelanggan wajib dipilih';
    }
    
    // Validate items
    if (!formValues.items.length) {
      errors.items = 'Minimal satu layanan wajib ditambahkan';
    } else {
      formValues.items.forEach((item, index) => {
        if (!item.serviceId && !item.serviceName) {
          errors[`items.${index}.serviceId`] = 'Layanan wajib dipilih';
        }
        
        // Validate quantity or weight based on weightBased flag
        if (item.weightBased) {
          // For weight-based items, validate weight
          if (!item.weight || item.weight < 0.1) {
            errors[`items.${index}.weight`] = 'Berat minimal 0.1 kg';
          }
        } else {
          // For piece-based items, validate quantity
          if (!item.quantity || item.quantity <= 0) {
            errors[`items.${index}.quantity`] = 'Jumlah wajib diisi';
          }
        }
        
        // Validate price
        if (!item.price || item.price <= 0) {
          errors[`items.${index}.price`] = 'Harga wajib diisi';
        }
      });
    }
    
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
        serviceName: item.serviceName,
        quantity: item.quantity,
        price: item.price,
        weightBased: item.weightBased,
        weight: item.weight
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
                <Grid item xs={12} sm={5}>
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
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={item.weightBased || false}
                        onChange={(e) => handleItemChange(index, 'weightBased', e.target.checked)}
                        disabled={isLoading}
                      />
                    }
                    label="Berbasis Berat"
                  />
                </Grid>
                
                <Grid item xs={6} sm={2}>
                  {item.weightBased ? (
                    <TextField
                      label="Berat (kg) *"
                      type="number"
                      fullWidth
                      value={item.weight !== undefined ? item.weight : item.quantity}
                      onChange={(e) => handleItemChange(index, 'weight', parseFloat(e.target.value) || 0)}
                      error={!!getItemError(index, 'weight')}
                      helperText={getItemError(index, 'weight')}
                      disabled={isLoading}
                      InputProps={{ 
                        inputProps: { 
                          min: 0.1,
                          step: 0.1
                        } 
                      }}
                      required
                    />
                  ) : (
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
                  )}
                </Grid>
                
                <Grid item xs={6} sm={2}>
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
              <Grid item xs={12} sm={4}>
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
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={newItem.weightBased || false}
                      onChange={(e) => {
                        setNewItem({ ...newItem, weightBased: e.target.checked });
                      }}
                      disabled={isLoading}
                    />
                  }
                  label="Berbasis Berat"
                />
              </Grid>
              
              <Grid item xs={6} sm={2}>
                {newItem.weightBased ? (
                  <TextField
                    label="Berat (kg)"
                    type="number"
                    fullWidth
                    value={newItem.weight !== undefined ? newItem.weight : newItem.quantity}
                    onChange={(e) => {
                      const weight = parseFloat(e.target.value) || 0.1;
                      setNewItem({ ...newItem, weight });
                    }}
                    disabled={isLoading}
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
                    onChange={handleNewItemQuantityChange}
                    disabled={isLoading}
                    InputProps={{ inputProps: { min: 1 } }}
                  />
                )}
              </Grid>
              
              <Grid item xs={6} sm={2}>
                <Button
                  variant="contained"
                  onClick={handleAddItem}
                  disabled={isLoading || !newItem.serviceId || (newItem.weightBased ? (!newItem.weight || newItem.weight < 0.1) : newItem.quantity <= 0)}
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