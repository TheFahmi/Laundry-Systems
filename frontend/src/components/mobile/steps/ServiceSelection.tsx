'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, Plus, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface Service {
  id: string;
  name: string;
  description?: string;
  priceModel: 'per_kg' | 'per_piece' | 'flat_rate';
  price: string | number;
  category?: string;
}

interface OrderItem {
  serviceId: string;
  serviceName: string;
  price: number;
  quantity: number;
  weight?: number;
  subtotal: number;
  notes?: string;
  weightBased?: boolean;
  priceModel?: string;
}

interface ServiceSelectionProps {
  orderData: any;
  updateOrderData: (data: any) => void;
}

export default function ServiceSelection({ orderData, updateOrderData }: ServiceSelectionProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [items, setItems] = useState<OrderItem[]>(orderData.items || []);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // New item form
  const [newItem, setNewItem] = useState<{
    serviceId: string | null;
    quantity: number;
    weight: number;
    notes: string;
  }>({
    serviceId: null,
    quantity: 1,
    weight: 0.5,
    notes: '',
  });

  // Fetch services on component mount
  useEffect(() => {
    fetchServices();
  }, []);

  // Update order data when items change
  useEffect(() => {
    const totalAmount = calculateTotal();
    const totalWeight = calculateTotalWeight();
    
    updateOrderData({
      items,
      totalAmount,
      totalWeight
    });
  }, [items]);

  // Extract categories from services
  useEffect(() => {
    if (services.length > 0) {
      const uniqueCategories = Array.from(
        new Set(services.map((service) => service.category || 'Uncategorized'))
      );
      setCategories(uniqueCategories);
    }
  }, [services]);

  // Fetch services function
  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/services', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }
      
      const data = await response.json();
      console.log('Services data received:', data);
      
      // Try different paths to extract services from the response
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
    } finally {
      setLoading(false);
    }
  };

  // Calculate total for all items
  const calculateTotal = () => {
    const total = items.reduce((total, item) => {
      // Ensure subtotal is a valid number
      const itemSubtotal = Number(item.subtotal) || 0;
      return total + itemSubtotal;
    }, 0);
    
    // Make sure the result is a valid number
    return isNaN(total) ? 0 : total;
  };

  // Calculate total weight for weight-based items
  const calculateTotalWeight = () => {
    return items.reduce((total, item) => {
      if (item.weightBased && item.weight) {
        return total + item.weight;
      }
      return total;
    }, 0);
  };

  // Add new item to order
  const handleAddItem = () => {
    if (!newItem.serviceId) return;
    
    const service = services.find(s => s.id === newItem.serviceId);
    if (!service) return;
    
    const isWeightBased = service.priceModel === 'per_kg';
    
    // Ensure price is a valid number
    const price = Number(service.price) || 0;
    const quantity = Number(newItem.quantity) || 1;
    const weight = Number(newItem.weight) || 0.5;
    
    // Calculate subtotal based on service price model
    let subtotal = 0;
    if (isWeightBased) {
      subtotal = price * weight;
    } else {
      subtotal = price * quantity;
    }
    
    // Ensure subtotal is a valid number
    if (isNaN(subtotal)) {
      console.error('Invalid subtotal calculation:', { 
        price, 
        quantity, 
        weight, 
        isWeightBased 
      });
      subtotal = 0;
    }
    
    const item: OrderItem = {
      serviceId: service.id,
      serviceName: service.name,
      price: price,
      quantity: isWeightBased ? 1 : quantity,
      weight: isWeightBased ? weight : undefined,
      subtotal,
      notes: newItem.notes,
      weightBased: isWeightBased,
      priceModel: service.priceModel
    };
    
    console.log('Adding item to order:', item);
    setItems([...items, item]);
    
    // Reset form
    setNewItem({
      serviceId: null,
      quantity: 1,
      weight: 0.5,
      notes: '',
    });
  };

  // Remove item from order
  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  // Filtered services based on active category
  const getFilteredServices = () => {
    if (!Array.isArray(services)) {
      console.error('Services is not an array:', services);
      return [];
    }
    
    return activeCategory === 'all'
      ? services
      : services.filter(service => (service.category || 'Uncategorized') === activeCategory);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Pilih Layanan</h2>
      
      {/* Service Categories */}
      <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory}>
        <ScrollArea className="w-full">
          <TabsList className="w-auto inline-flex mb-2 h-9">
            <TabsTrigger value="all">Semua</TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger key={category} value={category}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </ScrollArea>
        
        {/* Service Selection Form */}
        <Card>
          <CardContent className="p-3">
            <div className="space-y-3">
              <div>
                <Label htmlFor="service">Layanan</Label>
                <Select
                  value={newItem.serviceId || ''}
                  onValueChange={(value) => setNewItem({ ...newItem, serviceId: value })}
                >
                  <SelectTrigger id="service">
                    <SelectValue placeholder="Pilih layanan" />
                  </SelectTrigger>
                  <SelectContent>
                    {loading ? (
                      <div className="flex justify-center p-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    ) : Array.isArray(getFilteredServices()) && getFilteredServices().length > 0 ? (
                      getFilteredServices().map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name} - Rp {Number(service.price).toLocaleString('id-ID') || 0}
                          /
                          {service.priceModel === 'per_kg' ? 'kg' : 
                           service.priceModel === 'per_piece' ? 'pcs' : 'flat'}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-center text-muted-foreground">
                        Tidak ada layanan ditemukan
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              {newItem.serviceId && (() => {
                const service = services.find(s => s.id === newItem.serviceId);
                const isWeightBased = service?.priceModel === 'per_kg';
                
                return (
                  <>
                    {isWeightBased ? (
                      <div>
                        <Label htmlFor="weight">Berat (kg)</Label>
                        <Input
                          id="weight"
                          type="number"
                          min="0.1"
                          step="0.1"
                          value={newItem.weight}
                          onChange={(e) => setNewItem({ ...newItem, weight: Number(e.target.value) })}
                        />
                      </div>
                    ) : (
                      <div>
                        <Label htmlFor="quantity">Jumlah</Label>
                        <Input
                          id="quantity"
                          type="number"
                          min="1"
                          value={newItem.quantity}
                          onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                        />
                      </div>
                    )}
                    
                    <div>
                      <Label htmlFor="notes">Catatan</Label>
                      <Textarea
                        id="notes"
                        placeholder="Catatan tambahan..."
                        value={newItem.notes}
                        onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                      />
                    </div>
                    
                    <Button onClick={handleAddItem} className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Tambah ke Pesanan
                    </Button>
                  </>
                );
              })()}
            </div>
          </CardContent>
        </Card>
      </Tabs>
      
      {/* Selected Items */}
      <div className="mt-4">
        <h3 className="font-medium mb-2">Item Dipilih</h3>
        {items.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            Belum ada item dipilih
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="border rounded-md p-3">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">{item.serviceName}</p>
                    {item.weightBased ? (
                      <p className="text-sm text-muted-foreground">
                        {item.weight} kg x Rp {Number(item.price).toLocaleString('id-ID') || 0}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} x Rp {Number(item.price).toLocaleString('id-ID') || 0}
                      </p>
                    )}
                    {item.notes && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Catatan: {item.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="font-medium">Rp {Number(item.subtotal).toLocaleString('id-ID') || 0}</p>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleRemoveItem(index)}
                      className="h-8 w-8 mt-1"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Total section */}
            <div className="border-t pt-2 mt-4 flex justify-between font-medium">
              <span>Total:</span>
              <span>Rp {calculateTotal().toLocaleString('id-ID')}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 