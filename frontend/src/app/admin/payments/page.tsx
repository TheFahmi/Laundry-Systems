'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PaymentsTable from '@/components/payments/PaymentsTable';
import { PaymentStatus } from '@/types/payment';
import { PaymentFilters } from '@/services/paymentService';
import { Separator } from '@/components/ui/separator';
import { formatRupiah } from '@/lib/utils';

export default function PaymentsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('all');
  
  // Generate filters based on active tab
  const generateFilters = (): PaymentFilters => {
    const filters: PaymentFilters = {};
    
    // Add status filter based on active tab
    if (activeTab !== 'all') {
      filters.status = activeTab as string;
    }
    
    return filters;
  };
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  // Navigate to create payment page
  const handleCreatePayment = () => {
    router.push('/payments/create');
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold">Pembayaran</h1>
          <p className="text-muted-foreground">Kelola semua transaksi pembayaran</p>
        </div>
        <Button onClick={handleCreatePayment}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
          Tambah Pembayaran
        </Button>
      </div>
      
      <Separator />
      
      <Card className="p-4">
        <Tabs defaultValue="all" onValueChange={handleTabChange}>
          <TabsList className="grid grid-cols-3 sm:grid-cols-6 mb-4">
            <TabsTrigger value="all">Semua</TabsTrigger>
            <TabsTrigger value={PaymentStatus.PENDING}>Menunggu</TabsTrigger>
            <TabsTrigger value={PaymentStatus.COMPLETED}>Selesai</TabsTrigger>
            <TabsTrigger value={PaymentStatus.FAILED}>Gagal</TabsTrigger>
            <TabsTrigger value={PaymentStatus.REFUNDED}>Dikembalikan</TabsTrigger>
            <TabsTrigger value={PaymentStatus.CANCELLED}>Dibatalkan</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab}>
            <PaymentsTable initialFilters={generateFilters()} />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
} 