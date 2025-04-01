'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createAuthHeaders } from '@/lib/api-utils';
import { Service, ServicePriceModel, priceModelLabels } from '@/types/service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Trash, ShoppingCart, Search, Scale, Package, Filter, Edit, XCircle, Banknote } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Constants for limiting items displayed
const MAX_TOTAL_ITEMS = 10;
const MAX_DISPLAY_ITEMS = 5;

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
  disabled?: boolean;
}

export default function ServiceSelect({ onSelectServices, selectedItems = [], disabled }: ServiceSelectProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [items, setItems] = useState<OrderItem[]>(() => {
    // Initialize with selectedItems if provided
    return selectedItems.length > 0 ? selectedItems : [];
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Add missing state variables
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPriceModel, setSelectedPriceModel] = useState('');
  
  // Define categoryLabels object
  const categoryLabels = {
    cleaning: 'Cleaning',
    ironing: 'Ironing',
    express: 'Express',
    special: 'Special',
    other: 'Other'
  };
  
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

  // Add state for the edit dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<OrderItem | null>(null);
  const [editValue, setEditValue] = useState<number>(0);

  // Fetch services when component mounts
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/services', {
          headers: createAuthHeaders(),
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch services');
        }
        
        const data = await response.json();
        let services = [];
        
        if (data.data && Array.isArray(data.data.items)) {
          services = data.data.items;
        } else if (data.data) {
          services = data.data;
        } else if (Array.isArray(data)) {
          services = data;
        }
        
        // Limit services to MAX_TOTAL_ITEMS
        setServices(services.slice(0, MAX_TOTAL_ITEMS));
      } catch (error) {
        console.error('Error fetching services:', error);
        setError('Failed to load services. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchServices();
  }, []);

  // Send updated items to parent when items change
  useEffect(() => {
    onSelectServices(items);
  }, [items]);

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

  // Remove item from selection
  const handleRemoveItem = (item: OrderItem) => {
    // Find the index of the item to remove
    const index = items.findIndex(i => i.serviceId === item.serviceId);
    
    if (index === -1) return;
    
    // Create a copy of the items array without the item at the specified index
    const updatedItems = [...items.slice(0, index), ...items.slice(index + 1)];
    
    // Update the state
    setItems(updatedItems);
    
    // Call the callback to update the parent component
    onSelectServices(updatedItems);
    
    toast.success(`${item.serviceName} telah dihapus dari pesanan`);
  };

  // Edit item quantity/weight - open dialog
  const openEditDialog = (item: OrderItem) => {
    setItemToEdit(item);
    setEditValue(item.weightBased ? item.weight || 0 : item.quantity);
    setEditDialogOpen(true);
  };

  // Handle edit confirm
  const handleEditConfirm = () => {
    if (!itemToEdit) return;
    
    if (editValue <= 0) {
      handleRemoveItem(itemToEdit);
    } else {
      // Create a copy of the items array
      const updatedItems = [...items];
      
      // Find the item to edit
      const index = updatedItems.findIndex(
        i => i.serviceId === itemToEdit.serviceId
      );
      
      if (index !== -1) {
        // Create a copy of the item to update
        const updatedItem = { ...updatedItems[index] };
        
        // Update quantity or weight based on the item type
        if (updatedItem.weightBased) {
          updatedItem.weight = editValue;
        } else {
          updatedItem.quantity = editValue;
        }
        
        // Recalculate subtotal
        updatedItem.subtotal = updatedItem.price * (updatedItem.weightBased ? updatedItem.weight! : updatedItem.quantity);
        
        // Update the item in the array
        updatedItems[index] = updatedItem;
        
        // Update the state
        setItems(updatedItems);
        
        // Call the callback to update the parent component
        onSelectServices(updatedItems);
        
        toast.success(`${itemToEdit.serviceName} telah diperbarui`);
      }
    }
    
    // Close the dialog
    setEditDialogOpen(false);
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
    <div className={disabled ? 'opacity-60 pointer-events-none' : ''}>
      <Card className="border border-blue-100 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b border-blue-100">
          <div>
            <CardTitle className="flex items-center text-blue-700">
              <ShoppingCart className="h-5 w-5 mr-2 text-blue-500" />
              Pilih Layanan
            </CardTitle>
            <CardDescription>Pilih layanan dan tentukan jumlah atau berat</CardDescription>
          </div>
          {items.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleClearItems} className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer">
              <Trash className="h-4 w-4 mr-2" />
              Hapus Semua
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              {/* Search input and category filters */}
              <div className="relative mb-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-blue-500" />
                <Input
                  type="text"
                  placeholder="Cari layanan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 border-blue-200 focus-visible:ring-blue-400"
                  disabled={disabled}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.values(categoryLabels).map((category) => (
                  <Badge
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    className={`cursor-pointer ${
                      selectedCategory === category 
                        ? 'bg-blue-500 hover:bg-blue-600' 
                        : 'border-blue-200 text-blue-700 hover:bg-blue-50'
                    }`}
                    onClick={() => setSelectedCategory(prev => prev === category ? '' : category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              {/* Price model filter */}
              <Label className="mb-2 block flex items-center text-blue-700 text-sm">
                <Filter className="h-4 w-4 mr-1 text-blue-500" />
                Filter berdasarkan
              </Label>
              <div className="flex flex-wrap gap-2">
                {Object.values(priceModelLabels).map((model) => (
                  <Badge
                    key={model}
                    variant={selectedPriceModel === model ? "default" : "outline"}
                    className={`cursor-pointer ${
                      selectedPriceModel === model 
                        ? 'bg-indigo-500 hover:bg-indigo-600' 
                        : 'border-indigo-200 text-indigo-700 hover:bg-indigo-50'
                    }`}
                    onClick={() => setSelectedPriceModel(prev => prev === model ? '' : model)}
                  >
                    {model === 'Per Kilogram' ? (
                      <span className="flex items-center">
                        <Scale className="h-3 w-3 mr-1" />
                        {model}
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Package className="h-3 w-3 mr-1" />
                        {model}
                      </span>
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-5">
              <Label htmlFor="service-select" className="flex items-center text-blue-700 text-sm">
                <ShoppingCart className="h-4 w-4 mr-1 text-blue-500" />
                Pilih Layanan
              </Label>
              <Select
                value={newItem.serviceId}
                onValueChange={handleServiceChange}
              >
                <SelectTrigger id="service-select" className="border-blue-200 focus:ring-blue-400">
                  <SelectValue placeholder="Pilih layanan..." />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-auto">
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      <span className="flex items-center">
                        {service.priceModel === ServicePriceModel.PER_KG ? (
                          <Scale className="h-3.5 w-3.5 mr-1.5 text-purple-500" />
                        ) : (
                          <Package className="h-3.5 w-3.5 mr-1.5 text-indigo-500" />
                        )}
                        {service.name} - Rp {service.price.toLocaleString()} / {service.priceModel === ServicePriceModel.PER_KG ? 'kg' : 'item'}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="md:col-span-3">
              <Label htmlFor="quantity-input" className="flex items-center text-blue-700 text-sm">
                {newItem.weightBased ? (
                  <>
                    <Scale className="h-4 w-4 mr-1 text-purple-500" />
                    Berat (kg)
                  </>
                ) : (
                  <>
                    <Package className="h-4 w-4 mr-1 text-indigo-500" />
                    Jumlah
                  </>
                )}
              </Label>
              <Input
                id="quantity-input"
                type="number"
                value={newItem.weightBased ? newItem.weight : newItem.quantity}
                onChange={handleQuantityChange}
                min={0}
                step={newItem.weightBased ? 0.1 : 1}
                className="border-blue-200 focus-visible:ring-blue-400 [&::-webkit-inner-spin-button]:cursor-pointer [&::-webkit-outer-spin-button]:cursor-pointer"
              />
            </div>
            
            <div className="md:col-span-4">
              <Button 
                onClick={handleAddItem} 
                className="w-full bg-blue-500 hover:bg-blue-600 cursor-pointer"
              >
                <Plus className="mr-2 h-4 w-4" />
                Tambah ke Pesanan
              </Button>
            </div>
          </div>
          
          {items.length > 0 ? (
            <div className="border border-blue-100 rounded-md">
              <ScrollArea className="h-[250px]">
                <Table>
                  <TableHeader className="bg-blue-50">
                    <TableRow>
                      <TableHead className="text-blue-700">Layanan</TableHead>
                      <TableHead className="text-blue-700">Jumlah/Berat</TableHead>
                      <TableHead className="text-blue-700">Harga</TableHead>
                      <TableHead className="text-blue-700">Subtotal</TableHead>
                      <TableHead className="w-[100px] text-blue-700">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, index) => (
                      <TableRow key={index} className="hover:bg-blue-50/50">
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            {item.weightBased ? (
                              <Scale className="h-4 w-4 mr-2 text-purple-500" />
                            ) : (
                              <Package className="h-4 w-4 mr-2 text-indigo-500" />
                            )}
                            {item.serviceName}
                          </div>
                        </TableCell>
                        <TableCell>
                          {item.weightBased ? (
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                              {item.weight} kg
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                              {item.quantity} item
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center">
                            <Banknote className="h-3.5 w-3.5 mr-1 text-green-500" />
                            Rp {item.price.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-blue-700">
                          Rp {item.subtotal.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <TooltipProvider delayDuration={300}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon" 
                                    className="h-8 w-8 text-amber-500 hover:text-amber-600 hover:bg-amber-50 cursor-pointer"
                                    onClick={() => openEditDialog(item)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="left" className="bg-amber-500 text-white border-0">
                                  <p>Edit jumlah/berat</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            
                            <TooltipProvider delayDuration={300}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                                    onClick={() => handleRemoveItem(item)}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="bg-red-500 text-white border-0">
                                  <p>Hapus item</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
              <div className="p-4 border-t flex justify-end">
                <div className="bg-blue-50 px-4 py-2 rounded-md border border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-blue-700 mr-6">Total:</span>
                    <span className="font-bold text-lg text-blue-700">Rp {calculateTotal().toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 border border-dashed border-blue-200 rounded-md bg-blue-50/50">
              <ShoppingCart className="mx-auto h-12 w-12 text-blue-300 opacity-70" />
              <p className="mt-2 text-blue-600">Belum ada layanan yang dipilih</p>
              <p className="text-sm text-blue-500 mt-1">Pilih layanan dari daftar di atas</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Custom styling for cursor-pointer on number inputs and dialog close buttons */}
      <style jsx global>{`
        /* Dialog close button */
        [role="dialog"] button {
          cursor: pointer !important;
        }
        
        /* Number input up/down arrows */
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          cursor: pointer !important;
        }
      `}</style>
      
      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center text-blue-700">
              <Edit className="h-5 w-5 mr-2 text-blue-500" /> 
              Edit {itemToEdit?.serviceName}
            </DialogTitle>
            <DialogDescription>
              {itemToEdit?.weightBased 
                ? "Perbarui berat dalam kilogram (kg)" 
                : "Perbarui jumlah item"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-value" className="text-right flex justify-end items-center">
                {itemToEdit?.weightBased ? (
                  <>
                    <Scale className="h-4 w-4 mr-1 text-purple-500" />
                    Berat
                  </>
                ) : (
                  <>
                    <Package className="h-4 w-4 mr-1 text-indigo-500" />
                    Jumlah
                  </>
                )}
              </Label>
              <Input
                id="edit-value"
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(parseFloat(e.target.value) || 0)}
                min={0.1}
                step={itemToEdit?.weightBased ? 0.1 : 1}
                className="col-span-3 border-blue-200 focus-visible:ring-blue-400 [&::-webkit-inner-spin-button]:cursor-pointer [&::-webkit-outer-spin-button]:cursor-pointer"
                autoFocus
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setEditDialogOpen(false)}
              className="border-gray-200 cursor-pointer"
            >
              Batal
            </Button>
            <Button onClick={handleEditConfirm} className="bg-blue-500 hover:bg-blue-600 cursor-pointer">
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 