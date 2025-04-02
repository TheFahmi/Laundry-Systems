'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Check, User, ShoppingCart, ClipboardCheck, CreditCard, CheckCircle } from 'lucide-react';
import CustomerSelection from './steps/CustomerSelection';
import ServiceSelection from './steps/ServiceSelection';
import OrderDetails from './steps/OrderDetails';
import OrderConfirmation from './steps/OrderConfirmation';
import PaymentStep from './steps/PaymentStep';
import OrderComplete from './steps/OrderComplete';
import { useToast } from '@/components/ui/use-toast';
import { Order, OrderStatus, createOrder as apiCreateOrder } from '@/api/orders';
import { toast } from 'sonner';

export default function OrderFlowMobile() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [orderData, setOrderData] = useState<any>({
    customerId: null,
    customer: null,
    items: [],
    totalAmount: 0,
    notes: '',
    isDeliveryNeeded: false,
    pickupDate: undefined,
    deliveryDate: undefined,
    specialRequirements: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);

  // Define the step titles with combined first step
  const stepTitles = ['Informasi Pelanggan', 'Detail Pesanan', 'Konfirmasi', 'Pembayaran', 'Selesai'];
  
  // Define icons for each step
  const stepIcons = [
    <User className="h-4 w-4" key="user" />,
    <ShoppingCart className="h-4 w-4" key="cart" />,
    <ClipboardCheck className="h-4 w-4" key="clipboard" />,
    <CreditCard className="h-4 w-4" key="payment" />,
    <CheckCircle className="h-4 w-4" key="complete" />
  ];

  // Update the currentStepTitle function to use the new titles
  const currentStepTitle = () => {
    switch (currentStep) {
      case 0:
        return 'Informasi Pelanggan';
      case 1:
        return 'Detail Pesanan';
      case 2:
        return 'Konfirmasi';
      case 3:
        return 'Pembayaran';
      case 4:
        return 'Pesanan Selesai';
      default:
        return 'Buat Pesanan';
    }
  }
  
  // Get step description based on current step
  const currentStepDescription = () => {
    switch (currentStep) {
      case 0:
        return 'Pilih pelanggan yang akan membuat pesanan';
      case 1:
        return 'Pilih layanan dan tentukan jumlah';
      case 2:
        return 'Tinjau dan konfirmasi pesanan';
      case 3:
        return 'Masukkan informasi pembayaran';
      case 4:
        return 'Pesanan berhasil dibuat';
      default:
        return '';
    }
  }
  
  // Update the canProceed function to check for customer selection and services in step 0
  const canProceed = () => {
    switch (currentStep) {
      case 0:
        // Need both customer and at least one service
        return orderData.customerId && orderData.items && orderData.items.length > 0;
      case 1:
        // Delivery date or pickup date selection
        return orderData.isDeliveryNeeded
          ? !!orderData.deliveryDate
          : !!orderData.pickupDate;
      case 2:
        // Always can proceed from confirmation
        return true;
      case 3:
        // Payment data is set
        return isProcessingPayment || isPaymentComplete;
      default:
        return true;
    }
  };

  // Handle moving to the next step
  const handleNext = async () => {
    if (currentStep === 2) {
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
      // Cap weights at 200kg maximum and update totals
      let recalculatedTotal = false;
      const cappedItems = orderData.items.map((item: any) => {
        if (item.weightBased && item.weight && item.weight > 200) {
          // Create a new copy with capped weight
          const cappedItem = { ...item, weight: 200 };
          // Recalculate subtotal if needed
          if (item.price) {
            cappedItem.subtotal = cappedItem.price * cappedItem.weight;
          }
          recalculatedTotal = true;
          return cappedItem;
        }
        return item;
      });
      
      // If we capped any weights, update the order data
      if (recalculatedTotal) {
        // Recalculate total
        const newTotal = cappedItems.reduce((sum: number, item: any) => {
          return sum + (item.subtotal || 0);
        }, 0);
        
        setOrderData((prev: any) => ({
          ...prev,
          items: cappedItems,
          totalAmount: newTotal
        }));
        
        toast({
          title: "Perhatian",
          description: "Beberapa item berat lebih dari 200kg. Berat telah diubah menjadi maksimum 200kg per item.",
          variant: "destructive",
        });
        
        // Short delay to let the user see the toast
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      // Validate and adjust delivery date if needed
      if (orderData.isDeliveryNeeded && orderData.pickupDate && orderData.deliveryDate) {
        const pickupDate = new Date(orderData.pickupDate);
        const deliveryDate = new Date(orderData.deliveryDate);
        const diffTime = Math.abs(deliveryDate.getTime() - pickupDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 14) {
          // Adjust the delivery date to be 14 days after pickup
          const newDeliveryDate = new Date(pickupDate);
          newDeliveryDate.setDate(pickupDate.getDate() + 14);
          
          setOrderData((prev: any) => ({
            ...prev,
            deliveryDate: newDeliveryDate.toISOString()
          }));
          
          toast({
            title: "Penyesuaian Tanggal",
            description: "Tanggal pengiriman telah disesuaikan menjadi maksimum 14 hari setelah pengambilan.",
            variant: "default",
          });
          
          // Short delay to let the user see the toast
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }

      // Prepare order data
      const orderPayload = {
        customerId: orderData.customer.id,
        items: (recalculatedTotal ? cappedItems : orderData.items).map((item: any) => ({
          serviceId: item.serviceId,
          quantity: item.quantity,
          price: item.price,
          weightBased: item.weightBased,
          weight: item.weight
        })),
        notes: orderData.notes,
        specialRequirements: orderData.specialRequirements,
        totalWeight: orderData.totalWeight || 0,
        pickupDate: orderData.pickupDate,
        deliveryDate: orderData.deliveryDate,
        status: OrderStatus.NEW
      };

      // Use the imported API function
      const response = await apiCreateOrder(orderPayload);
      
      // Extract the order ID from the nested response structure
      let orderId, orderNumber;
      
      // Since our API response may have different structures, check all possibilities
      // Type cast the response to any to handle potential nested structures
      const responseAny = response as any;
      
      if (responseAny.data?.data?.id) {
        // Nested data.data structure (as in the example response)
        orderId = responseAny.data.data.id;
        orderNumber = responseAny.data.data.orderNumber || orderId;
      } else if (responseAny.data?.id) {
        // data structure
        orderId = responseAny.data.id;
        orderNumber = responseAny.data.orderNumber || orderId;
      } else if (responseAny.id) {
        // Direct response (as expected by the Order interface)
        orderId = responseAny.id;
        orderNumber = responseAny.orderNumber || orderId;
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
        // Log the response structure to help with debugging
        console.error('Could not find order ID in response. Response structure:', 
          JSON.stringify(response, null, 2)
        );
        
        // Attempt to extract any possible error message
        const errorMsg = 
          responseAny.message || 
          responseAny.data?.message || 
          responseAny.data?.data?.message || 
          'Invalid response format - Missing order ID';
        
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      console.error('Error creating order:', error);
      // If the error has a response property (axios error), log it
      if (error.response) {
        console.error('Server response:', error.response.data);
      }
      
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

  // Update order data with improved structure to prevent infinite loops
  const updateOrderData = useCallback((data: any) => {
    // Skip empty updates
    if (!data || Object.keys(data).length === 0) return;

    setOrderData((prev: typeof orderData) => {
      // Create a new state object
      const newState = { ...prev };
      
      // Handle customer and customerId updates carefully
      if ('customer' in data || 'customerId' in data) {
        // Only update if values are different
        if (data.customerId && data.customerId !== prev.customerId) {
          newState.customerId = data.customerId;
        }
        
        if (data.customer && 
            (!prev.customer || data.customer.id !== prev.customer.id)) {
          newState.customer = data.customer;
        }
        
        // Remove these properties from data to avoid double-processing
        const updatedData = { ...data };
        delete updatedData.customer;
        delete updatedData.customerId;
        
        // Add remaining properties
        return { ...newState, ...updatedData };
      }
      
      // For all other updates, just merge
      return { ...prev, ...data };
    });
  }, []);

  // Render the current step component
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            {/* Customer Selection Section */}
            <div className="mb-6">
              <h3 className="text-base font-semibold mb-3">Pilih Pelanggan</h3>
              <CustomerSelection 
                orderData={orderData} 
                updateOrderData={updateOrderData} 
              />
            </div>
            
            {/* Service Selection Section - Only active if customer is selected */}
            <div className={!orderData.customerId ? "opacity-50" : ""}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold">Pilih Layanan</h3>
                {!orderData.customerId && (
                  <span className="text-xs text-orange-500">
                    Pilih pelanggan terlebih dahulu
                  </span>
                )}
              </div>
              
              {orderData.customerId ? (
                <ServiceSelection 
                  orderData={orderData} 
                  updateOrderData={updateOrderData} 
                />
              ) : (
                <div className="p-6 text-center bg-gray-50 border border-dashed rounded-lg text-sm">
                  <p className="text-muted-foreground">Silakan pilih pelanggan terlebih dahulu untuk menampilkan layanan.</p>
                </div>
              )}
            </div>
          </div>
        );
      case 1:
        return <OrderDetails 
                orderData={orderData} 
                updateOrderData={updateOrderData} 
               />;
      case 2:
        return <OrderConfirmation 
                orderData={orderData} 
                isLoading={isLoading} 
                error={error} 
               />;
      case 3:
        return <PaymentStep 
                orderId={createdOrderId}
                orderData={orderData}
                onComplete={() => setCurrentStep(4)}
                onPaymentComplete={(paymentStatus) => {
                  // Update orderData berdasarkan status pembayaran
                  setOrderData(prev => ({
                    ...prev,
                    isPaid: paymentStatus === 'completed',
                    paymentStatus: paymentStatus === 'completed' ? 'paid' : 'pending'
                  }));
                }}
               />;
      case 4:
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
          <div className="flex flex-col items-center">
            <h1 className="text-lg font-semibold">{currentStepTitle()}</h1>
            <p className="text-xs text-muted-foreground mt-1">{currentStepDescription()}</p>
          </div>
          <div className="w-9"></div> {/* Spacer for alignment */}
        </div>
        
        {/* Horizontal Stepper */}
        <div className="px-4 pb-2">
          <div className="flex justify-between items-center relative">
            {/* Connector lines first (in the background) */}
            {/* <div className="absolute h-0.5 bg-gray-200 left-0 right-0 top-1/2 transform -translate-y-1/2 -z-10"></div> */}
            
            {/* Colored progress line */}
            {/* <div 
              className="absolute h-0.5 bg-blue-500 left-0 top-1/2 transform -translate-y-1/2 -z-10 transition-all duration-300"
              style={{
                width: `${(currentStep / (stepTitles.length - 1)) * 100}%`
              }}
            ></div> */}
            
            {/* Stepper circles */}
            {stepTitles.map((title, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div 
                  className={`flex items-center justify-center w-7 h-7 rounded-full mb-1 transition-colors duration-300 ${
                    idx < currentStep 
                      ? 'bg-green-500 text-white' 
                      : idx === currentStep 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {idx < currentStep ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    stepIcons[idx]
                  )}
                </div>
                <span className="text-xs text-center truncate w-16">
                  {title.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>
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
      {currentStep < 4 && (
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
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
} 