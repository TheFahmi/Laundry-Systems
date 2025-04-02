'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { 
  ArrowLeft, 
  CalendarIcon, 
  Package, 
  User, 
  Save,
  PlusCircle,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// Mock services data
const services = [
  {
    id: '1',
    name: 'Cuci Reguler',
    price: 7000,
    priceModel: 'per_kg',
    processingTimeHours: 24,
    category: 'Cuci'
  },
  {
    id: '2',
    name: 'Cuci Setrika',
    price: 10000,
    priceModel: 'per_kg',
    processingTimeHours: 48,
    category: 'Cuci'
  },
  {
    id: '3',
    name: 'Cuci Express',
    price: 12000,
    priceModel: 'per_kg',
    processingTimeHours: 6,
    category: 'Premium'
  },
  {
    id: '4',
    name: 'Dry Cleaning',
    price: 20000,
    priceModel: 'per_piece',
    processingTimeHours: 72,
    category: 'Premium'
  },
  {
    id: '5',
    name: 'Setrika',
    price: 5000,
    priceModel: 'per_kg',
    processingTimeHours: 24,
    category: 'Setrika'
  },
];

export default function CreateOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateParam = searchParams.get('date');
  
  // Initialize with date from URL or current date
  const initialDate = dateParam ? new Date(dateParam) : new Date();
  
  // Form state
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: '',
  });
  
  const [orderDetails, setOrderDetails] = useState({
    pickupDate: initialDate,
    deliveryDate: initialDate,
    notes: '',
    isDelivery: false,
  });
  
  const [selectedServices, setSelectedServices] = useState<Array<{
    id: string;
    serviceId: string;
    name: string;
    quantity: number;
    price: number;
    priceModel: string;
    total: number;
  }>>([]);
  
  const [rememberMe, setRememberMe] = useState(false);
  
  // Load saved customer info from localStorage
  useEffect(() => {
    const savedCustomerInfo = localStorage.getItem('savedCustomerInfo');
    if (savedCustomerInfo) {
      try {
        const parsedInfo = JSON.parse(savedCustomerInfo);
        setCustomerInfo(parsedInfo);
        setRememberMe(true);
      } catch (error) {
        console.error('Error parsing saved customer info:', error);
      }
    }
  }, []);
  
  // Check if the provided date parameter is valid
  useEffect(() => {
    if (dateParam) {
      const parsedDate = new Date(dateParam);
      if (isNaN(parsedDate.getTime())) {
        // Invalid date, redirect to regular create page
        router.push('/work-order/create');
      }
    }
  }, [dateParam, router]);
  
  const addService = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;
    
    const newService = {
      id: Math.random().toString(36).substring(2, 9),
      serviceId: service.id,
      name: service.name,
      quantity: 1,
      price: service.price,
      priceModel: service.priceModel,
      total: service.price
    };
    
    setSelectedServices([...selectedServices, newService]);
  };
  
  const removeService = (id: string) => {
    setSelectedServices(selectedServices.filter(s => s.id !== id));
  };
  
  const updateServiceQuantity = (id: string, quantity: number) => {
    setSelectedServices(selectedServices.map(service => {
      if (service.id === id) {
        const newQuantity = Math.max(1, quantity);
        return {
          ...service,
          quantity: newQuantity,
          total: service.price * newQuantity
        };
      }
      return service;
    }));
  };
  
  const calculateTotal = () => {
    return selectedServices.reduce((total, service) => total + service.total, 0);
  };
  
  const handleSubmit = () => {
    // Save customer info to localStorage if rememberMe is checked
    if (rememberMe) {
      localStorage.setItem('savedCustomerInfo', JSON.stringify(customerInfo));
    } else {
      localStorage.removeItem('savedCustomerInfo');
    }
    
    // Here you would implement the API call to create the order
    // For now, we'll just show what would be submitted and redirect
    console.log({
      customer: customerInfo,
      order: orderDetails,
      services: selectedServices,
      total: calculateTotal()
    });
    
    // Redirect to the work orders list
    router.push('/work-order');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/work-order')}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Buat Work Order Baru</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <User className="mr-2 h-5 w-5" />
                Informasi Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer-name">Nama Customer</Label>
                  <Input 
                    id="customer-name" 
                    placeholder="Masukkan nama customer"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer-phone">Nomor Telepon</Label>
                  <Input 
                    id="customer-phone" 
                    placeholder="Masukkan nomor telepon"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer-address">Alamat</Label>
                <Textarea 
                  id="customer-address" 
                  placeholder="Masukkan alamat pengiriman (opsional)"
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox 
                  id="remember-me" 
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label
                  htmlFor="remember-me"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Ingat Saya
                </Label>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Package className="mr-2 h-5 w-5" />
                Layanan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="cuci" className="mb-6">
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="cuci">Cuci</TabsTrigger>
                  <TabsTrigger value="premium">Premium</TabsTrigger>
                  <TabsTrigger value="setrika">Setrika</TabsTrigger>
                </TabsList>
                {['cuci', 'premium', 'setrika'].map((category) => (
                  <TabsContent key={category} value={category} className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {services
                        .filter(service => service.category.toLowerCase() === category)
                        .map(service => (
                          <Button
                            key={service.id}
                            variant="outline"
                            className="justify-between h-auto py-3 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50"
                            onClick={() => addService(service.id)}
                          >
                            <div className="flex flex-col items-start">
                              <span className="font-medium">{service.name}</span>
                              <span className="text-xs text-gray-500">
                                {service.processingTimeHours <= 24 ? '1 hari' : 
                                 `${Math.ceil(service.processingTimeHours / 24)} hari`}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200 mr-2">
                                {service.priceModel === 'per_kg' ? 'Per Kg' : 'Per Item'}
                              </Badge>
                              <span className="text-sm font-medium">
                                Rp {service.price.toLocaleString()}
                              </span>
                              <PlusCircle className="ml-2 h-4 w-4 text-indigo-600" />
                            </div>
                          </Button>
                        ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
              
              {selectedServices.length > 0 ? (
                <div className="border rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Layanan</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedServices.map((service) => (
                        <tr key={service.id}>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{service.name}</div>
                            <div className="text-xs text-gray-500">
                              {service.priceModel === 'per_kg' ? 'Per Kg' : 'Per Item'}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            Rp {service.price.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center w-24">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7 rounded-full"
                                onClick={() => updateServiceQuantity(service.id, service.quantity - 1)}
                              >
                                -
                              </Button>
                              <span className="mx-2 w-8 text-center">{service.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7 rounded-full"
                                onClick={() => updateServiceQuantity(service.id, service.quantity + 1)}
                              >
                                +
                              </Button>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap font-medium">
                            Rp {service.total.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-700 h-7 w-7"
                              onClick={() => removeService(service.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 border rounded-md bg-gray-50">
                  <p className="text-gray-500">Belum ada layanan yang dipilih</p>
                  <p className="text-gray-400 text-sm mt-1">Pilih layanan dari tab di atas</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <CalendarIcon className="mr-2 h-5 w-5" />
                Jadwal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tanggal Pengambilan</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {orderDetails.pickupDate ? (
                          format(orderDetails.pickupDate, 'PPP', { locale: id })
                        ) : (
                          <span>Pilih tanggal</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={orderDetails.pickupDate}
                        onSelect={(date) => date && setOrderDetails({...orderDetails, pickupDate: date})}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label>Pengiriman</Label>
                  <Select
                    value={orderDetails.isDelivery ? "delivery" : "pickup"}
                    onValueChange={(value) => setOrderDetails({
                      ...orderDetails, 
                      isDelivery: value === "delivery"
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih metode pengambilan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pickup">Diambil Sendiri</SelectItem>
                      <SelectItem value="delivery">Antar ke Alamat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {orderDetails.isDelivery && (
                  <div className="space-y-2 md:col-span-2">
                    <Label>Tanggal Pengiriman</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {orderDetails.deliveryDate ? (
                            format(orderDetails.deliveryDate, 'PPP', { locale: id })
                          ) : (
                            <span>Pilih tanggal</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={orderDetails.deliveryDate}
                          onSelect={(date) => date && setOrderDetails({...orderDetails, deliveryDate: date})}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="order-notes">Catatan</Label>
                <Textarea 
                  id="order-notes" 
                  placeholder="Tambahkan catatan untuk order ini (opsional)"
                  value={orderDetails.notes}
                  onChange={(e) => setOrderDetails({...orderDetails, notes: e.target.value})}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <div className="sticky top-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ringkasan Order</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Customer</h3>
                  <p className="font-medium">
                    {customerInfo.name || 'Belum diisi'}
                  </p>
                </div>
                
                <div className="pt-2 border-t border-gray-100">
                  <h3 className="text-sm font-medium text-gray-500 mb-1.5">Layanan</h3>
                  {selectedServices.length > 0 ? (
                    <ul className="space-y-1">
                      {selectedServices.map(service => (
                        <li key={service.id} className="flex justify-between text-sm">
                          <span>{service.name} x{service.quantity}</span>
                          <span>Rp {service.total.toLocaleString()}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-400 text-sm">Belum ada layanan dipilih</p>
                  )}
                </div>
                
                <div className="pt-2 border-t border-gray-100">
                  <h3 className="text-sm font-medium text-gray-500 mb-1.5">Jadwal</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Pengambilan</span>
                      <span>{format(orderDetails.pickupDate, 'dd MMM yyyy', { locale: id })}</span>
                    </div>
                    {orderDetails.isDelivery && (
                      <div className="flex justify-between">
                        <span>Pengiriman</span>
                        <span>{format(orderDetails.deliveryDate, 'dd MMM yyyy', { locale: id })}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex justify-between font-medium text-lg">
                    <span>Total</span>
                    <span>Rp {calculateTotal().toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  disabled={selectedServices.length === 0 || !customerInfo.name}
                  onClick={handleSubmit}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Simpan Order
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 