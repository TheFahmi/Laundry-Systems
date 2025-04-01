'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, User, X, Phone, Mail, Home, UserPlus, UserCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Avatar } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import CustomerFormSheet from '../CustomerFormSheet';

interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

interface CustomerSelectionProps {
  orderData: any;
  updateOrderData: (data: any) => void;
}

export default function CustomerSelection({ orderData, updateOrderData }: CustomerSelectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  
  // State for new customer sheet
  const [showCustomerFormSheet, setShowCustomerFormSheet] = useState(false);

  // Initialize selectedCustomerId from orderData only once on mount
  useEffect(() => {
    if (orderData.customerId && !selectedCustomerId) {
      setSelectedCustomerId(orderData.customerId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this only runs once on mount

  // Fetch customers on component mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Fetch customers function
  const fetchCustomers = async (query: string = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) {
        params.append('search', query);
      }
      
      const response = await fetch(`/api/customers?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      
      const data = await response.json();
      console.log('Customer data received:', data);
      
      // Try different paths to access the customer list
      let customerList = [];
      if (data.data?.items && Array.isArray(data.data.items)) {
        customerList = data.data.items;
      } else if (data.data?.data?.items && Array.isArray(data.data.data.items)) {
        customerList = data.data.data.items;
      } else if (data.items && Array.isArray(data.items)) {
        customerList = data.items;
      } else if (Array.isArray(data)) {
        customerList = data;
      } else if (data.data && Array.isArray(data.data)) {
        customerList = data.data;
      } else {
        console.error('Unexpected customer data format:', data);
        customerList = [];
      }
      
      setCustomers(customerList);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Gagal mengambil data pelanggan');
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = () => {
    fetchCustomers(searchQuery);
  };

  // Handle customer selection
  const handleSelectCustomer = (customerId: string) => {
    // Skip if already selected
    if (customerId === selectedCustomerId) return;
    
    setSelectedCustomerId(customerId);
    const selectedCustomer = customers.find(c => c.id === customerId);
    if (selectedCustomer) {
      updateOrderData({ 
        customer: selectedCustomer,
        customerId: customerId
      });
    }
  };
  
  // Handle successful customer creation
  const handleCustomerCreated = (createdCustomer: Customer) => {
    // Update customer list
    setCustomers(prev => [createdCustomer, ...prev]);
    
    // Select the new customer - set state only once
    setSelectedCustomerId(createdCustomer.id);
    
    // Update order data separately to avoid sync issues
    setTimeout(() => {
      updateOrderData({ 
        customer: createdCustomer,
        customerId: createdCustomer.id 
      });
    }, 0);
    
    toast.success('Pelanggan baru berhasil dibuat');
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Pilih Pelanggan</h2>
      
      {/* Search box */}
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-blue-500" />
          <Input
            type="text"
            placeholder="Cari pelanggan..."
            className="pl-8 border-blue-200 focus-visible:ring-blue-300"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Button variant="outline" className="border-blue-200 hover:bg-blue-50" onClick={handleSearch}>
          Cari
        </Button>
      </div>
      
      {/* New Customer button */}
      <Button 
        variant="outline" 
        className="w-full border-green-200 bg-green-50 hover:bg-green-100 text-green-700" 
        onClick={() => setShowCustomerFormSheet(true)}
      >
        <UserPlus className="mr-2 h-4 w-4 text-green-600" />
        Pelanggan Baru
      </Button>
      
      <Separator className="bg-gray-200" />
      
      {/* Customer list */}
      {loading ? (
        <div className="flex justify-center py-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
        </div>
      ) : customers.length > 0 ? (
        <div className="h-[300px] overflow-y-auto pr-4">
          <div className="space-y-2">
            {customers.map((customer) => (
              <div
                key={customer.id}
                className={`flex items-center space-x-2 border rounded-md p-3 transition-colors cursor-pointer ${
                  selectedCustomerId === customer.id
                    ? 'border-blue-300 bg-blue-50'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => handleSelectCustomer(customer.id)}
              >
                <div className="flex-shrink-0 w-4 h-4 rounded-full border border-blue-400 flex items-center justify-center">
                  {selectedCustomerId === customer.id && 
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                  }
                </div>
                <Avatar className="h-9 w-9 border bg-blue-100 text-blue-500">
                  <UserCircle className="h-6 w-6" />
                </Avatar>
                <div className="flex-1 min-w-0">
                  <Label
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    {customer.name}
                  </Label>
                  <div className="flex flex-col mt-1 text-xs text-muted-foreground truncate">
                    {customer.phone && (
                      <span className="flex items-center">
                        <Phone className="h-3 w-3 mr-1 text-blue-400" />
                        {customer.phone}
                      </span>
                    )}
                    {customer.email && (
                      <span className="flex items-center">
                        <Mail className="h-3 w-3 mr-1 text-blue-400" />
                        {customer.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-4 border rounded-md border-dashed p-6">
          <UserCircle className="h-10 w-10 mx-auto text-gray-300 mb-2" />
          <p className="text-muted-foreground">Tidak ada pelanggan ditemukan</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2 border-green-200 hover:bg-green-50"
            onClick={() => setShowCustomerFormSheet(true)}
          >
            <UserPlus className="mr-2 h-3 w-3 text-green-600" />
            Tambah Pelanggan Baru
          </Button>
        </div>
      )}
      
      {/* Selected customer summary */}
      {selectedCustomerId && (
        <div className="mt-4 border border-blue-200 rounded-md bg-blue-50 p-3">
          <div className="flex items-center gap-2 mb-2">
            <UserCircle className="h-5 w-5 text-blue-500" />
            <h3 className="font-medium">Pelanggan Terpilih</h3>
          </div>
          <div className="space-y-1 text-sm">
            <p className="font-medium">{orderData.customer?.name}</p>
            {orderData.customer?.phone && (
              <p className="text-muted-foreground flex items-center">
                <Phone className="h-3.5 w-3.5 mr-1 text-blue-400" />
                {orderData.customer.phone}
              </p>
            )}
            {orderData.customer?.email && (
              <p className="text-muted-foreground flex items-center">
                <Mail className="h-3.5 w-3.5 mr-1 text-blue-400" />
                {orderData.customer.email}
              </p>
            )}
          </div>
        </div>
      )}
      
      {/* Customer Form Sheet */}
      <CustomerFormSheet
        isOpen={showCustomerFormSheet}
        onClose={() => setShowCustomerFormSheet(false)}
        onSuccess={handleCustomerCreated}
      />
    </div>
  );
} 