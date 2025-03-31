'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import OrderStepperMobile, { ORDER_STEPS } from './OrderStepperMobile';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import CustomerSelection from './steps/CustomerSelection';
import ServiceSelection from './steps/ServiceSelection';
import OrderDetails from './steps/OrderDetails';
import OrderConfirmation from './steps/OrderConfirmation';
import PaymentStep from './steps/PaymentStep';
import OrderComplete from './steps/OrderComplete';
import { useToast } from '@/components/ui/use-toast';

export default function OrderFlowMobile() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [orderData, setOrderData] = useState<any>({
    customer: null,
    items: [],
    notes: '',
    specialRequirements: '',
    totalAmount: 0,
    totalWeight: 0,
    status: 'new'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  // Check if the current step is valid to proceed
  const canProceed = () => {
    switch (currentStep) {
      case 0: // Customer selection
        return !!orderData.customer;
      case 1: // Service selection
        return orderData.items && orderData.items.length > 0;
      case 2: // Order details
        return orderData.totalAmount > 0;
      case 3: // Confirmation
        return true;
      case 4: // Payment
        return true;
      default:
        return false;
    }
  };

  // Handle moving to the next step
  const handleNext = async () => {
    if (currentStep === 3) {
      // Create order before moving to payment
      await createOrder();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  // Handle moving to the previous step
  const handleBack = () => {
    if (currentStep === 0) {
      // Go back to the orders list
      router.push('/orders');
    } else {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Create order in the backend
  const createOrder = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: orderData.customer.id,
          items: orderData.items.map((item: any) => ({
            serviceId: item.serviceId,
            quantity: item.quantity,
            weight: item.weight
          })),
          notes: orderData.notes,
          specialRequirements: orderData.specialRequirements,
          totalAmount: orderData.totalAmount,
          totalWeight: orderData.totalWeight,
          status: 'new'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Order creation failed:', errorData);
        throw new Error(errorData.message || `Failed to create order: ${response.status}`);
      }

      const data = await response.json();
      console.log('Order created:', data);
      
      // Handle different response structures by checking different paths to the order ID
      let orderId = null;
      let orderNumber = null;
      
      if (data?.data?.data?.id) {
        // Nested data.data.id structure
        orderId = data.data.data.id;
        orderNumber = data.data.data.orderNumber || orderId;
      } else if (data?.data?.id) {
        // data.data.id structure
        orderId = data.data.id;
        orderNumber = data.data.orderNumber || orderId;
      } else if (data?.id) {
        // Direct id in response
        orderId = data.id;
        orderNumber = data.orderNumber || orderId;
      }
      
      if (orderId) {
        setCreatedOrderId(orderId);
        toast({
          title: "Order berhasil dibuat",
          description: `Nomor Order: ${orderNumber}`,
        });
        // Move to payment step
        setCurrentStep(prev => prev + 1);
      } else {
        console.error('Could not find order ID in response:', data);
        throw new Error('Invalid response format - Missing order ID');
      }
    } catch (error: any) {
      console.error('Error creating order:', error);
      setError(error.message || 'Failed to create order');
      toast({
        title: "Error",
        description: error.message || 'Gagal membuat order',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update order data
  const updateOrderData = (data: any) => {
    setOrderData((prev: any) => ({ ...prev, ...data }));
  };

  // Render the current step component
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <CustomerSelection 
                orderData={orderData} 
                updateOrderData={updateOrderData} 
               />;
      case 1:
        return <ServiceSelection 
                orderData={orderData} 
                updateOrderData={updateOrderData} 
               />;
      case 2:
        return <OrderDetails 
                orderData={orderData} 
                updateOrderData={updateOrderData} 
               />;
      case 3:
        return <OrderConfirmation 
                orderData={orderData} 
                isLoading={isLoading} 
                error={error} 
               />;
      case 4:
        return <PaymentStep 
                orderId={createdOrderId}
                orderData={orderData}
                onComplete={() => setCurrentStep(5)}
               />;
      case 5:
        return <OrderComplete 
                orderId={createdOrderId}
                orderData={orderData}
               />;
      default:
        return <div>Step not found</div>;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header with stepper */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center justify-between p-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleBack}
            disabled={isLoading}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Buat Pesanan Baru</h1>
          <div className="w-9"></div> {/* Spacer for alignment */}
        </div>
        
        <OrderStepperMobile currentStep={currentStep} />
      </div>
      
      {/* Main content */}
      <div className="flex-1 p-4 pb-24">
        <Card>
          <CardContent className="p-4">
            {renderStep()}
          </CardContent>
        </Card>
      </div>
      
      {/* Footer with navigation buttons */}
      {currentStep < 5 && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 flex space-x-2">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={handleBack}
            disabled={isLoading}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {currentStep === 0 ? 'Kembali' : 'Sebelumnya'}
          </Button>
          
          <Button 
            variant="default" 
            className="flex-1"
            onClick={handleNext}
            disabled={!canProceed() || isLoading}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              <>
                {currentStep === 3 ? 'Buat Pesanan' : 'Selanjutnya'}
                {currentStep === 5 ? <Check className="ml-2 h-4 w-4" /> : <ArrowRight className="ml-2 h-4 w-4" />}
              </>
            )}
          </Button>
        </div>
      )}
      
      {/* Final actions */}
      {currentStep === 5 && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
          <Button 
            variant="default" 
            className="w-full"
            onClick={() => router.push('/orders')}
          >
            Kembali ke Daftar Pesanan
          </Button>
        </div>
      )}
    </div>
  );
} 