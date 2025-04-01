'use client';

import React, { useState, useEffect } from 'react';
import { createAuthHeaders } from '@/lib/api-utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader2, Search, Plus, User } from 'lucide-react';
import CustomerForm, { CustomerFormData } from '@/components/customers/CustomerForm';
import { toast } from 'sonner';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Alert, AlertDescription } from '@/components/ui/alert';

export interface CustomerSelectProps {
  onSelectCustomer: (id: string, name: string) => void;
  selectedCustomerId?: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

const customersPerPage = 10;
const MAX_DISPLAY_ITEMS = 5;
const MAX_TOTAL_ITEMS = 10;

export default function CustomerSelect({ onSelectCustomer, selectedCustomerId }: CustomerSelectProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [openNewCustomerDialog, setOpenNewCustomerDialog] = useState(false);
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);

  const generateCacheBuster = () => {
    return `_cb=${Date.now()}`;
  };

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      setError(null);
      try {
        // Use Next.js API proxy
        const apiUrl = '/api/customers?' + generateCacheBuster();
        console.log('CustomerSelect: Fetching customers from', apiUrl);
        
        const response = await fetch(apiUrl, {
          headers: createAuthHeaders()
        });
        
        console.log('CustomerSelect: Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`Failed to load customers: ${response.status} ${response.statusText}`);
        }
        
        const responseData = await response.json();
        console.log('CustomerSelect: Received customers data:', responseData);
        
        // Extract customers array from nested response
        let customersArray: Customer[] = [];
        
        if (responseData.data && responseData.data.items && Array.isArray(responseData.data.items)) {
          customersArray = responseData.data.items;
        } else if (responseData.items && Array.isArray(responseData.items)) {
          customersArray = responseData.items;
        } else if (responseData.data && Array.isArray(responseData.data)) {
          customersArray = responseData.data;
        } else if (Array.isArray(responseData)) {
          customersArray = responseData;
        } else {
          console.error('Unexpected customers response format:', responseData);
        }
        
        // Ensure we have valid customer objects
        customersArray = customersArray.filter(customer => 
          customer && 
          typeof customer.id === 'string' && 
          typeof customer.name === 'string' && 
          typeof customer.phone === 'string'
        );
        
        setCustomers(customersArray);
        setFilteredCustomers(customersArray);
      } catch (error) {
        console.error('CustomerSelect: Error fetching customers:', error);
        setError(error instanceof Error ? error.message : 'Failed to load customers');
        setCustomers([]);
        setFilteredCustomers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // Filter customers based on search query
  useEffect(() => {
    if (!Array.isArray(customers)) {
      setFilteredCustomers([]);
      return;
    }

    let filtered: Customer[] = [];
    
    if (searchQuery.trim() === '') {
      filtered = customers;
    } else {
      const lowerCaseQuery = searchQuery.toLowerCase();
      filtered = customers.filter(customer => 
        customer.name.toLowerCase().includes(lowerCaseQuery) || 
        customer.phone.toLowerCase().includes(lowerCaseQuery) ||
        (customer.email && customer.email.toLowerCase().includes(lowerCaseQuery))
      );
    }
    
    // Limit to maximum 10 results total
    setFilteredCustomers(filtered.slice(0, MAX_TOTAL_ITEMS));
    setPage(1);
  }, [searchQuery, customers]);

  // Update total pages when filtered customers change
  useEffect(() => {
    if (Array.isArray(filteredCustomers)) {
      const total = Math.max(1, Math.ceil(filteredCustomers.length / customersPerPage));
      setTotalPages(total);
    }
  }, [filteredCustomers]);
  
  // Calculate customers to display for the current page
  const displayedCustomers = Array.isArray(filteredCustomers) 
    ? filteredCustomers.slice(
        (page - 1) * customersPerPage,
        page * customersPerPage
      )
    : [];
  
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };
  
  const handleAddNewCustomer = () => {
    setOpenNewCustomerDialog(true);
  };

  const handleCloseNewCustomerDialog = () => {
    setOpenNewCustomerDialog(false);
  };

  const handleNewCustomerSubmit = async (formData: CustomerFormData) => {
    try {
      setIsCreatingCustomer(true);
      const apiUrl = '/api/customers';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...createAuthHeaders()
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create customer');
      }

      const responseData = await response.json();
      
      // Handle different response formats
      let newCustomer: Customer;
      if (responseData.data) {
        newCustomer = responseData.data;
      } else if (responseData.id) {
        newCustomer = responseData;
      } else {
        throw new Error('Invalid response format from create customer API');
      }
      
      setCustomers(prev => [...prev, newCustomer]);
      setFilteredCustomers(prev => [...prev, newCustomer]);
      
      // Just select the customer but don't trigger automatic progression
      onSelectCustomer(newCustomer.id, newCustomer.name);
      
      setOpenNewCustomerDialog(false);
      toast.success('Customer created successfully');
    } catch (error: any) {
      console.error('Error creating customer:', error);
      toast.error(error.message || 'Failed to create customer');
    } finally {
      setIsCreatingCustomer(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Pilih Pelanggan</h2>
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => window.location.reload()}>
          Coba Lagi
        </Button>
      </div>
    );
  }
  
  return (
    <Card className="border border-blue-100 shadow-sm">
      <CardHeader className="pb-3 border-b border-blue-100">
        <CardTitle className="flex items-center text-blue-700">
          <User className="h-5 w-5 mr-2 text-blue-500" />
          Pilih Pelanggan
        </CardTitle>
        <CardDescription>
          Pilih pelanggan yang akan membuat pesanan atau tambahkan pelanggan baru
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-blue-500" />
            <Input
              placeholder="Cari nama atau nomor telepon..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-8 border-blue-200 focus-visible:ring-blue-400"
            />
          </div>
          <Button onClick={handleAddNewCustomer} className="bg-blue-500 hover:bg-blue-600 cursor-pointer">
            <Plus className="mr-2 h-4 w-4" />
            Pelanggan Baru
          </Button>
        </div>
        
        {displayedCustomers.length === 0 ? (
          <div className="py-8 text-center border border-dashed border-blue-200 rounded-lg bg-blue-50/50">
            <User className="mx-auto h-12 w-12 text-blue-300 opacity-70" />
            <p className="mt-2 text-blue-600">Tidak ada pelanggan yang ditemukan</p>
            <Button variant="outline" className="mt-4 border-blue-300 text-blue-700 hover:bg-blue-100 cursor-pointer" onClick={handleAddNewCustomer}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Pelanggan Baru
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Create a scrollable container with fixed height */}
            <div className="h-[300px] overflow-auto pr-1">
              <div className="grid grid-cols-1 gap-2">
                {displayedCustomers.map((customer) => (
                  <div 
                    key={customer.id}
                    className={`p-4 border rounded-md cursor-pointer transition-colors ${
                      selectedCustomerId === customer.id 
                        ? 'bg-blue-50 border-blue-300' 
                        : 'hover:bg-accent'
                    }`}
                    onClick={() => onSelectCustomer(customer.id, customer.name)}
                  >
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                        selectedCustomerId === customer.id 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        <User className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className={`font-medium ${selectedCustomerId === customer.id ? 'text-blue-700' : ''}`}>
                          {customer.name}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                          </svg>
                          {customer.phone}
                        </div>
                        {customer.email && (
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                              <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                            {customer.email}
                          </div>
                        )}
                      </div>
                      {selectedCustomerId === customer.id && (
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {totalPages > 1 && (
              <Pagination className="justify-center">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(Math.max(1, page - 1))}
                      className={page <= 1 ? "pointer-events-none opacity-50" : "text-blue-600 hover:text-blue-700"}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => Math.abs(p - page) < 3 || p === 1 || p === totalPages)
                    .map((p, i, arr) => {
                      // Add ellipsis
                      if (i > 0 && p > arr[i - 1] + 1) {
                        return (
                          <React.Fragment key={`ellipsis-${p}`}>
                            <PaginationItem>
                              <span className="px-4 py-2">...</span>
                            </PaginationItem>
                            <PaginationItem>
                              <PaginationLink
                                onClick={() => handlePageChange(p)}
                                isActive={page === p}
                                className={page === p ? "bg-blue-500 text-white hover:bg-blue-600" : "text-blue-600 hover:text-blue-700"}
                              >
                                {p}
                              </PaginationLink>
                            </PaginationItem>
                          </React.Fragment>
                        );
                      }
                      
                      return (
                        <PaginationItem key={p}>
                          <PaginationLink
                            onClick={() => handlePageChange(p)}
                            isActive={page === p}
                            className={page === p ? "bg-blue-500 text-white hover:bg-blue-600" : "text-blue-600 hover:text-blue-700"}
                          >
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                      className={page >= totalPages ? "pointer-events-none opacity-50" : "text-blue-600 hover:text-blue-700"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        )}
      </CardContent>
      
      <Dialog open={openNewCustomerDialog} onOpenChange={setOpenNewCustomerDialog}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Tambah Pelanggan Baru</DialogTitle>
          </DialogHeader>
          <CustomerForm
            onSubmit={handleNewCustomerSubmit}
            onCancel={handleCloseNewCustomerDialog}
            isLoading={isCreatingCustomer}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
} 