'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCustomerById, updateCustomer, Customer, UpdateCustomerDto } from '@/api/customers';
import { ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

export default function EditCustomerPage() {
  const router = useRouter();
  const { id } = useParams();
  const customerId = Array.isArray(id) ? id[0] : id;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formValues, setFormValues] = useState<UpdateCustomerDto>({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch customer data
  useEffect(() => {
    const fetchCustomerDetail = async () => {
      if (!customerId) return;
      
      setLoading(true);
      
      try {
        const data = await getCustomerById(customerId);
        setCustomer(data);
        setFormValues({
          name: data.name || '',
          phone: data.phone || '',
          email: data.email || '',
          address: data.address || '',
          notes: data.notes || ''
        });
      } catch (err) {
        console.error('Error fetching customer:', err);
        toast.error('Terjadi kesalahan saat mengambil data pelanggan');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCustomerDetail();
  }, [customerId]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formValues.name || !formValues.name.trim()) {
      errors.name = 'Nama pelanggan wajib diisi';
    }
    
    if (!formValues.phone || !formValues.phone.trim()) {
      errors.phone = 'Nomor telepon wajib diisi';
    } else if (formValues.phone && !/^[0-9]{10,15}$/.test(formValues.phone.trim())) {
      errors.phone = 'Nomor telepon tidak valid';
    }
    
    if (formValues.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email)) {
      errors.email = 'Format email tidak valid';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle going back
  const handleGoBack = () => {
    router.back();
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!customerId) return;
    
    setSaving(true);
    
    try {
      await updateCustomer(customerId, formValues);
      toast.success('Data pelanggan berhasil disimpan');
      router.push(`/customers/${customerId}`);
    } catch (err) {
      console.error('Error updating customer:', err);
      toast.error('Terjadi kesalahan saat menyimpan data pelanggan');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-3xl py-10">
        <div className="space-y-2">
          <Skeleton className="h-8 w-[250px]" />
          <Skeleton className="h-4 w-[300px]" />
        </div>
        <div className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-[150px]" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-24 w-full" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-[120px] ml-auto" />
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-10">
      <div className="flex items-center space-x-2 mb-6">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleGoBack}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Pelanggan</h1>
          <p className="text-muted-foreground">Ubah informasi pelanggan</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informasi Pelanggan</CardTitle>
            <CardDescription>
              Perbarui informasi pelanggan sesuai kebutuhan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Pelanggan <span className="text-destructive">*</span></Label>
                <Input
                  id="name"
                  name="name"
                  value={formValues.name}
                  onChange={handleInputChange}
                  disabled={saving}
                  aria-invalid={!!formErrors.name}
                />
                {formErrors.name && (
                  <p className="text-sm text-destructive">{formErrors.name}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Nomor Telepon <span className="text-destructive">*</span></Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formValues.phone}
                  onChange={handleInputChange}
                  disabled={saving}
                  aria-invalid={!!formErrors.phone}
                />
                {formErrors.phone && (
                  <p className="text-sm text-destructive">{formErrors.phone}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formValues.email}
                onChange={handleInputChange}
                disabled={saving}
                aria-invalid={!!formErrors.email}
              />
              {formErrors.email && (
                <p className="text-sm text-destructive">{formErrors.email}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Alamat</Label>
              <Textarea
                id="address"
                name="address"
                value={formValues.address}
                onChange={handleInputChange}
                disabled={saving}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Catatan</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formValues.notes}
                onChange={handleInputChange}
                disabled={saving}
                rows={4}
                placeholder="Preferensi pelanggan, catatan khusus, dll."
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={handleGoBack}
              disabled={saving}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={saving}
            >
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
} 