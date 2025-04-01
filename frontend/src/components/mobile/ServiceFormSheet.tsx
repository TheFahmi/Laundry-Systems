import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Check, Tag, Banknote, FileText, Package, Scale, Hash } from 'lucide-react';
import { createAuthHeaders } from '@/lib/api-utils';
import { toast } from 'sonner';
import BottomSheet from './BottomSheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Service, ServicePriceModel } from '@/types/service';

interface ServiceFormSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (service: Service) => void;
  service?: Service; // For editing existing service
}

export default function ServiceFormSheet({
  isOpen,
  onClose,
  onSuccess,
  service
}: ServiceFormSheetProps) {
  const isEditMode = !!service?.id;
  
  const [formData, setFormData] = useState<Service>({
    name: '',
    price: 0,
    description: '',
    category: 'uncategorized',
    priceModel: ServicePriceModel.PER_UNIT
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Load service data when editing
  useEffect(() => {
    if (service) {
      setFormData({
        id: service.id,
        name: service.name || '',
        price: service.price || 0,
        description: service.description || '',
        category: service.category || 'uncategorized',
        priceModel: service.priceModel || ServicePriceModel.PER_UNIT
      });
    }
  }, [service]);
  
  // Reset form when closed
  useEffect(() => {
    if (!isOpen && !isEditMode) {
      setFormData({
        name: '',
        price: 0,
        description: '',
        category: 'uncategorized',
        priceModel: ServicePriceModel.PER_UNIT
      });
      setErrors({});
    }
  }, [isOpen, isEditMode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? Number(value) : value
    }));
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user selects
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nama layanan wajib diisi';
    }
    
    if (formData.price <= 0) {
      newErrors.price = 'Harga harus lebih dari 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const method = isEditMode ? 'PUT' : 'POST';
      const url = isEditMode ? `/api/services/${formData.id}` : '/api/services';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...createAuthHeaders()
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${isEditMode ? 'update' : 'create'} service`);
      }
      
      const data = await response.json();
      
      // Find the service in the response
      let savedService;
      if (data.data && data.data.id) {
        savedService = data.data;
      } else if (data.id) {
        savedService = data;
      } else if (isEditMode) {
        // If editing and we don't get a clear response, use the form data
        savedService = { ...formData };
      }
      
      if (savedService) {
        toast.success(`Layanan berhasil ${isEditMode ? 'diperbarui' : 'dibuat'}`);
        
        // Pass the service data back to the parent component
        onSuccess(savedService);
        
        if (!isEditMode) {
          // Reset form for new service
          setFormData({
            name: '',
            price: 0,
            description: '',
            category: 'uncategorized',
            priceModel: ServicePriceModel.PER_UNIT
          });
        }
        
        // Close the sheet
        onClose();
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} service:`, error);
      toast.error(error.message || `Gagal ${isEditMode ? 'memperbarui' : 'membuat'} layanan`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Available service categories
  const categories = [
    { value: 'uncategorized', label: 'Tanpa Kategori' },
    { value: 'cuci', label: 'Cuci' },
    { value: 'setrika', label: 'Setrika' },
    { value: 'laundry', label: 'Laundry' },
    { value: 'dry clean', label: 'Dry Clean' },
    { value: 'express', label: 'Express' },
  ];

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Layanan' : 'Tambah Layanan Baru'}
      description={isEditMode 
        ? 'Perbarui informasi layanan yang sudah ada' 
        : 'Masukkan informasi layanan baru di bawah ini'}
    >
      <div className="px-4 py-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center">
            <Tag className="h-4 w-4 text-blue-500 mr-1" />
            Nama Layanan <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`border-blue-200 focus-visible:ring-blue-300 ${errors.name ? 'border-red-300 bg-red-50' : ''}`}
            placeholder="Nama layanan"
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1">{errors.name}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="category" className="flex items-center">
            <Package className="h-4 w-4 text-purple-500 mr-1" />
            Kategori
          </Label>
          <Select
            value={formData.category}
            onValueChange={(value) => handleSelectChange('category', value)}
          >
            <SelectTrigger 
              id="category" 
              className="border-purple-200 focus-visible:ring-purple-300"
            >
              <SelectValue placeholder="Pilih kategori" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="priceModel" className="flex items-center">
            <Scale className="h-4 w-4 text-amber-500 mr-1" />
            Model Harga
          </Label>
          <Select
            value={formData.priceModel}
            onValueChange={(value) => handleSelectChange('priceModel', value)}
          >
            <SelectTrigger 
              id="priceModel" 
              className="border-amber-200 focus-visible:ring-amber-300"
            >
              <SelectValue placeholder="Pilih model harga" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ServicePriceModel.PER_UNIT}>
                <div className="flex items-center">
                  <Hash className="h-4 w-4 mr-2 text-blue-500" />
                  <span>Per Unit/Item</span>
                </div>
              </SelectItem>
              <SelectItem value={ServicePriceModel.PER_KG}>
                <div className="flex items-center">
                  <Scale className="h-4 w-4 mr-2 text-purple-500" />
                  <span>Per Kilogram (KG)</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <div className="mt-1">
            <Badge variant="outline" className={`
              ${formData.priceModel === ServicePriceModel.PER_UNIT 
                ? 'bg-blue-50 text-blue-700 border-blue-200' 
                : 'bg-purple-50 text-purple-700 border-purple-200'}
            `}>
              {formData.priceModel === ServicePriceModel.PER_UNIT 
                ? <Hash className="h-3 w-3 mr-1" /> 
                : <Scale className="h-3 w-3 mr-1" />}
              {formData.priceModel === ServicePriceModel.PER_UNIT ? 'Harga per item' : 'Harga per kilogram'}
            </Badge>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="price" className="flex items-center">
            <Banknote className="h-4 w-4 text-green-500 mr-1" />
            Harga <span className="text-red-500 ml-1">*</span>
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className="text-gray-500">Rp</span>
            </div>
            <Input
              id="price"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleInputChange}
              className={`pl-10 border-green-200 focus-visible:ring-green-300 ${errors.price ? 'border-red-300 bg-red-50' : ''}`}
              placeholder="0"
              min="0"
              step="1000"
            />
          </div>
          {errors.price && (
            <p className="text-xs text-red-500 mt-1">{errors.price}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description" className="flex items-center">
            <FileText className="h-4 w-4 text-gray-500 mr-1" />
            Deskripsi
          </Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="border-gray-200 focus-visible:ring-gray-300 min-h-[80px]"
            placeholder="Deskripsi layanan (opsional)"
          />
        </div>
        
        <div className="pt-4 border-t flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                {isEditMode ? 'Perbarui' : 'Simpan'}
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