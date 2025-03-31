'use client';

import React, { useState, useEffect } from 'react';
import { createAuthHeaders } from '@/lib/api-utils';
import { Service, ServicePriceModel, priceModelLabels } from '@/types/service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Trash } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

export interface OrderItem {
  serviceId?: string;
  serviceName: string;
  quantity: number;
  price: number;
  weightBased?: boolean;
  weight?: number;
  subtotal: number;
  service?: Service;
}

export interface ServiceSelectProps {
  onSelectServices: (items: OrderItem[]) => void;
  selectedItems?: OrderItem[];
}

export default function ServiceSelect({ onSelectServices, selectedItems = [] }: ServiceSelectProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [items, setItems] = useState<OrderItem[]>(() => {
    // Try to load saved items from localStorage on initial render
    const savedItems = localStorage.getItem('orderItems');
    if (savedItems) {
      try {
        return JSON.parse(savedItems);
      } catch (e) {
        console.error('Failed to parse saved items:', e);
      }
    }
    // Fall back to selectedItems from props if no saved items
    return selectedItems;
  });
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

  // Save items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('orderItems', JSON.stringify(items));
  }, [items]);

  // Fetch services from API
  useEffect(() => {
    const fetchServices = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/services', {
          headers: createAuthHeaders()
        });
        
        if (!response.ok) {
          throw new Error('Gagal mengambil data layanan');
        }
        
        const responseData = await response.json();
        let servicesData = [];
        
        if (responseData.data?.items) {
          servicesData = responseData.data.items;
        } else if (responseData.items) {
          servicesData = responseData.items;
        } else if (responseData.data) {
          servicesData = responseData.data;
        } else if (Array.isArray(responseData)) {
          servicesData = responseData;
        } else {
          throw new Error('Format data layanan tidak valid');
        }
        
        setServices(servicesData);
      } catch (error) {
        setError('Gagal memuat layanan. Silakan coba lagi.');
        console.error('Error mengambil layanan:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Calculate total price
  const calculateTotal = () => {
    return items.reduce((total, item) => total + item.subtotal, 0);
  };

  // Handle service selection
  const handleServiceChange = (value: string) => {
    const selectedService = services.find(s => s.id === value);
    if (selectedService) {
      const isWeightBased = selectedService.priceModel === ServicePriceModel.PER_KG;
      setNewItem({
        ...newItem,
        serviceId: selectedService.id,
        weightBased: isWeightBased,
        weight: isWeightBased ? 0.5 : 0,
        quantity: isWeightBased ? 1 : 1
      });
    }
  };

  // Handle quantity/weight change
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setNewItem({
        ...newItem,
        quantity: value,
        weight: newItem.weightBased ? value : 0
      });
    }
  };

  // Add item to order
  const handleAddItem = () => {
    const selectedService = services.find(s => s.id === newItem.serviceId);
    if (!selectedService) {
      toast.error('Silakan pilih layanan terlebih dahulu');
      return;
    }

    const isWeightBased = selectedService.priceModel === ServicePriceModel.PER_KG;
    const quantity = isWeightBased ? newItem.weight : newItem.quantity;
    const subtotal = quantity * selectedService.price;

    // Check if this service already exists in the items
    const existingItemIndex = items.findIndex(item => 
      item.serviceId === selectedService.id && item.weightBased === isWeightBased
    );

    let updatedItems;
    
    if (existingItemIndex >= 0) {
      // Update existing item by adding the quantity/weight
      updatedItems = [...items];
      const existingItem = updatedItems[existingItemIndex];
      
      if (isWeightBased) {
        // For weight-based items, add to the weight
        const newWeight = (existingItem.weight || 0) + quantity;
        updatedItems[existingItemIndex] = {
          ...existingItem,
          weight: newWeight,
          subtotal: newWeight * existingItem.price
        };
      } else {
        // For quantity-based items, add to the quantity
        const newQuantity = existingItem.quantity + quantity;
        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: newQuantity,
          subtotal: newQuantity * existingItem.price
        };
      }
    } else {
      // Add as new item
      const newOrderItem: OrderItem = {
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        quantity: isWeightBased ? 1 : quantity,
        price: selectedService.price,
        weightBased: isWeightBased,
        weight: isWeightBased ? quantity : undefined,
        subtotal,
        service: selectedService
      };
      
      updatedItems = [...items, newOrderItem];
    }

    setItems(updatedItems);
    
    // Notify parent of items change
    onSelectServices(updatedItems);

    // Reset form
    setNewItem({
      serviceId: '',
      quantity: 1,
      weightBased: false,
      weight: 0.5
    });

    // Show toast notification for feedback
    toast.success(existingItemIndex >= 0 ? 'Layanan diperbarui' : 'Layanan ditambahkan');
  };

  // Remove item from order
  const handleRemoveItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
    onSelectServices(updatedItems);
  };

  // Edit item quantity/weight
  const handleEditItem = (index: number, newValue: number) => {
    if (newValue <= 0) {
      // If quantity/weight is set to zero or negative, remove the item
      handleRemoveItem(index);
      return;
    }

    const updatedItems = [...items];
    const item = updatedItems[index];
    
    // Update quantity or weight based on item type
    if (item.weightBased) {
      item.weight = newValue;
      item.subtotal = newValue * item.price;
    } else {
      item.quantity = newValue;
      item.subtotal = newValue * item.price;
    }
    
    setItems(updatedItems);
    onSelectServices(updatedItems);
    toast.success('Jumlah layanan diperbarui');
  };

  // Add quick sample items for testing (for development only)
  const addSampleGordyn = () => {
    if (services.length === 0) {
      toast.error("Layanan belum tersedia");
      return;
    }

    // Find service by name or create mock one if not found
    const gordynService = services.find(s => s.name.includes('Gordyn')) || {
      id: 'gordyn-mock-id',
      name: 'Cuci Gordyn',
      price: 15000,
      priceModel: ServicePriceModel.PER_KG
    };
    
    // Check if this service already exists in the items
    const existingItemIndex = items.findIndex(item => 
      (item.serviceId === gordynService.id || item.serviceName === gordynService.name) && 
      item.weightBased === true
    );

    let updatedItems;
    
    if (existingItemIndex >= 0) {
      // Update existing item by adding the weight
      updatedItems = [...items];
      const existingItem = updatedItems[existingItemIndex];
      const newWeight = (existingItem.weight || 0) + 0.5;
      updatedItems[existingItemIndex] = {
        ...existingItem,
        weight: newWeight,
        subtotal: newWeight * existingItem.price
      };
    } else {
      // Add as new item
      const newOrderItem: OrderItem = {
        serviceId: gordynService.id,
        serviceName: gordynService.name,
        quantity: 1,
        price: 15000,
        weightBased: true,
        weight: 0.5,
        subtotal: 7500,
        service: gordynService as Service
      };
      
      updatedItems = [...items, newOrderItem];
    }

    setItems(updatedItems);
    onSelectServices(updatedItems);
    toast.success('Layanan Cuci Gordyn ditambahkan');
  };

  const addSampleExpress = () => {
    if (services.length === 0) {
      toast.error("Layanan belum tersedia");
      return;
    }

    // Find service by name or create mock one if not found
    const expressService = services.find(s => s.name.includes('Express')) || {
      id: 'express-mock-id',
      name: 'Cuci Express',
      price: 12000,
      priceModel: ServicePriceModel.PER_KG
    };
    
    // Check if this service already exists in the items
    const existingItemIndex = items.findIndex(item => 
      (item.serviceId === expressService.id || item.serviceName === expressService.name) && 
      item.weightBased === true
    );

    let updatedItems;
    
    if (existingItemIndex >= 0) {
      // Update existing item by adding the weight
      updatedItems = [...items];
      const existingItem = updatedItems[existingItemIndex];
      const newWeight = (existingItem.weight || 0) + 0.5;
      updatedItems[existingItemIndex] = {
        ...existingItem,
        weight: newWeight,
        subtotal: newWeight * existingItem.price
      };
    } else {
      // Add as new item
      const newOrderItem: OrderItem = {
        serviceId: expressService.id,
        serviceName: expressService.name,
        quantity: 1,
        price: 12000,
        weightBased: true,
        weight: 0.5,
        subtotal: 6000,
        service: expressService as Service
      };
      
      updatedItems = [...items, newOrderItem];
    }

    setItems(updatedItems);
    onSelectServices(updatedItems);
    toast.success('Layanan Cuci Express ditambahkan');
  };

  // Clear all items
  const handleClearItems = () => {
    setItems([]);
    onSelectServices([]);
    localStorage.removeItem('orderItems');
    toast.success('Semua layanan dihapus');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Pilih Layanan</CardTitle>
          <CardDescription>Pilih layanan dan tentukan jumlah atau berat</CardDescription>
        </div>
        {items.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleClearItems}>
            <Trash className="h-4 w-4 mr-2" />
            Hapus Semua
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {process.env.NODE_ENV !== 'production' && (
          <div className="flex flex-wrap gap-2 mb-4">
            <Button size="sm" variant="outline" onClick={addSampleGordyn}>
              + Cuci Gordyn (0.5kg)
            </Button>
            <Button size="sm" variant="outline" onClick={addSampleExpress}>
              + Cuci Express (0.5kg)
            </Button>
            <Button size="sm" variant="outline" onClick={() => {
              addSampleGordyn();
              addSampleGordyn();
              addSampleExpress();
            }}>
              + Tambah Semua Contoh
            </Button>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-5">
            <Label htmlFor="service-select">Pilih Layanan</Label>
            <Select
              value={newItem.serviceId}
              onValueChange={handleServiceChange}
            >
              <SelectTrigger id="service-select">
                <SelectValue placeholder="Pilih layanan..." />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name} - Rp {service.price.toLocaleString()} / {service.priceModel === ServicePriceModel.PER_KG ? 'kg' : 'item'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="md:col-span-3">
            <Label htmlFor="quantity-input">
              {newItem.weightBased ? 'Berat (kg)' : 'Jumlah'}
            </Label>
            <Input
              id="quantity-input"
              type="number"
              value={newItem.weightBased ? newItem.weight : newItem.quantity}
              onChange={handleQuantityChange}
              min={0}
              step={newItem.weightBased ? 0.1 : 1}
            />
          </div>
          
          <div className="md:col-span-4">
            <Button onClick={handleAddItem} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Tambah ke Pesanan
            </Button>
          </div>
        </div>
        
        {items.length > 0 ? (
          <div className="border rounded-md">
            <ScrollArea className="h-[250px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Layanan</TableHead>
                    <TableHead>Jumlah/Berat</TableHead>
                    <TableHead>Harga</TableHead>
                    <TableHead>Subtotal</TableHead>
                    <TableHead className="w-[100px]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {item.serviceName}
                        {item.weightBased && (
                          <Badge variant="outline" className="ml-2">
                            Per KG
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            className="w-20 h-8"
                            value={item.weightBased ? item.weight : item.quantity}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              if (!isNaN(value)) {
                                handleEditItem(index, value);
                              }
                            }}
                            min={0.1}
                            step={item.weightBased ? 0.1 : 1}
                          />
                          <span className="text-xs text-muted-foreground">
                            {item.weightBased ? 'kg' : 'item'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        Rp {item.price.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        Rp {item.subtotal.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleRemoveItem(index)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
            <div className="p-4 border-t flex justify-between items-center">
              <div className="font-medium">Total</div>
              <div className="font-medium">Rp {calculateTotal().toLocaleString()}</div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center border rounded-md">
            <p className="text-muted-foreground">
              Belum ada layanan yang dipilih. Silakan pilih layanan untuk ditambahkan ke pesanan.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 