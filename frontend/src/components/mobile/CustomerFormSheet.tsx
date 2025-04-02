import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserCircle, Phone, Mail, Home, Loader2, Check } from 'lucide-react';
import { createAuthHeaders } from '@/lib/api-utils';
import { toast } from 'sonner';
import BottomSheet from './BottomSheet';

interface CustomerFormSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (customer: any) => void;
  initialCustomer?: any; // Add initialCustomer for edit mode
}

export default function CustomerFormSheet({
  isOpen,
  onClose,
  onSuccess,
  initialCustomer = null // Default to null for create mode
}: CustomerFormSheetProps) {
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });
  const [isCreating, setIsCreating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Set the default values when the component mounts or initialCustomer changes
  useEffect(() => {
    if (initialCustomer) {
      setNewCustomer({
        name: initialCustomer.name || '',
        phone: initialCustomer.phone || '',
        email: initialCustomer.email || '',
        address: initialCustomer.address || ''
      });
    } else {
      // Reset form when not in edit mode
      setNewCustomer({
        name: '',
        phone: '',
        email: '',
        address: ''
      });
    }
  }, [initialCustomer, isOpen]);

  const handleNewCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCustomer(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!newCustomer.name.trim()) {
      newErrors.name = 'Nama pelanggan wajib diisi';
    }
    
    if (newCustomer.phone && !/^[0-9+\-\s]{6,15}$/.test(newCustomer.phone)) {
      newErrors.phone = 'Format nomor telepon tidak valid';
    }
    
    if (newCustomer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newCustomer.email)) {
      newErrors.email = 'Format email tidak valid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveCustomer = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsCreating(true);
    
    try {
      // Determine if this is a create or update operation
      const isEdit = initialCustomer !== null;
      const url = isEdit 
        ? `/api/customers/${initialCustomer.id}`
        : '/api/customers';
      
      const method = isEdit ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...createAuthHeaders()
        },
        body: JSON.stringify(newCustomer),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${isEdit ? 'update' : 'create'} customer`);
      }
      
      const data = await response.json();
      
      // Find the customer in the response
      let savedCustomer;
      if (data.data && data.data.id) {
        savedCustomer = data.data;
      } else if (data.id) {
        savedCustomer = data;
      } else if (isEdit) {
        // If the API doesn't return the updated customer, use the initial customer with updated fields
        savedCustomer = {
          ...initialCustomer,
          ...newCustomer
        };
      }
      
      if (savedCustomer) {
        toast.success(isEdit ? 'Data pelanggan berhasil diperbarui' : 'Pelanggan baru berhasil dibuat');
        
        // Pass the customer data back to the parent component
        onSuccess(savedCustomer);
        
        // Reset form
        if (!isEdit) {
          setNewCustomer({
            name: '',
            phone: '',
            email: '',
            address: ''
          });
        }
        
        // Close the sheet
        onClose();
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error(`Error ${initialCustomer ? 'updating' : 'creating'} customer:`, error);
      toast.error(error.message || `Gagal ${initialCustomer ? 'memperbarui' : 'membuat'} pelanggan`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={initialCustomer ? "Edit Pelanggan" : "Tambah Pelanggan Baru"}
      description={initialCustomer 
        ? "Perbarui informasi pelanggan di bawah ini" 
        : "Masukkan informasi pelanggan baru di bawah ini"}
    >
      <div className="px-4 py-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center">
            <UserCircle className="h-4 w-4 text-blue-500 mr-1" />
            Nama <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            value={newCustomer.name}
            onChange={handleNewCustomerChange}
            className={`border-blue-200 focus-visible:ring-blue-300 ${errors.name ? 'border-red-300 bg-red-50' : ''}`}
            placeholder="Nama pelanggan"
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1">{errors.name}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center">
            <Phone className="h-4 w-4 text-green-500 mr-1" />
            Telepon
          </Label>
          <Input
            id="phone"
            name="phone"
            value={newCustomer.phone}
            onChange={handleNewCustomerChange}
            className={`border-green-200 focus-visible:ring-green-300 ${errors.phone ? 'border-red-300 bg-red-50' : ''}`}
            placeholder="Nomor telepon"
          />
          {errors.phone && (
            <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center">
            <Mail className="h-4 w-4 text-purple-500 mr-1" />
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={newCustomer.email}
            onChange={handleNewCustomerChange}
            className={`border-purple-200 focus-visible:ring-purple-300 ${errors.email ? 'border-red-300 bg-red-50' : ''}`}
            placeholder="Alamat email"
          />
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="address" className="flex items-center">
            <Home className="h-4 w-4 text-amber-500 mr-1" />
            Alamat
          </Label>
          <Input
            id="address"
            name="address"
            value={newCustomer.address}
            onChange={handleNewCustomerChange}
            className="border-amber-200 focus-visible:ring-amber-300"
            placeholder="Alamat pelanggan"
          />
        </div>
        
        <div className="pt-4 border-t flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isCreating}
          >
            Batal
          </Button>
          <Button
            type="button"
            onClick={handleSaveCustomer}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            disabled={isCreating}
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Simpan
              </>
            )}
          </Button>
        </div>
        
        <p className="text-xs text-gray-500 text-center">
          <span className="text-red-500">*</span> Menandakan kolom wajib diisi
        </p>
      </div>
    </BottomSheet>
  );
} 