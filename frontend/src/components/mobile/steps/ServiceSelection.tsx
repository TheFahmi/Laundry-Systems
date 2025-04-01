'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Plus, 
  Minus, 
  FileText, 
  ShoppingCart, 
  Tag, 
  Package, 
  Filter, 
  Layers, 
  Shirt,
  Banknote,
  Scale,
  HashIcon
} from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// Add service price model enum matching the desktop component
enum ServicePriceModel {
  PER_UNIT = 'per_unit',
  PER_KG = 'per_kg'
}

interface Service {
  id: string;
  name: string;
  price: number;
  description?: string;
  category?: string;
  priceModel?: ServicePriceModel;
}

interface OrderItem {
  serviceId: string;
  serviceName: string;
  price: number;
  quantity: number;
  weightBased?: boolean;
  weight?: number;
  subtotal: number;
  serviceType?: string;
}

interface ServiceSelectionProps {
  orderData: any;
  updateOrderData: (data: any) => void;
}

function ServiceSelection({ orderData, updateOrderData }: ServiceSelectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [items, setItems] = useState<OrderItem[]>(orderData.items || []);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [quantityValue, setQuantityValue] = useState(1);
  const [weightValue, setWeightValue] = useState(0.5);

  // Fetch services on component mount
  useEffect(() => {
    fetchServices();
  }, []);

  // Update order data when items change
  useEffect(() => {
    // Avoid unnecessary updates by calculating total only when needed
    const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
    
    // Only update if data actually changed
    if (totalAmount !== orderData.totalAmount || 
        items !== orderData.items) {
      updateOrderData({ 
        items, 
        totalAmount 
      });
    }
  }, [items, updateOrderData, orderData.totalAmount, orderData.items]);

  // Fetch services function
  const fetchServices = async (query: string = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) {
        params.append('search', query);
      }
      
      const response = await fetch(`/api/services?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }
      
      const data = await response.json();
      
      // Try different paths to access the service list
      let serviceList = [];
      if (data.data?.items && Array.isArray(data.data.items)) {
        serviceList = data.data.items;
      } else if (data.data?.data?.items && Array.isArray(data.data.data.items)) {
        serviceList = data.data.data.items;
      } else if (data.items && Array.isArray(data.items)) {
        serviceList = data.items;
      } else if (Array.isArray(data)) {
        serviceList = data;
      } else if (data.data && Array.isArray(data.data)) {
        serviceList = data.data;
      } else {
        console.error('Unexpected service data format:', data);
        serviceList = [];
      }
      
      setServices(serviceList);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Gagal mengambil data layanan');
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = () => {
    fetchServices(searchQuery);
  };

  // Get unique categories from services
  const categories = ['all', ...new Set(services.map(service => service.category || 'uncategorized'))];

  // Filter services by category
  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(service => (service.category || 'uncategorized') === selectedCategory);

  // Open detail dialog for adding an item
  const openAddDialog = (service: Service) => {
    setSelectedService(service);
    const isWeightBased = service.priceModel === ServicePriceModel.PER_KG;
    setQuantityValue(1);
    setWeightValue(0.5);
    setIsDetailDialogOpen(true);
  };

  // Add item to the order with weight or quantity
  const addItemWithDetail = () => {
    if (!selectedService) return;
    
    const isWeightBased = selectedService.priceModel === ServicePriceModel.PER_KG;
    const existingItemIndex = items.findIndex(item => 
      item.serviceId === selectedService.id && 
      !!item.weightBased === isWeightBased
    );
    
    const quantity = isWeightBased ? 1 : quantityValue;
    const weight = isWeightBased ? weightValue : undefined;
    const subtotal = isWeightBased 
      ? weight! * selectedService.price 
      : quantity * selectedService.price;
    
    let newItems;
    if (existingItemIndex !== -1) {
      // Update existing item
      newItems = [...items];
      if (isWeightBased) {
        // For weight-based, update the weight
        const newWeight = (newItems[existingItemIndex].weight || 0) + weight!;
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          weight: newWeight,
          subtotal: newWeight * selectedService.price
        };
      } else {
        // For quantity-based, update the quantity
        const newQuantity = newItems[existingItemIndex].quantity + quantity;
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newQuantity,
          subtotal: newQuantity * selectedService.price
        };
      }
    } else {
      // Add new item
      const newItem: OrderItem = {
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        price: selectedService.price,
        quantity: quantity,
        weightBased: isWeightBased,
        weight: weight,
        subtotal: subtotal,
        serviceType: selectedService.category
      };
      newItems = [...items, newItem];
    }
    
    // Batch state updates to reduce renders
    setItems(newItems);
    setIsDetailDialogOpen(false);
  };

  // Remove item from the order
  const removeItem = (index: number) => {
    if (index < 0 || index >= items.length) return;
    setItems(currentItems => currentItems.filter((_, i) => i !== index));
  };

  // Edit an item quantity or weight
  const editItem = (index: number) => {
    if (index < 0 || index >= items.length) return;
    
    const item = items[index];
    if (!item) return;
    
    setSelectedService({
      id: item.serviceId,
      name: item.serviceName,
      price: item.price,
      category: item.serviceType,
      priceModel: item.weightBased ? ServicePriceModel.PER_KG : ServicePriceModel.PER_UNIT
    });
    
    if (item.weightBased) {
      setWeightValue(item.weight || 0.5);
    } else {
      setQuantityValue(item.quantity);
    }
    
    setIsDetailDialogOpen(true);
  };

  // Category icon mapping
  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      'all': <Layers className="h-4 w-4 text-blue-500" />,
      'uncategorized': <Package className="h-4 w-4 text-gray-400" />,
      'cuci': <Shirt className="h-4 w-4 text-blue-500" />,
      'setrika': <Shirt className="h-4 w-4 text-amber-500" />,
      'laundry': <Package className="h-4 w-4 text-green-500" />,
      'dry clean': <Shirt className="h-4 w-4 text-purple-500" />,
      'express': <Package className="h-4 w-4 text-red-500" />
    };
    
    return icons[category.toLowerCase()] || <Tag className="h-4 w-4 text-gray-500" />;
  };

  // Format price with price model
  const formatServicePrice = (service: Service) => {
    const isWeightBased = service.priceModel === ServicePriceModel.PER_KG;
    return `Rp ${service.price.toLocaleString('id-ID')}${isWeightBased ? '/kg' : '/item'}`;
  };

  return (
    <div className="space-y-4">
      {/* Search box */}
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-blue-500" />
          <Input
            placeholder="Cari layanan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 border-blue-200 focus-visible:ring-blue-300"
          />
        </div>
        <Button onClick={handleSearch} size="sm" className="bg-blue-500 hover:bg-blue-600">
          Cari
        </Button>
      </div>

      {/* Category tabs */}
      <Tabs defaultValue="all" value={selectedCategory} onValueChange={setSelectedCategory}>
        <div className="w-full overflow-x-auto pb-2">
          <TabsList className="h-9 w-max bg-gray-100">
            {categories.map(category => (
              <TabsTrigger
                key={category}
                value={category}
                className="h-8 capitalize data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                <div className="flex items-center gap-1.5">
                  {getCategoryIcon(category)}
                  {category === 'all' ? 'Semua' : category}
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </Tabs>

      {/* Services list */}
      <div className="space-y-2">
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="flex items-center gap-2 text-blue-500">
              <div className="animate-spin">⟳</div>
              <p>Memuat layanan...</p>
            </div>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground flex items-center justify-center gap-2">
              <Package className="h-5 w-5 text-gray-400" />
              Tidak ada layanan ditemukan
            </p>
          </div>
        ) : (
          <div className="h-[300px] overflow-y-auto">
            <div className="space-y-2 pr-4">
              {filteredServices.map(service => {
                const category = service.category?.toLowerCase() || 'uncategorized';
                const hasDescription = !!service.description;
                const isWeightBased = service.priceModel === ServicePriceModel.PER_KG;
                
                // Determine color based on category
                const getBgColor = () => {
                  const colors: Record<string, string> = {
                    'cuci': 'bg-blue-50 border-blue-200',
                    'setrika': 'bg-amber-50 border-amber-200',
                    'laundry': 'bg-green-50 border-green-200',
                    'dry clean': 'bg-purple-50 border-purple-200',
                    'express': 'bg-red-50 border-red-200',
                    'uncategorized': 'bg-gray-50 border-gray-200'
                  };
                  
                  return colors[category] || 'bg-gray-50 border-gray-200';
                };
                
                return (
                  <Card key={service.id} className={`overflow-hidden ${getBgColor()}`}>
                    <CardContent className="p-3">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5">
                            {getCategoryIcon(category)}
                            <h3 className="font-medium text-sm">{service.name}</h3>
                            {isWeightBased ? (
                              <Badge variant="outline" className="ml-1 text-xs bg-purple-50 text-purple-700 border-purple-200">
                                <Scale className="h-3 w-3 mr-1" />
                                KG
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="ml-1 text-xs bg-indigo-50 text-indigo-700 border-indigo-200">
                                <HashIcon className="h-3 w-3 mr-1" />
                                Item
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground flex items-center mt-1">
                            <Banknote className="h-3.5 w-3.5 mr-1 text-green-500" />
                            {formatServicePrice(service)}
                          </p>
                          {hasDescription && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1 flex items-center">
                              <FileText className="h-3 w-3 mr-1 text-gray-400" />
                              {service.description}
                            </p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          className="h-8 text-sm bg-green-500 hover:bg-green-600"
                          onClick={() => openAddDialog(service)}
                        >
                          <Plus className="h-3.5 w-3.5 mr-1" />
                          {isWeightBased ? 'Tambah (kg)' : 'Tambah'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Selected services summary */}
      {items.length > 0 && (
        <div className="mt-4 border border-blue-200 rounded-md bg-blue-50 p-3">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart className="h-4 w-4 text-blue-500" />
            <h3 className="font-medium">Layanan Dipilih</h3>
          </div>
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex justify-between items-center bg-white p-2 rounded-md border border-blue-100">
                <div>
                  <p className="text-sm font-medium">
                    {item.serviceName}
                    {item.weightBased && (
                      <Badge variant="outline" className="ml-1 text-xs bg-purple-50 text-purple-700 border-purple-200">
                        <Scale className="h-3 w-3 mr-1" />
                        {item.weight} kg
                      </Badge>
                    )}
                    {!item.weightBased && (
                      <Badge variant="outline" className="ml-1 text-xs bg-indigo-50 text-indigo-700 border-indigo-200">
                        <HashIcon className="h-3 w-3 mr-1" />
                        {item.quantity} item
                      </Badge>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    @ Rp {item.price.toLocaleString('id-ID')}{item.weightBased ? '/kg' : '/item'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <p className="font-medium text-green-700">
                    Rp {item.subtotal.toLocaleString('id-ID')}
                  </p>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 border-amber-200 hover:bg-amber-50 text-amber-500"
                    onClick={() => editItem(index)}
                  >
                    <FileText className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 border-red-200 hover:bg-red-50 text-red-500"
                    onClick={() => removeItem(index)}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
            <Separator className="my-2 bg-blue-200" />
            <div className="flex justify-between">
              <p className="font-medium">Total</p>
              <p className="font-bold text-blue-700">
                Rp {items.reduce((sum, item) => sum + item.subtotal, 0).toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add item dialog */}
      <Dialog 
        open={isDetailDialogOpen} 
        onOpenChange={(open) => {
          // Only update state if it's actually changing
          if (open !== isDetailDialogOpen) {
            setIsDetailDialogOpen(open);
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedService?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {selectedService && selectedService.priceModel === ServicePriceModel.PER_KG ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Berat (kg):</label>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 text-sm"
                      onClick={() => setWeightValue(Math.max(0.5, weightValue - 0.5))}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Input
                      type="number"
                      value={weightValue}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val) && val >= 0.1) {
                          setWeightValue(val);
                        }
                      }}
                      step="0.1"
                      min="0.1"
                      max="100"
                      className="w-20 h-8 text-center"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 text-sm"
                      onClick={() => setWeightValue(weightValue + 0.5)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Harga per kg: Rp {selectedService.price.toLocaleString('id-ID')}
                </p>
                <p className="text-sm font-medium">
                  Subtotal: Rp {(weightValue * selectedService.price).toLocaleString('id-ID')}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Jumlah:</label>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 text-sm"
                      onClick={() => setQuantityValue(Math.max(1, quantityValue - 1))}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Input
                      type="number"
                      value={quantityValue}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val) && val >= 1) {
                          setQuantityValue(val);
                        }
                      }}
                      min="1"
                      max="100"
                      className="w-16 h-8 text-center"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 text-sm"
                      onClick={() => setQuantityValue(quantityValue + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Harga per item: Rp {selectedService?.price.toLocaleString('id-ID')}
                </p>
                <p className="text-sm font-medium">
                  Subtotal: Rp {((selectedService?.price || 0) * quantityValue).toLocaleString('id-ID')}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>Batal</Button>
            <Button onClick={addItemWithDetail} className="bg-green-500 hover:bg-green-600">
              Tambahkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Export the component wrapped in React.memo
export default React.memo(ServiceSelection); 