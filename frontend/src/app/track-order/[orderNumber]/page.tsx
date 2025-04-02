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
import { OrderService, TrackOrderResponse } from '@/services/order.service';

const statusInfo = {
  new: { 
    label: 'New Order', 
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: Clock
  },
  processing: { 
    label: 'Processing', 
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Package
  },
  washing: { 
    label: 'Washing', 
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Package
  },
  drying: { 
    label: 'Drying', 
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Package
  },
  folding: { 
    label: 'Folding', 
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: Package
  },
  ready: { 
    label: 'Ready for Pickup', 
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle2
  },
  delivered: { 
    label: 'Delivered', 
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: Truck
  },
  cancelled: { 
    label: 'Cancelled', 
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: AlertCircle
  }
};

const paymentStatusInfo = {
  pending: {
    label: 'Not Paid',
    color: 'bg-red-100 text-red-800 border-red-200'
  },
  partial: {
    label: 'Partially Paid',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  },
  completed: {
    label: 'Paid',
    color: 'bg-green-100 text-green-800 border-green-200'
  }
};

export default function TrackOrderPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderNumber = params?.orderNumber as string || '';
  const verifyDigits = searchParams?.get('verify') || '';
  
  const [order, setOrder] = useState<TrackOrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Validate that we have verification digits
    if (!verifyDigits || verifyDigits.length !== 4) {
      setError('Invalid verification');
      setLoading(false);
      return;
    }

    // Fetch order data from API
    const fetchOrder = async () => {
      try {
        const orderData = await OrderService.trackOrder(orderNumber);
        setOrder(orderData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load order data. Please check your order number.');
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderNumber, verifyDigits]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not specified';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
            Back to Home
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
            Back to Home
          </Button>
        </div>
        
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
              <p className="text-gray-600 mb-6">
                {error || 'Order not found or verification failed'}
              </p>
              <Button onClick={() => router.push('/')}>
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const StatusIcon = statusInfo[order.status as keyof typeof statusInfo]?.icon || Clock;
  const statusLabel = statusInfo[order.status as keyof typeof statusInfo]?.label || 'Unknown Status';
  const statusColor = statusInfo[order.status as keyof typeof statusInfo]?.color || 'bg-gray-100 text-gray-800';
  
  const paymentStatusLabel = paymentStatusInfo[order.paymentStatus as keyof typeof paymentStatusInfo]?.label || 'Unknown';
  const paymentStatusColor = paymentStatusInfo[order.paymentStatus as keyof typeof paymentStatusInfo]?.color || 'bg-gray-100 text-gray-800';

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => router.push('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
        <h1 className="text-3xl font-bold">{order.orderNumber}</h1>
        <p className="text-gray-500">Order Status Tracker</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3 space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">Current Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className={`rounded-full p-3 ${statusColor.split(' ')[0]}`}>
                  <StatusIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <Badge className={statusColor}>
                    {statusLabel}
                  </Badge>
                  <p className="text-sm text-gray-500 mt-1">
                    Last updated: {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute left-4 top-0 h-full w-px bg-gray-200"></div>
                  
                  <div className="space-y-6 relative">
                    <div className="flex">
                      <div className="flex-shrink-0 z-10">
                        <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                          <CheckCircle2 className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-sm font-medium">Order Created</h3>
                        <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <div className="flex-shrink-0 z-10">
                        <div className={`h-8 w-8 rounded-full ${order.status !== 'new' ? 'bg-green-500' : 'bg-gray-200'} flex items-center justify-center`}>
                          {order.status !== 'new' ? (
                            <CheckCircle2 className="h-4 w-4 text-white" />
                          ) : (
                            <Clock className="h-4 w-4 text-white" />
                          )}
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-sm font-medium">Processing</h3>
                        <p className="text-xs text-gray-500">
                          {order.status !== 'new' ? 'Processing started' : 'Waiting for processing'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <div className="flex-shrink-0 z-10">
                        <div className={`h-8 w-8 rounded-full ${order.status === 'ready' || order.status === 'delivered' ? 'bg-green-500' : 'bg-gray-200'} flex items-center justify-center`}>
                          {order.status === 'ready' || order.status === 'delivered' ? (
                            <CheckCircle2 className="h-4 w-4 text-white" />
                          ) : (
                            <Package className="h-4 w-4 text-white" />
                          )}
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-sm font-medium">Ready for Pickup/Delivery</h3>
                        <p className="text-xs text-gray-500">
                          {order.status === 'ready' || order.status === 'delivered' ? 
                            'Your order is ready' : 
                            'Estimated: ' + (order.deliveryDate ? formatDate(order.deliveryDate) : 'To be determined')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <div className="flex-shrink-0 z-10">
                        <div className={`h-8 w-8 rounded-full ${order.status === 'delivered' ? 'bg-green-500' : 'bg-gray-200'} flex items-center justify-center`}>
                          {order.status === 'delivered' ? (
                            <CheckCircle2 className="h-4 w-4 text-white" />
                          ) : (
                            <Truck className="h-4 w-4 text-white" />
                          )}
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-sm font-medium">Delivered/Picked Up</h3>
                        <p className="text-xs text-gray-500">
                          {order.status === 'delivered' ? 'Completed' : 'Pending'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          {/* Order Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Customer</h3>
                <p className="font-medium">{order.customerName}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Order Number</h3>
                <p className="font-medium">{order.orderNumber}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Date Created</h3>
                <p className="font-medium">{formatDate(order.createdAt)}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Expected Delivery</h3>
                <p className="font-medium">{order.deliveryDate ? formatDate(order.deliveryDate) : 'Not scheduled'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Total Amount</h3>
                <p className="font-medium">${order.totalAmount.toFixed(2)}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Payment Status</h3>
                <Badge className={paymentStatusColor}>
                  {paymentStatusLabel}
                </Badge>
              </div>
              
              <div className="pt-4">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.location.href = `tel:+1234567890`}
                >
                  <Phone className="mr-2 h-4 w-4" />
                  Contact Us
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 