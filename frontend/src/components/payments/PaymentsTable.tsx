'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PaymentStatusBadge } from '@/components/ui/payment-status-badge';
import { getPayments, PaymentFilters, PaymentListResponse } from '@/services/paymentService';
import { Payment, PaymentMethod, PaymentStatus, methodLabels, statusLabels, convertToFrontendPayment, BackendPayment } from '@/types/payment';
import { formatRupiah, formatDate } from '@/lib/utils';

interface PaymentsTableProps {
  initialFilters?: PaymentFilters;
  showControls?: boolean;
  maxItems?: number;
  onRowClick?: (payment: BackendPayment) => void;
}

export default function PaymentsTable({
  initialFilters = {},
  showControls = true,
  maxItems,
  onRowClick,
}: PaymentsTableProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payments, setPayments] = useState<BackendPayment[]>([]);
  
  // Fetch payments from API
  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getPayments({
        ...filters,
        page,
        limit,
        status: filters.status === 'all' ? undefined : filters.status,
        method: filters.method === 'all' ? undefined : filters.method,
        search: searchTerm || undefined,
      });
      
      // Extract payments from the nested response structure
      const paymentsData = response.data.data;

      console.log('Payments data:', paymentsData);
      
      // Use raw payment data directly
      const payments = paymentsData;
      setPayments(payments);
      setTotal(response.data.total);
      setPage(response.data.page);
    } catch (err: any) {
      console.error('Error fetching payments:', err);
      setError(err.message || 'Failed to load payments');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Load payments when filters change
  useEffect(() => {
    fetchPayments();
  }, [page, limit, filters]);
  
  // Handle search
  const handleSearch = () => {
    setPage(1); // Reset to first page
    fetchPayments();
  };
  
  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };
  
  // Handle row click
  const handleRowClick = (payment: BackendPayment) => {
    if (onRowClick) {
      onRowClick(payment);
    } else {
      router.push(`/payments/${payment.id}`);
    }
  };
  
  // Handle filter change
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when filter changes
  };
  
  // Calculate page count
  const pageCount = Math.ceil(total / limit);
  
  return (
    <div className="space-y-4">
      {showControls && (
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 sm:items-center">
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input
              placeholder="Cari pembayaran..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch}>Cari</Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={filters.method}
              onValueChange={(value) => handleFilterChange('method', value)}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Metode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Metode</SelectItem>
                {Object.entries(methodLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
      
      <Card>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No. Referensi</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>No. Order</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Metode</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Catatan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    Memuat data pembayaran...
                  </TableCell>
                </TableRow>
              ) : payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    Tidak ada pembayaran ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                payments.slice(0, maxItems).map((payment) => (
                  <TableRow
                    key={payment.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRowClick(payment)}
                  >
                    <TableCell className="font-medium">
                      {payment.referenceNumber || payment.id?.substring(0, 8).toUpperCase()}
                    </TableCell>
                    <TableCell>
                      {formatDate(payment.createdAt as string || new Date().toISOString())}
                    </TableCell>
                    <TableCell>
                      {payment.orderId ? payment.orderId.substring(0, 8).toUpperCase() : '-'}
                    </TableCell>
                    <TableCell className="font-medium">{formatRupiah(payment.amount || 0)}</TableCell>
                    <TableCell>
                      {methodLabels[payment.paymentMethod as PaymentMethod] || 'Tunai'}
                    </TableCell>
                    <TableCell>
                      <PaymentStatusBadge 
                        status={payment.status as PaymentStatus} 
                      />
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {payment.notes || '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
      
      {showControls && pageCount > 1 && (
        <div className="flex items-center justify-between py-4">
          <div className="text-sm text-muted-foreground">
            Total {total} pembayaran
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
            >
              Sebelumnya
            </Button>
            <div className="text-sm">
              Halaman {page} dari {pageCount}
            </div>
            <Button
              variant="outline"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= pageCount}
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      )}
      
      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded">
          {error}
        </div>
      )}
    </div>
  );
} 