'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, User, X } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription,
  DialogClose
} from '@/components/ui/dialog';
import { toast } from 'sonner';

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
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    orderData.customer?.id || null
  );
  
  // State for new customer dialog
  const [showNewCustomerDialog, setShowNewCustomerDialog] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });
  const [isCreating, setIsCreating] = useState(false);

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
    setSelectedCustomerId(customerId);
    const selectedCustomer = customers.find(c => c.id === customerId);
    if (selectedCustomer) {
      updateOrderData({ customer: selectedCustomer });
    }
  };
  
  // Handle new customer input change
  const handleNewCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCustomer(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle create new customer
  const handleCreateCustomer = async () => {
    // Basic validation
    if (!newCustomer.name.trim()) {
      toast.error('Nama pelanggan wajib diisi');
      return;
    }
    
    setIsCreating(true);
    
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCustomer),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create customer');
      }
      
      const data = await response.json();
      
      // Find the created customer in the response
      let createdCustomer;
      if (data.data && data.data.id) {
        createdCustomer = data.data;
      } else if (data.id) {
        createdCustomer = data;
      }
      
      if (createdCustomer) {
        toast.success('Pelanggan baru berhasil dibuat');
        
        // Update customer list
        setCustomers(prev => [createdCustomer, ...prev]);
        
        // Select the new customer
        setSelectedCustomerId(createdCustomer.id);
        updateOrderData({ customer: createdCustomer });
        
        // Close dialog and reset form
        setShowNewCustomerDialog(false);
        setNewCustomer({
          name: '',
          phone: '',
          email: '',
          address: ''
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error('Error creating customer:', error);
      toast.error(error.message || 'Gagal membuat pelanggan baru');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Pilih Pelanggan</h2>
      
      {/* Search box */}
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Cari pelanggan..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Button variant="outline" onClick={handleSearch}>
          Cari
        </Button>
      </div>
      
      {/* New Customer button */}
      <Button 
        variant="outline" 
        className="w-full" 
        onClick={() => setShowNewCustomerDialog(true)}
      >
        <Plus className="mr-2 h-4 w-4" />
        Pelanggan Baru
      </Button>
      
      <Separator />
      
      {/* Customer list */}
      {loading ? (
        <div className="flex justify-center py-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        </div>
      ) : customers.length > 0 ? (
        <ScrollArea className="h-[300px] pr-4">
          <RadioGroup
            value={selectedCustomerId || undefined}
            onValueChange={handleSelectCustomer}
            className="space-y-2"
          >
            {customers.map((customer) => (
              <div
                key={customer.id}
                className="flex items-center space-x-2 border rounded-md p-3"
              >
                <RadioGroupItem value={customer.id} id={customer.id} />
                <Avatar className="h-9 w-9 border">
                  <User className="h-5 w-5" />
                </Avatar>
                <div className="flex-1 min-w-0">
                  <Label
                    htmlFor={customer.id}
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    {customer.name}
                  </Label>
                  {customer.phone && (
                    <p className="text-xs text-muted-foreground truncate">
                      {customer.phone}
                    </p>
                  )}
                  {customer.email && (
                    <p className="text-xs text-muted-foreground truncate">
                      {customer.email}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </RadioGroup>
        </ScrollArea>
      ) : (
        <div className="py-4 text-center text-muted-foreground">
          Tidak ada pelanggan ditemukan. Silahkan buat pelanggan baru.
        </div>
      )}
      
      {/* Selected Customer Summary */}
      {selectedCustomerId && orderData.customer && (
        <div className="mt-4 border rounded-md p-3 bg-muted/20">
          <p className="font-semibold">Pelanggan Terpilih:</p>
          <p>{orderData.customer.name}</p>
          {orderData.customer.phone && <p className="text-sm">{orderData.customer.phone}</p>}
        </div>
      )}
      
      {/* New Customer Dialog */}
      <Dialog open={showNewCustomerDialog} onOpenChange={setShowNewCustomerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Pelanggan Baru</DialogTitle>
            <DialogDescription>
              Masukkan data pelanggan baru untuk melanjutkan
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Pelanggan <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                name="name"
                value={newCustomer.name}
                onChange={handleNewCustomerChange}
                placeholder="Masukkan nama pelanggan"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Nomor Telepon</Label>
              <Input
                id="phone"
                name="phone"
                value={newCustomer.phone}
                onChange={handleNewCustomerChange}
                placeholder="Masukkan nomor telepon"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={newCustomer.email}
                onChange={handleNewCustomerChange}
                placeholder="Masukkan email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Alamat</Label>
              <Input
                id="address"
                name="address"
                value={newCustomer.address}
                onChange={handleNewCustomerChange}
                placeholder="Masukkan alamat"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewCustomerDialog(false)}
            >
              Batal
            </Button>
            <Button 
              onClick={handleCreateCustomer}
              disabled={isCreating || !newCustomer.name.trim()}
            >
              {isCreating ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                  Menyimpan...
                </>
              ) : 'Simpan Pelanggan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 