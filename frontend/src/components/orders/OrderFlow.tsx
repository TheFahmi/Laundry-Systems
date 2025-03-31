import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import CustomerSelect from './CustomerSelect';
import ServiceSelect from './ServiceSelect';
import OrderSummary from './OrderSummary';
import PaymentStep from './PaymentStep';
import OrderConfirmation from './OrderConfirmation';
import { createAuthHeaders } from '@/lib/api-utils';
import Link from 'next/link';
import PaymentFlow from '@/components/payments/PaymentFlow';
import { Service, ServicePriceModel } from '@/types/service';
import { 
  Card, 
  CardContent, 
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { 
  Button 
} from "@/components/ui/button";
import { 
  Separator 
} from "@/components/ui/separator";
import {
  Alert,
  AlertDescription,
  AlertTitle
} from "@/components/ui/alert";
import {
  Textarea
} from "@/components/ui/textarea";
import {
  Stepper,
  Step,
  StepLabel,
  StepContent
} from "@/components/ui/stepper";
import { Loader2, CheckCircle, Check } from 'lucide-react';
import { Label } from "@/components/ui/label";

// Local interface definitions
interface OrderItem {
  serviceId?: string;
  id?: string;
  serviceName: string;
  quantity: number;
  price: number;
  weightBased?: boolean;
  weight?: number;
  subtotal: number;
  service?: Service;
}

interface PaymentData {
  amount: number;
  change: number;
  method: string;
  status: string;
}

interface OrderFlowProps {
  onComplete?: (orderId: string) => void;
}

export default function OrderFlow({ onComplete }: OrderFlowProps) {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(() => {
    // Try to load saved step from localStorage
    const savedStep = localStorage.getItem('orderActiveStep');
    return savedStep ? parseInt(savedStep, 10) : 0;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [orderData, setOrderData] = useState(() => {
    // Try to load saved order data from localStorage
    const savedOrderData = localStorage.getItem('orderData');
    if (savedOrderData) {
      try {
        return JSON.parse(savedOrderData);
      } catch (e) {
        console.error('Failed to parse saved order data:', e);
      }
    }
    // Default initial state
    return {
      customerId: '',
      customerName: '',
      items: [],
      notes: '',
      total: 0
    };
  });
  const [paymentData, setPaymentData] = useState<PaymentData>(() => {
    // Try to load saved payment data from localStorage
    const savedPaymentData = localStorage.getItem('orderPaymentData');
    if (savedPaymentData) {
      try {
        return JSON.parse(savedPaymentData);
      } catch (e) {
        console.error('Failed to parse saved payment data:', e);
      }
    }
    // Default initial state
    return {
      amount: 0,
      change: 0,
      method: 'cash',
      status: 'pending'
    };
  });
  const [createdOrder, setCreatedOrder] = useState<{
    id: string;
    orderNumber: string;
    createdAt: string;
  } | null>(() => {
    // Try to load saved created order from localStorage
    const savedCreatedOrder = localStorage.getItem('createdOrder');
    if (savedCreatedOrder) {
      try {
        return JSON.parse(savedCreatedOrder);
      } catch (e) {
        console.error('Failed to parse saved created order:', e);
      }
    }
    return null;
  });
  const [skipPayment, setSkipPayment] = useState(() => {
    // Try to load saved skipPayment state from localStorage
    const savedSkipPayment = localStorage.getItem('orderSkipPayment');
    return savedSkipPayment === 'true';
  });

  const steps = ['Pilih Pelanggan', 'Pilih Layanan', 'Detail Pesanan', 'Konfirmasi', 'Pembayaran', 'Selesai'];

  // Add this ref before the useEffect
  const skipPaymentProcessedRef = useRef(false);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('orderActiveStep', activeStep.toString());
    localStorage.setItem('orderData', JSON.stringify(orderData));
    localStorage.setItem('orderPaymentData', JSON.stringify(paymentData));
    localStorage.setItem('orderSkipPayment', skipPayment.toString());
    if (createdOrder) {
      localStorage.setItem('createdOrder', JSON.stringify(createdOrder));
    }
  }, [activeStep, orderData, paymentData, skipPayment, createdOrder]);

  // Clear all order data from localStorage when the component unmounts
  useEffect(() => {
    return () => {
      // Only clear if we're not on the final step
      if (activeStep !== steps.length - 1) {
        // Keep data for now, will be cleared on completion or manual reset
      }
    };
  }, [activeStep, steps.length]);

  // Calculate subtotal correctly for weight-based items
  const calculateSubtotal = (item: OrderItem): number => {
    if (item.weightBased && item.weight !== undefined) {
      // For weight-based items, use weight
      return item.price * item.weight;
    } else {
      // For regular items, use quantity
      return item.price * item.quantity;
    }
  };

  // Calculate total amount considering weightBased items
  const calculateTotal = (items: OrderItem[]): number => {
    console.log("Calculating total from items:", items);
    
    const total = items.reduce((sum, item) => {
      // Use the subtotal directly from each item
      console.log(`Item ${item.serviceName} subtotal: ${item.subtotal}`);
      return sum + (item.subtotal || 0);
    }, 0);

    console.log("Final total:", total);
    return total;
  };

  // Handler untuk pemilihan pelanggan
  const handleCustomerSelect = (customerId: string, customerName: string) => {
    setOrderData((prev: typeof orderData) => ({
      ...prev,
      customerId,
      customerName
    }));
  };

  // Handler untuk pemilihan layanan
  const handleServiceSelect = (items: OrderItem[]) => {
    // Keep the original items data and just ensure subtotal is calculated
    const itemsWithSubtotal = items.map((item: OrderItem) => {
      // Calculate subtotal based on weight or quantity
      const subtotal = item.weightBased && item.weight !== undefined
        ? Math.round(item.price * item.weight)
        : item.price * item.quantity;
      
      console.log(`Calculating subtotal for ${item.serviceName}:`, {
        weightBased: item.weightBased,
        weight: item.weight,
        quantity: item.quantity,
        price: item.price,
        subtotal
      });
      
      return {
        ...item,
        subtotal
      };
    });
    
    const total = calculateTotal(itemsWithSubtotal);
    console.log("Setting order data with total:", total);
    
    setOrderData((prev: typeof orderData) => ({
      ...prev,
      items: itemsWithSubtotal,
      total
    }));
  };

  // Handler untuk detail pesanan
  const handleOrderDetails = (notes: string) => {
    setOrderData((prev: typeof orderData) => ({
      ...prev,
      notes
    }));
  };

  // Handler untuk pembayaran
  const handlePaymentUpdate = (payment: any) => {
    // Ensure compatibility by adding the status property if missing
    const updatedPayment = {
      ...payment,
      status: payment.status || payment.completed || 'pending'
    };
    setPaymentData(updatedPayment);
  };

  // Handler untuk konfirmasi dan submit pesanan
  const handleConfirmOrder = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use the Next.js API proxy instead of direct backend call
      const apiUrl = '/api/orders';
      
      // Process items to include weight for weight-based items
      const processedItems = orderData.items.map((item: OrderItem) => {
        // Base item properties
        const processedItem: any = {
          serviceId: item.serviceId,
          quantity: item.quantity,
          price: item.price
        };
        
        // Add weight property for weight-based items
        if (item.weightBased) {
          processedItem.weightBased = true;
          processedItem.weight = item.weight || 0.5;
          
          // For backend compatibility, we set quantity to 1 for weight-based items
          // but preserve the actual weight in the weight property
          processedItem.quantity = 1;
          
          console.log(`Processing weight-based item: ${item.serviceName}, Weight: ${processedItem.weight}kg`);
        }
        
        return processedItem;
      });
      
      // Use the current skipPayment value from state instead of from deps
      const currentSkipPayment = skipPayment;
      
      // First create the order
      const orderPayload = {
        customerId: orderData.customerId,
        items: processedItems,
        notes: orderData.notes,
        total: calculateTotal(orderData.items)
      };

      console.log('Creating order with payload:', JSON.stringify(orderPayload));

      const orderResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...createAuthHeaders()
        },
        body: JSON.stringify(orderPayload),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json().catch(() => ({}));
        const errorMessage = errorData.message || `Error creating order: ${orderResponse.status}`;
        console.error('API Error:', errorData);
        setError(errorMessage);
        toast.error(errorMessage);
        return;
      }

      const orderResponseData = await orderResponse.json();
      console.log('Order created successfully, raw response:', orderResponseData);
      
      // Extract order data
      let orderResult;
      if (orderResponseData.data) {
        console.log('Response has data property:', orderResponseData.data);
        if (orderResponseData.data.data) {
          orderResult = orderResponseData.data.data;
        } else {
          orderResult = orderResponseData.data;
        }
      } else {
        orderResult = orderResponseData;
      }
      
      console.log('Final extracted order data:', orderResult);
      
      if (!orderResult.id) {
        console.error('Order ID not found in response');
        throw new Error('Order ID not found in response');
      }

      // Clear saved items from localStorage when order is confirmed
      localStorage.removeItem('orderItems');

      // If we're skipping payment, just complete the process
      if (currentSkipPayment) {
        setCreatedOrder({
          id: orderResult.id,
          orderNumber: orderResult.orderNumber || `#${orderResult.id.slice(0, 8)}`,
          createdAt: orderResult.createdAt || new Date().toISOString()
        });
        
        toast.success('Pesanan berhasil dibuat!');
        
        // Go to last step
        setDirection('forward');
        setActiveStep(steps.length - 1);
        
        // Call the callback if provided
        if (onComplete) {
          onComplete(orderResult.id);
        }
        
        // Clear all order state from localStorage on successful order completion
        clearAllOrderState();
        
        return;
      }
      
      // If not skipping payment, proceed to payment step with the order ID
      setOrderData((prev: typeof orderData) => ({
        ...prev,
        orderId: orderResult.id,
        orderNumber: orderResult.orderNumber || `#${orderResult.id.slice(0, 8)}`
      }));
      
      // Then process payment if we're already at the payment step
      if (activeStep === 4) {
        try {
          // Log payment data debugging info
          console.log('Payment data before creating payment:', JSON.stringify(paymentData));
          console.log('Order total for reference:', orderData.total);
          
          // Create payment with the order ID
          const paymentPayload = {
            orderId: orderResult.id,
            paymentMethod: paymentData.method === 'cash' ? 'cash' : 
                          paymentData.method === 'transfer' ? 'bank_transfer' : 
                          paymentData.method === 'qris' ? 'ewallet' : 'other',
            amount: Number(paymentData.amount) || orderData.total,
            referenceNumber: `REF-${Date.now()}`,
            status: 'completed'
          };

          console.log('Creating payment with payload:', paymentPayload);

          const paymentsResponse = await fetch('/api/payments', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...createAuthHeaders()
            },
            body: JSON.stringify(paymentPayload),
          });

          if (!paymentsResponse.ok) {
            const errorData = await paymentsResponse.json();
            console.error('Payment API error:', errorData);
            throw new Error(errorData.message || `Error creating payment: ${paymentsResponse.status}`);
          }

          const paymentResult = await paymentsResponse.json();
          console.log('Payment created:', paymentResult);
          
          // Update payment data with completed status
          setPaymentData((prev: PaymentData) => ({
            ...prev,
            status: 'completed'
          }));
          
          // Go to completion step
          setCreatedOrder({
            id: orderResult.id,
            orderNumber: orderResult.orderNumber || `#${orderResult.id.slice(0, 8)}`,
            createdAt: orderResult.createdAt || new Date().toISOString()
          });
          
          toast.success('Pembayaran berhasil!');
          setDirection('forward');
          setActiveStep(steps.length - 1);
          
          // Call the callback if provided
          if (onComplete) {
            onComplete(orderResult.id);
          }
        } catch (paymentError: any) {
          console.error('Payment creation failed:', paymentError);
          throw new Error(`Pembayaran gagal: ${paymentError.message}`);
        }
      } else {
        // If we're just confirming the order, go to payment step
        setDirection('forward');
        handleNext();
      }
    } catch (error: any) {
      console.error('Error in process:', error);
      const errorMessage = error.message || 'Terjadi kesalahan. Silakan coba lagi.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderData, paymentData, steps.length, onComplete, calculateTotal, activeStep]);

  const handleNext = useCallback(() => {
    console.log("Moving to next step");
    
    // When moving to payment step (index 4), initialize payment amount with order total
    if (activeStep === 3) {
      setPaymentData((prev: PaymentData) => ({
        ...prev,
        amount: orderData.total,
        change: 0
      }));
    }
    
    setDirection('forward');
    setActiveStep((prevActiveStep: number) => {
      console.log("Updating activeStep from", prevActiveStep, "to", prevActiveStep + 1);
      return prevActiveStep + 1;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStep, orderData.total]);

  const handleBack = () => {
    console.log("Moving back from step", activeStep, "to", activeStep - 1);
    setDirection('backward');
    setActiveStep((prevActiveStep: number) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setDirection('backward');
    setActiveStep(0);
    setOrderData({
      customerId: '',
      customerName: '',
      items: [],
      notes: '',
      total: 0
    });
    setPaymentData({
      amount: 0,
      change: 0,
      method: 'cash',
      status: 'pending'
    });
    setCreatedOrder(null);
    setError(null);
    
    // Clear all order state from localStorage when starting a new order
    clearAllOrderState();
  };

  // Add useEffect to handle skipPayment changes - moved after function definitions
  useEffect(() => {
    // Only update UI elements based on skipPayment, don't auto-proceed
    if (activeStep === 3 && skipPayment) {
      // Don't auto-proceed, just update the UI
      skipPaymentProcessedRef.current = true;
    } else if (activeStep === 3 && !skipPayment) {
      // Reset the ref when skipPayment is false
      skipPaymentProcessedRef.current = false;
    }
  // Only depend on these two values
  }, [activeStep, skipPayment]);

  const handleSkipPaymentChange = useCallback((skip: boolean) => {
    // Just update the state without triggering any automatic transitions
    setSkipPayment(skip);
  }, []);

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <div>
            <CustomerSelect 
              onSelectCustomer={(id, name) => {
                setOrderData((prev: typeof orderData) => ({
                  ...prev,
                  customerId: id,
                  customerName: name
                }));
              }}
              selectedCustomerId={orderData.customerId}
            />
            <div className="flex justify-end mt-6">
              <Button 
                onClick={handleNext}
                disabled={!orderData.customerId}
                className="transition-all"
              >
                Lanjutkan
              </Button>
            </div>
          </div>
        );
      case 1:
        return (
          <div>
            <ServiceSelect 
              onSelectServices={(items) => {
                const total = calculateTotal(items);
                setOrderData((prev: typeof orderData) => ({
                  ...prev,
                  items,
                  total
                }));
              }} 
            />
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={handleBack}>
                Kembali
              </Button>
              <Button 
                onClick={handleNext}
                disabled={orderData.items.length === 0}
              >
                Lanjutkan
              </Button>
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            <div className="space-y-6">
              <OrderSummary 
                customerName={orderData.customerName}
                items={orderData.items}
                total={orderData.total}
              />
              <Separator />
              <div>
                <Label htmlFor="order-notes">Catatan Pesanan</Label>
                <Textarea
                  id="order-notes"
                  className="w-full mt-2"
                  placeholder="Catatan tambahan untuk pesanan (opsional)"
                  value={orderData.notes}
                  onChange={(e) => setOrderData((prev: typeof orderData) => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={handleBack}>
                Kembali
              </Button>
              <Button onClick={() => {
                // Update notes first
                handleOrderDetails(orderData.notes);
                // Then go to next step explicitly
                handleNext();
              }}>
                Lanjutkan
              </Button>
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <OrderConfirmation
              orderData={orderData}
              onConfirm={() => {
                // If skipPayment is true, create the order directly
                if (skipPayment) {
                  handleConfirmOrder();
                } else {
                  // Otherwise, proceed to payment step
                  handleNext();
                }
              }}
              onBack={handleBack}
              isLoading={isLoading}
              onSkipPayment={handleSkipPaymentChange}
              confirmButtonText={skipPayment ? "Buat Pesanan" : "Lanjut ke Pembayaran"}
            />
          </div>
        );
      case 4:
        return (
          <div>
            <PaymentStep
              total={orderData.total}
              onPaymentUpdate={handlePaymentUpdate}
              onProcessPayment={handleConfirmOrder}
              onBack={handleBack}
              isLoading={isLoading}
              autoProcess={false}
            />
          </div>
        );
      case 5:
        return (
          <div>
            <div className="space-y-4">
              <div className="flex justify-center pb-4">
                <div className="rounded-full bg-green-50 p-3">
                  <CheckCircle className="h-10 w-10 text-green-500" />
                </div>
              </div>
              
              {createdOrder && (
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-semibold">Pesanan #{createdOrder.orderNumber}</h3>
                  <p className="text-muted-foreground">
                    Dibuat pada: {new Date(createdOrder.createdAt).toLocaleString('id-ID')}
                  </p>
                </div>
              )}
              
              <Alert>
                <AlertTitle>Berhasil!</AlertTitle>
                <AlertDescription>
                  Pesanan telah berhasil dibuat. Anda dapat melanjutkan dengan proses laundry.
                </AlertDescription>
              </Alert>
              
              {createdOrder && (
                <div className="flex justify-center mt-2">
                  <Button 
                    variant="outline" 
                    onClick={() => window.open(`/invoices/${createdOrder.id}/print`, '_blank')}
                    className="flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-printer">
                      <polyline points="6 9 6 2 18 2 18 9"></polyline>
                      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                      <rect width="12" height="8" x="6" y="14"></rect>
                    </svg>
                    Cetak Struk
                  </Button>
                </div>
              )}
              
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={handleReset}>
                  Buat Pesanan Baru
                </Button>
                {createdOrder && (
                  <Link href={`/orders/${createdOrder.id}`}>
                    <Button>
                      Lihat Detail Pesanan
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        );
      default:
        return 'Unknown step';
    }
  };

  // Helper function to get animation class based on direction
  const getAnimationClass = () => {
    return direction === 'forward' ? 'slide-in-right' : 'slide-in-left';
  };

  // Function to clear all order state from localStorage
  const clearAllOrderState = () => {
    localStorage.removeItem('orderActiveStep');
    localStorage.removeItem('orderData');
    localStorage.removeItem('orderPaymentData');
    localStorage.removeItem('orderItems');
    localStorage.removeItem('orderSkipPayment');
    localStorage.removeItem('createdOrder');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          {/* Horizontal step indicator */}
          <div className="mb-12 px-4 relative">
            {/* Debug indicator for active step (only visible in development) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="absolute top-[-16px] text-xs text-gray-500 w-full text-center">
                Step: {activeStep + 1}/{steps.length} ({(activeStep / (steps.length - 1) * 100).toFixed(1)}%)
              </div>
            )}
            
            {/* Background connecting line */}
            <div 
              className="absolute h-[2px] bg-muted-foreground/20" 
              style={{ left: 'calc(100% / 12)', right: 'calc(100% / 12)', top: '17px' }} 
            />
            
            {/* Active connecting line */}
            <div 
              className="absolute h-[2px] bg-primary" 
              style={{ 
                left: 'calc(100% / 12)', 
                width: activeStep === 0 
                  ? '0px' 
                  : `calc((100% - (100% / 6)) * ${activeStep / (steps.length - 1)})`,
                top: '17px',
                transition: 'width 0.4s ease-in-out',
              }}
            />
            
            <div className="flex justify-between">
              {steps.map((label, index) => (
                <div 
                  key={`step-${index}`}
                  className="flex flex-col items-center"
                  style={{ width: `${100/steps.length}%` }}
                >
                  {/* Step circle */}
                  <div 
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 z-10 bg-background ${
                      activeStep > index
                        ? 'bg-primary border-primary text-primary-foreground'
                        : activeStep === index
                          ? 'border-primary text-primary bg-background' 
                          : 'border-muted-foreground/30 text-muted-foreground/50 bg-background'
                    }`}
                  >
                    {activeStep > index ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <span className="text-xs">{index + 1}</span>
                    )}
                  </div>
                  
                  {/* Step label */}
                  <div className="mt-2 text-center w-full px-1">
                    <span 
                      className={`text-xs font-medium ${
                        activeStep >= index 
                          ? 'text-foreground' 
                          : 'text-muted-foreground/50'
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Only render the current step content */}
          <div className="mt-6 pb-4 transition-all duration-300 ease-in-out overflow-hidden">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold">{steps[activeStep]}</h2>
              <p className="text-muted-foreground">
                {activeStep === 0 && "Pilih pelanggan yang akan membuat pesanan"}
                {activeStep === 1 && "Pilih layanan dan tentukan jumlah"}
                {activeStep === 2 && "Tambahkan catatan untuk pesanan ini"}
                {activeStep === 3 && "Tinjau dan konfirmasi pesanan"}
                {activeStep === 4 && "Masukkan informasi pembayaran"}
                {activeStep === 5 && "Pesanan berhasil dibuat"}
              </p>
            </div>
            <div className={getAnimationClass()}>
              {getStepContent(activeStep)}
            </div>
          </div>
          
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 