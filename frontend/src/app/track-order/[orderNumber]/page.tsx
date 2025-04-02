'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock,
  CalendarClock,
  User,
  Phone,
  ClipboardList,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

// Mock order data - replace with API call in a real app
const MOCK_ORDER = {
  id: 'WO-2025-001',
  customerName: 'Budi Santoso',
  phoneNumber: '08123456789',
  address: 'Jl. Kenanga No. 123, Jakarta Selatan',
  status: 'processing',
  statusHistory: [
    { status: 'pending', timestamp: '2025-04-01T08:30:00Z', note: 'Order diterima' },
    { status: 'processing', timestamp: '2025-04-01T10:15:00Z', note: 'Sedang dicuci' },
  ],
  pickupDate: '2025-04-01',
  estimatedCompletionDate: '2025-04-03',
  deliveryDate: '2025-04-03',
  totalItems: 5,
  services: [
    { name: 'Cuci Setrika', quantity: 3, price: 10000, total: 30000 },
    { name: 'Dry Cleaning', quantity: 2, price: 25000, total: 50000 },
  ],
  totalAmount: 80000,
  isDelivery: true,
  notes: 'Pakaian putih dipisah',
};

const statusInfo = {
  pending: { 
    label: 'Menunggu Proses', 
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock
  },
  processing: { 
    label: 'Sedang Diproses', 
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Package
  },
  completed: { 
    label: 'Selesai', 
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle2
  },
  delivered: { 
    label: 'Telah Diantar', 
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: Truck
  },
  cancelled: { 
    label: 'Dibatalkan', 
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: AlertCircle
  }
};

export default function TrackOrderPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderNumber = params.orderNumber as string;
  const verifyDigits = searchParams.get('verify');
  
  const [order, setOrder] = useState<typeof MOCK_ORDER | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Validate that we have verification digits
    if (!verifyDigits || verifyDigits.length !== 4) {
      setError('Verifikasi tidak valid');
      setLoading(false);
      return;
    }

    // In a real app, fetch order data from API and verify phone digits
    const fetchOrder = async () => {
      try {
        // Simulate API call with timeout
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // For demo purposes, we'll just use the mock data
        // In a real app, you would verify the phone number digits match
        setOrder(MOCK_ORDER);
        setLoading(false);
      } catch (err) {
        setError('Gagal memuat data pesanan');
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderNumber, verifyDigits]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="mb-4"
            onClick={() => router.push('/')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Beranda
          </Button>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-3 space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div>
            <Skeleton className="h-80 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="mb-4"
            onClick={() => router.push('/')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Beranda
          </Button>
        </div>
        
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Pesanan Tidak Ditemukan</h2>
              <p className="text-gray-600 mb-6">
                {error || 'Pesanan tidak ditemukan atau verifikasi gagal'}
              </p>
              <Button onClick={() => router.push('/')}>
                Kembali ke Beranda
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const StatusIcon = statusInfo[order.status as keyof typeof statusInfo]?.icon || Clock;

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => router.push('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Beranda
        </Button>
        <h1 className="text-3xl font-bold">Lacak Pesanan</h1>
        <p className="text-gray-600">Order #{order.id}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3 space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Status Pesanan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-start md:items-center bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-4 md:mb-0 md:mr-6">
                  <div className="rounded-full p-3 bg-white border">
                    <StatusIcon className="h-8 w-8" />
                  </div>
                </div>
                <div className="flex-grow">
                  <Badge className={`${statusInfo[order.status as keyof typeof statusInfo]?.color} border mb-2`}>
                    {statusInfo[order.status as keyof typeof statusInfo]?.label || 'Status tidak diketahui'}
                  </Badge>
                  <p className="text-gray-600">
                    {order.status === 'pending' && 'Pesanan Anda telah diterima dan sedang menunggu proses.'}
                    {order.status === 'processing' && 'Pesanan Anda sedang diproses oleh tim kami.'}
                    {order.status === 'completed' && 'Pesanan Anda telah selesai dan siap untuk diambil atau diantar.'}
                    {order.status === 'delivered' && 'Pesanan Anda telah diantar dan diterima.'}
                    {order.status === 'cancelled' && 'Pesanan Anda telah dibatalkan.'}
                  </p>
                </div>
              </div>
              
              {/* Timeline */}
              <div className="mt-8">
                <h3 className="font-semibold mb-4">Riwayat Status</h3>
                <div className="space-y-4">
                  {order.statusHistory.map((status, index) => (
                    <div key={index} className="relative pl-6 pb-4 border-l border-gray-200">
                      <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-blue-600"></div>
                      <p className="font-medium">{status.note}</p>
                      <p className="text-sm text-gray-500">{formatDateTime(status.timestamp)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Order Details Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Detail Pesanan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Tanggal Pengambilan</h3>
                    <p className="flex items-center">
                      <CalendarClock className="h-4 w-4 mr-1 text-gray-400" />
                      {formatDate(order.pickupDate)}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Estimasi Selesai</h3>
                    <p className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-gray-400" />
                      {formatDate(order.estimatedCompletionDate)}
                    </p>
                  </div>
                  
                  {order.isDelivery && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Tanggal Pengiriman</h3>
                      <p className="flex items-center">
                        <Truck className="h-4 w-4 mr-1 text-gray-400" />
                        {formatDate(order.deliveryDate)}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Layanan</h3>
                  <div className="space-y-2">
                    {order.services.map((service, index) => (
                      <div key={index} className="flex justify-between py-2 border-b border-gray-100">
                        <div>
                          <p className="font-medium">{service.name}</p>
                          <p className="text-sm text-gray-500">Qty: {service.quantity}</p>
                        </div>
                        <p className="font-medium">Rp {service.total.toLocaleString()}</p>
                      </div>
                    ))}
                    
                    <div className="flex justify-between py-2 font-semibold">
                      <p>Total</p>
                      <p>Rp {order.totalAmount.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                
                {order.notes && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-2">Catatan</h3>
                    <p className="text-gray-600">{order.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Customer Info Sidebar */}
        <div>
          <Card className="sticky top-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Informasi Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Nama</h3>
                <p className="flex items-center font-medium">
                  <User className="h-4 w-4 mr-1 text-gray-400" />
                  {order.customerName}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Telepon</h3>
                <p className="flex items-center font-medium">
                  <Phone className="h-4 w-4 mr-1 text-gray-400" />
                  {order.phoneNumber.substring(0, order.phoneNumber.length - 4)}XXXX
                </p>
              </div>
              
              {order.isDelivery && order.address && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Alamat Pengiriman</h3>
                  <p className="flex items-start font-medium">
                    <MapPin className="h-4 w-4 mr-1 text-gray-400 mt-1 flex-shrink-0" />
                    {order.address}
                  </p>
                </div>
              )}
              
              <div className="pt-4 border-t">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.print()}
                >
                  <ClipboardList className="mr-2 h-4 w-4" />
                  Cetak Detail
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 