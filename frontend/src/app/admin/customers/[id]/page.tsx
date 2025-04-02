'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCustomerById, deleteCustomer, Customer } from '@/api/customers';
import { format } from 'date-fns';
import { ArrowLeft, Edit, Trash, Phone, Mail, MapPin, FileText } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import Link from 'next/link';

// Helper function to format date safely
const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

export default function CustomerDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const customerId = Array.isArray(id) ? id[0] : id;
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch customer data
  useEffect(() => {
    const fetchCustomerDetail = async () => {
      if (!customerId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await getCustomerById(customerId);
        setCustomer(data);
      } catch (err) {
        console.error('Error fetching customer:', err);
        setError('Terjadi kesalahan saat mengambil data pelanggan');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCustomerDetail();
  }, [customerId]);

  // Handle go back
  const handleGoBack = () => {
    router.back();
  };
  
  // Handle edit customer
  const handleEditCustomer = () => {
    router.push(`/customers/edit/${customerId}`);
  };
  
  // Handle delete customer
  const handleDeleteCustomer = async () => {
    if (!customerId) return;
    
    setDeleteLoading(true);
    
    try {
      await deleteCustomer(customerId);
      toast.success('Pelanggan berhasil dihapus');
      router.push('/customers');
    } catch (err) {
      console.error('Error deleting customer:', err);
      toast.error('Terjadi kesalahan saat menghapus pelanggan');
      setDeleteDialogOpen(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-3xl py-10">
        <div className="flex items-center space-x-2 mb-6">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-4 w-24 mt-1" />
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Skeleton className="h-5 w-32" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
              <div className="space-y-4">
                <Skeleton className="h-5 w-32" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-3xl py-10">
        <Alert className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={handleGoBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="container max-w-3xl py-10">
        <Alert className="mb-6">
          <AlertDescription>Pelanggan tidak ditemukan</AlertDescription>
        </Alert>
        <Button onClick={handleGoBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleGoBack}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Detail Pelanggan</h1>
            <p className="text-muted-foreground">Informasi lengkap pelanggan</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="text-destructive">
                <Trash className="mr-2 h-4 w-4" />
                Hapus
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Konfirmasi Hapus Pelanggan</DialogTitle>
                <DialogDescription>
                  Apakah Anda yakin ingin menghapus pelanggan <span className="font-semibold">{customer.name}</span>? Tindakan ini tidak dapat dibatalkan.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                  disabled={deleteLoading}
                >
                  Batal
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteCustomer} 
                  disabled={deleteLoading}
                >
                  {deleteLoading ? 'Menghapus...' : 'Hapus'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button onClick={handleEditCustomer}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>
      
      {/* Customer Detail Card */}
      <Card>
        <CardHeader>
          <CardTitle>{customer.name}</CardTitle>
          <Badge variant="outline" className="w-fit">
            ID: {customer.id}
          </Badge>
        </CardHeader>
        
        <Separator />
        
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-medium mb-4">Informasi Kontak</h3>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Nomor Telepon</p>
                    <p className="font-medium">{customer.phone}</p>
                  </div>
                </div>
                
                {customer.email && (
                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{customer.email}</p>
                    </div>
                  </div>
                )}
                
                {customer.address && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Alamat</p>
                      <p className="font-medium">{customer.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Other Information */}
            <div>
              <h3 className="text-lg font-medium mb-4">Informasi Lainnya</h3>
              
              <div className="space-y-4">
                {customer.notes && (
                  <div className="flex items-start space-x-3">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Catatan</p>
                      <p className="font-medium">{customer.notes}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start space-x-3">
                  <div className="h-5 w-5" /> {/* Spacer for alignment */}
                  <div>
                    <p className="text-sm text-muted-foreground">Tanggal Daftar</p>
                    <p className="font-medium">
                      {customer.createdAt ? formatDate(customer.createdAt) : '-'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="h-5 w-5" /> {/* Spacer for alignment */}
                  <div>
                    <p className="text-sm text-muted-foreground">Terakhir Diperbarui</p>
                    <p className="font-medium">
                      {customer.updatedAt ? formatDate(customer.updatedAt) : '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 